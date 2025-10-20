import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { validateEnvironment, serverConfig } from './config';
import { initializeDatabase } from './config/database';
import { setupRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// =================== APP SETUP ===================

export const createApp = async (): Promise<express.Application> => {
    // Validate environment variables
    validateEnvironment();

    // Initialize database connection
    await initializeDatabase();

    // Create Express app
    const app = express();

    // =================== MIDDLEWARE ===================

    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https:"],
                scriptSrc: ["'self'", "https:"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https:"],
                fontSrc: ["'self'", "https:", "data:"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    app.use(cors({
        origin: serverConfig.corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Compression
    app.use(compression());

    // Request logging
    if (serverConfig.enableRequestLogging) {
        app.use(morgan(serverConfig.nodeEnv === 'production' ? 'combined' : 'dev'));
    }

    // Rate limiting
    const limiter = rateLimit({
        windowMs: serverConfig.rateLimitWindowMs,
        max: serverConfig.rateLimitMaxRequests,
        message: {
            error: 'Too many requests from this IP, please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Trust proxy (important for rate limiting and IP detection)
    app.set('trust proxy', 1);

    // =================== HEALTH CHECK ===================
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: serverConfig.nodeEnv,
            version: process.env.npm_package_version || '1.0.0'
        });
    });

    // =================== API ROUTES ===================
    app.use('/api/v1', setupRoutes());

    // =================== ERROR HANDLING ===================
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

// =================== SERVER STARTUP ===================

const startServer = async (): Promise<void> => {
    try {
        const app = await createApp();

        const server = app.listen(serverConfig.port, () => {
            console.log(`🚀 Server running on port ${serverConfig.port}`);
            console.log(`📊 Environment: ${serverConfig.nodeEnv}`);
            console.log(`🔗 Health check: http://localhost:${serverConfig.port}/health`);
            console.log(`📖 API Documentation: http://localhost:${serverConfig.port}/api/v1`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received, shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start server if this file is run directly
if (require.main === module) {
    startServer();
}

export { startServer };
export default createApp;