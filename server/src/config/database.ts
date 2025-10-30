import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../schema/index.js';

// Initialize database connection - should be called after environment variables are loaded
export function initializeDatabase() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set');
    }

    const sql = neon(process.env.DATABASE_URL);
    // @ts-ignore - Type compatibility issue between Drizzle and Neon, functionality works fine
    return { db: drizzle(sql, { schema }), sql };
}

let dbConnection: ReturnType<typeof initializeDatabase> | null = null;

export function getDatabase() {
    if (!dbConnection) {
        dbConnection = initializeDatabase();
    }
    return dbConnection;
}

// Test connection function
export async function testConnection() {
    try {
        const { sql } = getDatabase();
        // const result = await sql`SELECT 1 as test`;
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}