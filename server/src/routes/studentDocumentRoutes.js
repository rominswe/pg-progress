// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import { studentDocument } from "../config/config.js";

// const router = express.Router();

// // Ensure uploads folder exists
// const UPLOAD_PATH = "uploads/documents";
// if (!fs.existsSync(UPLOAD_PATH)) fs.mkdirSync(UPLOAD_PATH, { recursive: true });

// // Multer config
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, UPLOAD_PATH);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage });

// // POST /studentDocuments/upload
// router.post("/upload", upload.array("files"), async (req, res) => {
//   try {
//     const { stu_id, supervisor_id, document_type } = req.body;
//     const files = req.files;

//     if (!files || files.length === 0) return res.status(400).json({ error: "No files uploaded" });

//     for (const file of files) {
//       await studentDocument.create({
//         stu_id,
//         supervisor_id,
//         document_name: file.originalname,
//         document_type,
//         file_path: file.path,
//         file_size_kb: Math.round(file.size / 1024),
//       });
//     }

//     res.json({ message: "Files uploaded successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Upload failed" });
//   }
// });

// // GET all documents
// router.get("/", async (req, res) => {
//   try {
//     const documents = await studentDocument.findAll();
//     res.json(documents);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch documents" });
//   }
// });

// export default router;

import express from "express";
import upload from "../middleware/multerConfig.js"; // Your multer config
import { studentDocument, masterStu, supervisor } from "../config.js";

const router = express.Router();

// ✅ Debug: log when routes are loaded
console.log("✅ StudentDocument routes loaded");

// POST /student-documents/upload
router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const { stu_id, supervisor_id, document_type } = req.body;

    if (!stu_id || !supervisor_id || !document_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const savedDocuments = [];

    for (let file of files) {
      const doc = await studentDocument.create({
        stu_id,
        supervisor_id,
        document_name: file.originalname,
        document_type,
        file_path: file.path,
        file_size_kb: Math.round(file.size / 1024),
      });
      savedDocuments.push(doc);
    }

    res.status(201).json(savedDocuments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// GET /student-documents
router.get("/", async (req, res) => {
  try {
    const documents = await studentDocument.findAll({
      include: [
        {
          model: masterStu,
          attributes: ["stu_id", "first_name", "last_name"],
        },
        {
          model: supervisor,
          attributes: ["emp_id", "name"],
        },
      ],
      order: [["submitted_at", "DESC"]],
    });

    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch documents", error: err.message });
  }
});

export default router;

