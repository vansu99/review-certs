import pool from "../src/config/database.js";
import bcrypt from "bcryptjs";

async function checkUser() {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = 'admin@example.com'",
    );
    console.log("User found:", rows.length > 0);
    if (rows.length > 0) {
      const user = rows[0];
      console.log("Email:", user.email);
      console.log("Hash in DB:", user.password_hash);

      const isMatch = await bcrypt.compare("password", user.password_hash);
      console.log("Password 'password' matches:", isMatch);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

checkUser();
