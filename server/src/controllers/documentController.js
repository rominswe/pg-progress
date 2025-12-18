import { studentDocument, masterStu, supervisor } from "../config/config.js";

// ✅ Student uploads document
export const uploadDocument = async (req, res) => {
  try {
    const { master_id, sup_id, document_type } = req.body; // updated field names

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    await studentDocument.create({
      master_id,
      sup_id,
      document_name: req.file.originalname,
      document_type: document_type || "Thesis Chapter",
      file_path: req.file.path,
      file_size_kb: req.file.size / 1024,
    });

    res.status(201).json({ message: "Document uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

// ✅ Supervisor views submissions
export const getSubmissionsForSupervisor = async (req, res) => {
  const { sup_id } = req.params;

  const submissions = await studentDocument.findAll({
    where: { sup_id },
    include: [
      {
        model: masterStu,
        attributes: ["master_id", "Name"], // make sure `Name` exists in masterStu
      },
    ],
    order: [["uploaded_at", "DESC"]],
  });

  res.json(submissions);
};

// ✅ Supervisor review
export const reviewSubmission = async (req, res) => {
  const { document_id } = req.params;
  const { status } = req.body;

  await studentDocument.update(
    {
      status,
      reviewed_at: new Date(),
    },
    { where: { document_id } }
  );

  res.json({ message: "Review updated" });
};
