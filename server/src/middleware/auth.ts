import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload, UserRole } from '../services/jwt.js';

/**
 * Extract token from Authorization header
 */
function extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;

    // Support both "Bearer <token>" and just "<token>"
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return authHeader;
}

/**
 * Authentication middleware - verifies JWT token
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    try {
        // Try to get token from Authorization header first
        let token = extractTokenFromHeader(req.headers.authorization);

        // If not found in header, try cookies
        if (!token && req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        // If still no token, return unauthorized
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token required',
                code: 'NO_TOKEN'
            });
            return;
        }

        // Verify the token
        const decoded = verifyToken(token);

        // Add user data to request object
        req.user = decoded;

        next();
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid token';

        // Handle different token errors
        if (message === 'Token expired') {
            res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        } else if (message === 'Invalid token') {
            res.status(401).json({
                success: false,
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Authentication failed',
                code: 'AUTH_FAILED'
            });
        }
    }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        // First check if user is authenticated
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'NO_AUTH'
            });
            return;
        }

        // Check if user has required role
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
            return;
        }

        next();
    };
}

/**
 * Department-based authorization middleware
 */
export function requireSameDepartment(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
            code: 'NO_AUTH'
        });
        return;
    }

    // Extract department from request params or body
    const targetDepartment = req.params.department || req.body.department;

    if (!targetDepartment) {
        res.status(400).json({
            success: false,
            message: 'Department information required',
            code: 'NO_DEPARTMENT'
        });
        return;
    }

    // Allow ADMIN and DEAN to access any department
    if (req.user.role === 'ADMIN' || req.user.role === 'DEAN') {
        next();
        return;
    }

    // Check if user belongs to the same department
    if (req.user.department !== targetDepartment) {
        res.status(403).json({
            success: false,
            message: 'Access denied: Different department',
            code: 'DEPARTMENT_MISMATCH'
        });
        return;
    }

    next();
}

/**
 * Self or admin access middleware (user can access their own data or admin can access anyone's)
 */
export function requireSelfOrAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
            code: 'NO_AUTH'
        });
        return;
    }

    const targetUserId = req.params.userId || req.params.id;

    if (!targetUserId) {
        res.status(400).json({
            success: false,
            message: 'User ID required',
            code: 'NO_USER_ID'
        });
        return;
    }

    // Allow if it's the same user or if user is admin
    if (req.user.userId === targetUserId || req.user.role === 'ADMIN') {
        next();
        return;
    }

    res.status(403).json({
        success: false,
        message: 'Access denied: Can only access own data',
        code: 'SELF_ACCESS_ONLY'
    });
}

/**
 * Optional authentication middleware - adds user to request if token is valid, but doesn't require it
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
    try {
        let token = extractTokenFromHeader(req.headers.authorization);

        if (!token && req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (token) {
            const decoded = verifyToken(token);
            req.user = decoded;
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user (optional auth)
        next();
    }
}