/**
 * Run blog migration
 * Usage: node database/migrate_blog.js
 */
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function migrate() {
  console.log("🔧 Running blog migration...\n");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "review_certs",
    multipleStatements: true,
  });

  try {
    const migrationPath = path.join(__dirname, "migrations", "blog_schema.sql");
    const migration = fs.readFileSync(migrationPath, "utf8");
    await connection.query(migration);
    console.log("✅ Blog migration completed successfully!");
    console.log("   Created tables: blogs, blog_likes");
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
