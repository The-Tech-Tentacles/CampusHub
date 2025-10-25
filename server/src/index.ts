import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Simple environment configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';
const CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:5174';

import { testConnection, initializeDatabase } from './config/database.js';

// Initialize database connection after environment variables are loaded
initializeDatabase();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
const corsOrigins = CORS_ORIGINS.split(',').map((origin: string) => origin.trim());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        if (corsOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow localhost in development
        if (isDevelopment && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
            return callback(null, true);
        }

        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (isDevelopment) {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbStatus = await testConnection();

        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: NODE_ENV,
            database: dbStatus ? 'connected' : 'disconnected',
            version: process.env.npm_package_version || '1.0.0',
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: isDevelopment ? error : 'Service temporarily unavailable',
        });
    }
});

// API routes
import authRoutes from './routes/auth.js';
import departmentRoutes from './routes/departments.js';
import academicYearRoutes from './routes/academic-years.js';

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/academic-years', academicYearRoutes);

// Catch-all for undefined API routes
app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        message: 'This endpoint does not exist or is not implemented yet.',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist.',
        timestamp: new Date().toISOString(),
    });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Unhandled error:', error);

    res.status(500).json({
        error: 'Internal Server Error',
        message: isDevelopment ? error.message : 'Something went wrong on our end.',
        timestamp: new Date().toISOString(),
    });
});

// Start server
async function startServer() {
    try {
        console.log('🚀 Starting CampusHub API Server...');

        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        const server = app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🌐 Environment: ${NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            if (isDevelopment) {
                console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
            }
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('🛑 SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('✅ Process terminated');
            });
        });

        process.on('SIGINT', () => {
            console.log('🛑 SIGINT received. Shutting down gracefully...');
            server.close(() => {
                console.log('✅ Process terminated');
            });
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

startServer();