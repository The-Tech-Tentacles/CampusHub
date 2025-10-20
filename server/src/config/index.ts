import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Server configuration
export const serverConfig = {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',

    // CORS settings
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    // Security settings
    enableCors: process.env.ENABLE_CORS === 'true',
    enableDebug: process.env.ENABLE_DEBUG === 'true',

    // Rate limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

    // File upload settings
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'],
    uploadDir: process.env.UPLOAD_DIR || './uploads',

    // Logging settings
    logLevel: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
};

// JWT configuration
export const jwtConfig = {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
};

// Notification settings
export const notificationConfig = {
    perPage: parseInt(process.env.NOTIFICATIONS_PER_PAGE || '20'),
    maxPerUser: parseInt(process.env.MAX_NOTIFICATIONS_PER_USER || '1000'),
    cleanupDays: parseInt(process.env.NOTIFICATION_CLEANUP_DAYS || '90'),
};

// Feature flags
export const features = {
    enableUserRegistration: process.env.ENABLE_USER_REGISTRATION !== 'false',
    enableFileUploads: process.env.ENABLE_FILE_UPLOADS !== 'false',
    enableRealTimeNotifications: process.env.ENABLE_REAL_TIME_NOTIFICATIONS !== 'false',
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

export function validateEnvironment(): void {
    const missing = requiredEnvVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (serverConfig.nodeEnv === 'production' && jwtConfig.secret === 'fallback-secret-key-change-in-production') {
        throw new Error('JWT_SECRET must be set to a secure value in production');
    }

    console.log('✅ Environment configuration validated');
}

// Export all configs
export default {
    server: serverConfig,
    jwt: jwtConfig,
    notification: notificationConfig,
    features,
    validateEnvironment,
};