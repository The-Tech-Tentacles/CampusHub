import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { jwtConfig } from '../config';
import type { User } from '../../shared/schema';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: User;
            userId?: string;
        }
    }
}

export interface AuthRequest extends Request {
    user: User;
    userId: string;
}

// Generate JWT token
export const generateToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        jwtConfig.secret,
        {
            expiresIn: jwtConfig.accessTokenExpiresIn
        } as jwt.SignOptions
    );
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        { userId, type: 'refresh' },
        jwtConfig.secret,
        {
            expiresIn: jwtConfig.refreshTokenExpiresIn
        } as jwt.SignOptions
    );
};

// Verify JWT token
export const verifyToken = (token: string): { userId: string } | null => {
    try {
        const decoded = jwt.verify(token, jwtConfig.secret) as { userId: string };
        return decoded;
    } catch (error) {
        return null;
    }
};

// Authentication middleware
export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            res.status(401).json({
                error: 'Access token required',
                code: 'TOKEN_MISSING'
            });
            return;
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            res.status(403).json({
                error: 'Invalid or expired token',
                code: 'TOKEN_INVALID'
            });
            return;
        }

        // Get user from database
        const user = await userService.getUser(decoded.userId);
        if (!user) {
            res.status(403).json({
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        if (!user.isActive) {
            res.status(403).json({
                error: 'Account is deactivated',
                code: 'ACCOUNT_DEACTIVATED'
            });
            return;
        }

        // Add user to request
        req.user = user;
        req.userId = user.id;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            error: 'Authentication failed',
            code: 'AUTH_ERROR'
        });
    }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: allowedRoles,
                current: req.user.role
            });
            return;
        }

        next();
    };
};

// Admin role middleware
export const requireAdmin = requireRole(['ADMIN']);

// Faculty or higher middleware
export const requireFaculty = requireRole(['FACULTY', 'HOD', 'DEAN', 'ADMIN']);

// HOD or higher middleware  
export const requireHOD = requireRole(['HOD', 'DEAN', 'ADMIN']);

// Dean or higher middleware
export const requireDean = requireRole(['DEAN', 'ADMIN']);

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                const user = await userService.getUser(decoded.userId);
                if (user && user.isActive) {
                    req.user = user;
                    req.userId = user.id;
                }
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Same department check middleware
export const requireSameDepartment = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // This would be used for department-specific operations
    // Implementation depends on the specific route context
    next();
};

// Rate limiting for sensitive operations
export const sensitiveRateLimit = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // Could implement Redis-based rate limiting here
    // For now, just pass through
    next();
};