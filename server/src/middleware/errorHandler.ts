import { Request, Response, NextFunction } from 'express';

// Error response interface
export interface ErrorResponse {
    error: string;
    code: string;
    details?: any;
    timestamp?: string;
    path?: string;
    method?: string;
}

// Custom error class
export class AppError extends Error {
    public statusCode: number;
    public code: string;
    public details?: any;
    public isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        details?: any
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Predefined error creators
export const createNotFoundError = (resource: string, id?: string) => {
    return new AppError(
        `${resource}${id ? ` with ID ${id}` : ''} not found`,
        404,
        'NOT_FOUND',
        { resource, id }
    );
};

export const createValidationError = (message: string, details?: any) => {
    return new AppError(message, 400, 'VALIDATION_ERROR', details);
};

export const createAuthenticationError = (message: string = 'Authentication failed') => {
    return new AppError(message, 401, 'AUTHENTICATION_ERROR');
};

export const createAuthorizationError = (message: string = 'Insufficient permissions') => {
    return new AppError(message, 403, 'AUTHORIZATION_ERROR');
};

export const createConflictError = (message: string, details?: any) => {
    return new AppError(message, 409, 'CONFLICT_ERROR', details);
};

export const createRateLimitError = (message: string = 'Too many requests') => {
    return new AppError(message, 429, 'RATE_LIMIT_ERROR');
};

export const createDatabaseError = (message: string = 'Database operation failed', details?: any) => {
    return new AppError(message, 500, 'DATABASE_ERROR', details);
};

// Error handler middleware
export const errorHandler = (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: any;

    // Handle known errors
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        code = error.code;
        message = error.message;
        details = error.details;
    } else if (error.name === 'ValidationError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = error.message;
    } else if (error.name === 'CastError') {
        statusCode = 400;
        code = 'INVALID_ID';
        message = 'Invalid ID format';
    } else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid authentication token';
    } else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Authentication token expired';
    } else if (error.message.includes('duplicate key')) {
        statusCode = 409;
        code = 'DUPLICATE_ENTRY';
        message = 'Resource already exists';
    } else if (error.message.includes('foreign key constraint')) {
        statusCode = 400;
        code = 'INVALID_REFERENCE';
        message = 'Invalid reference to related resource';
    }

    // Log error (only log operational errors in production)
    const shouldLog = process.env.NODE_ENV !== 'production' ||
        (error instanceof AppError && error.isOperational);

    if (shouldLog) {
        console.error('Error:', {
            message: error.message,
            stack: error.stack,
            statusCode,
            code,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }

    // Create error response
    const errorResponse: ErrorResponse = {
        error: message,
        code,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    };

    // Add details in development or for operational errors
    if (process.env.NODE_ENV !== 'production' || (error instanceof AppError && error.isOperational)) {
        errorResponse.details = details;
    }

    res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
    const error: ErrorResponse = {
        error: 'Route not found',
        code: 'ROUTE_NOT_FOUND',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    };

    res.status(404).json(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Database connection error handler
export const handleDatabaseError = (error: any): AppError => {
    console.error('Database error:', error);

    if (error.code === '23505') { // PostgreSQL unique constraint
        return createConflictError('Resource already exists', { constraint: error.constraint });
    }

    if (error.code === '23503') { // PostgreSQL foreign key constraint
        return new AppError('Invalid reference to related resource', 400, 'INVALID_REFERENCE');
    }

    if (error.code === '23502') { // PostgreSQL not null constraint
        return createValidationError('Required field is missing', { field: error.column });
    }

    if (error.code === '22001') { // PostgreSQL string too long
        return createValidationError('Input value is too long', { field: error.column });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return createDatabaseError('Database connection failed');
    }

    // Generic database error
    return createDatabaseError('Database operation failed');
};

// Validation error formatter
export const formatValidationError = (errors: any[]): AppError => {
    const details = errors.map(error => ({
        field: error.path || error.param,
        message: error.msg || error.message,
        value: error.value
    }));

    return createValidationError('Validation failed', details);
};

// File upload error handler
export const handleFileUploadError = (error: any): AppError => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        return new AppError('File too large', 400, 'FILE_TOO_LARGE', {
            maxSize: error.limit
        });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE', {
            fieldName: error.field
        });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
        return new AppError('Too many files', 400, 'TOO_MANY_FILES', {
            maxCount: error.limit
        });
    }

    return createValidationError('File upload failed', { originalError: error.message });
};

// Rate limiting error handler
export const handleRateLimitError = (req: Request): AppError => {
    return new AppError(
        'Too many requests from this IP, please try again later',
        429,
        'RATE_LIMIT_EXCEEDED',
        {
            ip: req.ip,
            path: req.path,
            retryAfter: '15 minutes'
        }
    );
};

// Security error handlers
export const handleSecurityError = (type: string, details?: any): AppError => {
    const securityErrors = {
        'CSRF': () => new AppError('CSRF token validation failed', 403, 'CSRF_ERROR'),
        'XSS': () => new AppError('Potential XSS attack detected', 400, 'XSS_DETECTED'),
        'SQL_INJECTION': () => new AppError('Potential SQL injection detected', 400, 'SQL_INJECTION'),
        'MALICIOUS_FILE': () => new AppError('Malicious file detected', 400, 'MALICIOUS_FILE'),
    };

    const errorCreator = securityErrors[type as keyof typeof securityErrors];
    if (errorCreator) {
        const error = errorCreator();
        error.details = details;
        return error;
    }

    return new AppError('Security violation detected', 403, 'SECURITY_ERROR', details);
};