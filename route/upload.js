import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// uploads folder (root/uploads)
const uploadDir = path.resolve("uploads");

// ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_.]/g, "");

    const finalName = `${Date.now()}_${cleanName}`;

    cb(null, finalName);
  },
});

const upload = multer({ storage });

// POST /upload
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }
  console.log(`File uploaded: ${req.file.filename}`);
  return res.json({
    success: true,
    fileName: req.file.filename, // ONLY store this in DB
  });
});

export default router;