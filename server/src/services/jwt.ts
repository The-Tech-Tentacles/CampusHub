import jwt, { SignOptions } from 'jsonwebtoken';

// Extract UserRole type from the enum values
export type UserRole = 'STUDENT' | 'FACULTY' | 'HOD' | 'DEAN' | 'ADMIN';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    departmentId?: string;
    departmentCode?: string;
    academicYearId?: string;
    academicYearCode?: string;
    academicLevel?: string;
    iat?: number;
    exp?: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d',
        issuer: 'campushub-api',
        audience: 'campushub-client',
    });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '30d',
        issuer: 'campushub-api',
        audience: 'campushub-client',
    });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Calculate expiration time for access token
    const decoded = jwt.decode(accessToken) as JWTPayload;
    const expiresAt = new Date(decoded.exp! * 1000);

    return {
        accessToken,
        refreshToken,
        expiresAt,
    };
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'campushub-api',
            audience: 'campushub-client',
        }) as JWTPayload;

        return decoded;
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        } else if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expired');
        } else if (error instanceof jwt.NotBeforeError) {
            throw new Error('Token not active');
        } else {
            throw new Error('Token verification failed');
        }
    }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        return jwt.decode(token) as JWTPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return null;

        return new Date(decoded.exp * 1000);
    } catch (error) {
        return null;
    }
}