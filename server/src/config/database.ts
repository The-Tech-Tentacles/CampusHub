import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../../../shared/schema";

neonConfig.webSocketConstructor = ws;

// Database configuration
export const databaseConfig = {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '60000'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
};

// Validate required environment variables
if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
    );
}

// Create connection pool
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: databaseConfig.max,
    min: databaseConfig.min,
    connectionTimeoutMillis: databaseConfig.connectionTimeoutMillis,
    idleTimeoutMillis: databaseConfig.idleTimeoutMillis,
});

// Initialize Drizzle ORM
export const db = drizzle({ client: pool, schema });

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('✅ Database connection established');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

// Graceful database shutdown
export async function closeDatabaseConnection(): Promise<void> {
    try {
        await pool.end();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
}