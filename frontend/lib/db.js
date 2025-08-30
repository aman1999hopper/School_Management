// lib/db.js
import { Pool } from "pg";

const dbConfig = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "aman@123",
  database: "school_db",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(dbConfig);

export default pool;  // 👈 add this
