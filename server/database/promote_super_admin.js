/**
 * Promote a user to Super Admin role.
 * Usage: node database/promote_super_admin.js <email>
 */
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const email = process.argv[2];

if (!email) {
  console.error("Usage: node database/promote_super_admin.js <email>");
  process.exit(1);
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "review_certs",
});

try {
  const [result] = await connection.execute(
    "UPDATE users SET role = 'Super Admin' WHERE email = ?",
    [email]
  );

  if (result.affectedRows === 0) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`✅ User '${email}' promoted to Super Admin`);
} finally {
  await connection.end();
}
