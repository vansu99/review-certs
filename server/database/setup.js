import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function setup() {
  console.log("🔧 Setting up database...\n");

  // Connect without database first to create it if needed
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  try {
    const dbName = process.env.DB_NAME || "review_certs";

    // Create database if not exists
    console.log(`📦 Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    // Read and execute schema
    console.log("📋 Running schema.sql...");
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await connection.query(schema);
    console.log("✅ Schema created successfully");

    // Read and execute seed
    console.log("🌱 Running seed.sql...");
    const seedPath = path.join(__dirname, "seed.sql");
    const seed = fs.readFileSync(seedPath, "utf8");
    await connection.query(seed);
    console.log("✅ Seed data inserted successfully");

    console.log("\n🎉 Database setup complete!");
    console.log("\n📝 Demo credentials:");
    console.log("   Admin:   admin@example.com / password");
    console.log("   Manager: manager@example.com / password");
    console.log("   User:    user@example.com / password");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setup().catch((err) => {
  console.error(err);
  process.exit(1);
});
