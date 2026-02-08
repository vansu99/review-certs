import pool from "../src/config/database.js";
import bcrypt from "bcryptjs";

async function fixPasswords() {
  try {
    const hash = await bcrypt.hash("password", 10);
    console.log("New Hash:", hash);
    const [result] = await pool.execute("UPDATE users SET password_hash = ?", [
      hash,
    ]);
    console.log("Updated users:", result.affectedRows);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

fixPasswords();
