// pages/api/schools.js
import { getPool, initializeDatabase } from "../../lib/db";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "public", "schoolImages");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error("Error creating upload directory:", error);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
// 5MB limit and image file filter
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"), false);
  },
});

export const config = { api: { bodyParser: false } };

// Helper to run multer as middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // ensure table
  await initializeDatabase();
  const pool = await getPool();

  if (req.method === "POST") {
    try {
      await runMiddleware(req, res, upload.single("image"));

      const { name, address, city, state, contact, email_id } = req.body;
      const imagePath = req.file ? `/schoolImages/${req.file.filename}` : null;

      // basic validation
      if (!name || !address || !city || !state || !contact || !email_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const [result] = await pool.execute(
        `INSERT INTO schools (name, address, city, state, contact, image, email_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, address, city, state, contact, imagePath, email_id]
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
        `SELECT id, name, address, city, state, contact, image, email_id, created_at
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
