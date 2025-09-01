import { getPool, initializeDatabase } from "../../lib/db";

export default async function handler(req, res) {
  await initializeDatabase();
  const pool = await getPool();

  if (req.method === "POST") {
    try {
      const { name, address, city, state, contact, email_id } = req.body;

      if (!name || !address || !city || !state || !contact || !email_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const [result] = await pool.execute(
        `INSERT INTO schools (name, address, city, state, contact, email_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, address, city, state, contact, email_id]
      );

      res.status(201).json({
        message: "School added successfully!",
        schoolId: result.insertId,
      });
    } catch (error) {
      console.error("Error adding school:", error);
      res.status(500).json({ error: "Failed to add school", details: String(error) });
    }
    return;
  }

  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(
        `SELECT id, name, address, city, state, contact, email_id, created_at
         FROM schools ORDER BY created_at DESC`
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ error: "Failed to fetch schools", details: String(error) });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
