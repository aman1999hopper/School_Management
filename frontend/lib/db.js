// lib/db.js
import mysql from "mysql2/promise";

const poolConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "schools_db",
  port: parseInt(process.env.MYSQL_PORT || "3306", 10),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || "10", 10),
  queueLimit: 0,
};

let pool = null;

export async function getPool() {
  if (!pool) {
    pool = mysql.createPool(poolConfig);
    console.log("✅ MySQL pool created");
  }
  return pool;
}

export async function testConnection() {
  try {
    const p = await getPool();
    const [rows] = await p.query("SELECT NOW() as now");
    console.log("✅ MySQL connection ok:", rows[0].now);
    return true;
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
    return false;
  }
}

export const createSchoolsTableSQL = `
CREATE TABLE IF NOT EXISTS schools (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  contact BIGINT NOT NULL,
  image VARCHAR(255),
  email_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

export async function initializeDatabase() {
  try {
    const p = await getPool();
    await p.execute(createSchoolsTableSQL);
    console.log("✅ schools table ensured");
    return true;
  } catch (err) {
    console.error("❌ initializeDatabase error:", err);
    return false;
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("✅ MySQL pool closed");
  }
}
