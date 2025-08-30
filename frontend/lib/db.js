import { Pool } from "pg";

// PostgreSQL database configuration
const dbConfig = {
  host: "localhost",
  port: 5432,                     // Default PostgreSQL port
  user: "postgres",               // Default PostgreSQL username (change if needed)
  password: "",                   // Your PostgreSQL password
  database: "school_db",          // Database name
  max: 10,                        // Max number of connections
  idleTimeoutMillis: 30000,       // Close idle connections after 30s
  connectionTimeoutMillis: 2000,  // Error if connection not established in 2s
};

let pool;

// Create (or reuse) connection pool
export async function getConnection() {
  if (!pool) {
    pool = new Pool(dbConfig);
    console.log("✅ PostgreSQL connection pool created");
  }
  return pool;
}

// Test database connection
export async function testConnection() {
  try {
    const pool = await getConnection();
    const result = await pool.query("SELECT NOW() as current_time");
    console.log("✅ PostgreSQL connection successful");
    console.log("Server time:", result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error);
    return false;
  }
}

// SQL to create the schools table
export const createSchoolsTable = `
  CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    contact BIGINT NOT NULL,
    image TEXT,
    email_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`;

// Initialize database
export async function initializeDatabase() {
  try {
    const pool = await getConnection();
    await pool.query(createSchoolsTable);
    console.log("✅ Database initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    return false;
  }
}

// Close connection pool
export async function closeConnection() {
  try {
    if (pool) {
      await pool.end();
      console.log("✅ PostgreSQL connection pool closed");
    }
  } catch (error) {
    console.error("❌ Error closing PostgreSQL connection pool:", error);
  }
}
