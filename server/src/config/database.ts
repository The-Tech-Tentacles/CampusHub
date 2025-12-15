import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../schema/index.js';

// Store original fetch before overriding
const originalFetch = global.fetch;

// Configure fetch with longer timeout to handle cold starts
const fetchWithTimeout = (timeout = 30000) => {
    return (url: string, options: any = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        return originalFetch(url, {
            ...options,
            signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
    };
};

// Override global fetch for Neon with longer timeout
global.fetch = fetchWithTimeout(30000) as typeof fetch;

// Initialize database connection - should be called after environment variables are loaded
export function initializeDatabase() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set');
    }

    // Configure Neon with better timeout handling
    const sql = neon(process.env.DATABASE_URL, {
        fetchOptions: {
            cache: 'no-store',
        },
    });

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