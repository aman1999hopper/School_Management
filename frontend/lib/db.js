import mysql from "mysql2/promise";

// Pool configuration
const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "schools_db",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10),
  queueLimit: 0,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
};

// Use `let` so we can reassign it later
let pool = null;

// Create/reuse pool
export async function getPool() {
  if (!pool) {
    pool = mysql.createPool(poolConfig);
    console.log("✅ MySQL pool created");
  }
  return pool;
}

// Simple connection test
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

// Table creation query
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

// Ensure schools table exists
export async function initializeDatabase() {
  try {
    const p = await getPool();
    await p.execute(createSchoolsTableSQL);
    console.log("✅ Schools table ensured");
    return true;
  } catch (err) {
    console.error("❌ initializeDatabase error:", err);
    return false;
  }
}

// Gracefully close pool
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("🔒 MySQL pool closed");
  }
}
