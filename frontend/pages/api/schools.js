import { testConnection } from "../../lib/db";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

// Configure multer for image upload
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
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Disable Next.js body parser for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  const pool = await getConnection();

  if (req.method === "POST") {
    try {
      // Handle file upload
      await runMiddleware(req, res, upload.single("image"));

      const { name, address, city, state, contact, email_id } = req.body;
      const imagePath = req.file ? `/schoolImages/${req.file.filename}` : null;

      // Insert into database (Postgres uses $1, $2, ... for placeholders)
      const result = await pool.query(
        `INSERT INTO schools (name, address, city, state, contact, image, email_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [name, address, city, state, contact, imagePath, email_id]
      );

      res.status(201).json({
        message: "School added successfully!",
        schoolId: result.rows[0].id,
      });
    } catch (error) {
      console.error("Error adding school:", error);
      res.status(500).json({ error: "Failed to add school" });
    }
  } else if (req.method === "GET") {
    try {
      const result = await pool.query(
        `SELECT id, name, address, city, state, contact, image, email_id 
         FROM schools ORDER BY created_at DESC`
      );

      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ error: "Failed to fetch schools" });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
