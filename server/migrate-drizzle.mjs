#!/usr/bin/env node
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";
import { config } from "dotenv";

// Load environment variables from .env file
config();

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runDrizzleMigration() {
  console.log("🚀 CampusHub Drizzle Migration Runner");
  console.log("=====================================");

  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is required");
    console.error("💡 Make sure you have a .env file with DATABASE_URL set");
    process.exit(1);
  }

  console.log("✅ Environment variables loaded successfully");
  console.log("🔗 Database URL:", databaseUrl.replace(/:[^:@]*@/, ":***@")); // Hide password

  try {
    // Connect to database
    console.log("🔌 Connecting to database...");
    const client = new Client({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : false,
    });

    await client.connect();
    console.log("✅ Connected to database successfully");

    // Step 1: Find and run the latest Drizzle-generated schema
    const drizzleDir = join(__dirname, "src", "drizzle");
    const sqlFiles = readdirSync(drizzleDir).filter(
      (file) =>
        file.endsWith(".sql") &&
        file.startsWith("0000_") &&
        !file.includes("advanced-features")
    );

    if (sqlFiles.length === 0) {
      throw new Error(
        "No Drizzle migration files found! Run 'npm run db:generate' first."
      );
    }

    const latestSqlFile = sqlFiles.sort().pop(); // Get the latest file
    const drizzleSqlPath = join(drizzleDir, latestSqlFile);
    const drizzleSql = readFileSync(drizzleSqlPath, "utf8");

    console.log("📄 Loading Drizzle schema:", latestSqlFile);
    console.log("📊 Schema size:", drizzleSql.length, "characters");

    console.log("🔧 Executing Drizzle schema (tables, basic indexes, FKs)...");
    let startTime = Date.now();
    await client.query(drizzleSql);
    let duration = Date.now() - startTime;
    console.log(`✅ Drizzle schema completed in ${duration}ms`);

    // Step 2: Run advanced features (GIN indexes, triggers)
    const advancedSqlPath = join(
      __dirname,
      "src",
      "drizzle",
      "advanced-features.sql"
    );
    const advancedSql = readFileSync(advancedSqlPath, "utf8");

    console.log("📄 Loading advanced features:", advancedSqlPath);

    console.log("🔧 Executing advanced features (GIN indexes, triggers)...");
    startTime = Date.now();
    await client.query(advancedSql);
    duration = Date.now() - startTime;
    console.log(`✅ Advanced features completed in ${duration}ms`);

    // Step 3: Add sample data (optional - from original SQL)
    const sampleDataPath = join(
      __dirname,
      "migrations",
      "001_initial_schema.sql"
    );

    try {
      const fullSql = readFileSync(sampleDataPath, "utf8");
      // Extract only the INSERT statements from the original SQL
      const insertStatements = fullSql
        .split("\n")
        .filter(
          (line) =>
            line.trim().startsWith("INSERT INTO") ||
            line.trim().startsWith("UPDATE")
        )
        .join("\n");

      if (insertStatements.length > 0) {
        console.log("🔧 Adding sample data...");
        startTime = Date.now();
        await client.query(insertStatements);
        duration = Date.now() - startTime;
        console.log(`✅ Sample data completed in ${duration}ms`);
      }
    } catch (err) {
      console.log("⚠️  Sample data file not found, skipping...");
    }

    // Verify the schema
    console.log("🔍 Verifying schema...");

    const tablesResult = await client.query(`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

    console.log("📋 Created tables:");
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name} (${row.table_type})`);
    });

    // Check all indexes (including GIN)
    const indexResult = await client.query(`
            SELECT indexname, tablename, indexdef
            FROM pg_indexes 
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname
        `);

    console.log(`📊 Created indexes: ${indexResult.rows.length}`);

    // Count GIN indexes specifically
    const ginIndexes = indexResult.rows.filter(
      (row) => row.indexdef && row.indexdef.includes("USING gin")
    );
    console.log(`🎯 GIN indexes for arrays: ${ginIndexes.length}`);

    // Check triggers
    const triggerResult = await client.query(`
            SELECT trigger_name, event_object_table 
            FROM information_schema.triggers 
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table, trigger_name
        `);

    console.log(`⚡ Created triggers: ${triggerResult.rows.length}`);

    // Check enums
    const enumResult = await client.query(`
            SELECT typname 
            FROM pg_type 
            WHERE typtype = 'e'
            ORDER BY typname
        `);

    console.log(`📋 Created enums: ${enumResult.rows.length}`);
    enumResult.rows.forEach((row) => {
      console.log(`  - ${row.typname}`);
    });

    await client.end();
    console.log("🎉 Complete CampusHub database setup finished!");
    console.log("");
    console.log("✨ Features included:");
    console.log("  - 16 tables with proper relationships");
    console.log("  - 10 PostgreSQL enums");
    console.log("  - Standard B-tree indexes for queries");
    console.log("  - GIN indexes for efficient array queries");
    console.log("  - Automatic updated_at triggers");
    console.log("  - Foreign key constraints");
    console.log("  - Optional sample data");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    if (error.code) {
      console.error("   Error Code:", error.code);
    }
    if (error.detail) {
      console.error("   Detail:", error.detail);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDrizzleMigration();
}

export default runDrizzleMigration;
