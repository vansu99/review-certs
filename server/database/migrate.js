/**
 * Run all pending migrations in order.
 * Safe to re-run — all statements use CREATE TABLE IF NOT EXISTS / ALTER IF NOT EXISTS patterns.
 *
 * Usage: node database/migrate.js
 */
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Ordered list of migration files to run
const MIGRATIONS = [
  "migrations/groups_schema.sql",
  "migrations/blog_schema.sql",
];

async function migrate() {
  console.log("🔧 Running migrations...\n");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "review_certs",
    multipleStatements: true,
  });

  try {
    for (const file of MIGRATIONS) {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`  ⚠️  Skipping missing file: ${file}`);
        continue;
      }
      console.log(`  📄 Running ${file}...`);
      const sql = fs.readFileSync(filePath, "utf8");
      await connection.query(sql);
      console.log(`  ✅ Done: ${file}`);
    }

    // Patch: add reset_at column to groups if it doesn't exist yet
    // (handles databases created before this column was added)
    try {
      await connection.query(
        "ALTER TABLE `groups` ADD COLUMN reset_at TIMESTAMP NULL DEFAULT NULL"
      );
      console.log("  ✅ Patched: added reset_at column to groups table");
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") {
        console.log("  ℹ️  groups.reset_at already exists, skipping");
      } else {
        throw e;
      }
    }

    console.log("\n🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
