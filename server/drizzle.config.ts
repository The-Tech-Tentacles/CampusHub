export default {
    schema: './src/schema/index.ts',
    out: './src/drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || '',
    },
};