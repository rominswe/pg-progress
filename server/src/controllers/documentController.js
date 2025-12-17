import { studentDocument, masterStu } from "../config/config.js";

// ✅ Student uploads document
export const uploadDocument = async (req, res) => {
  try {
    const { stu_id, supervisor_id, document_type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    await studentDocument.create({
      stu_id,
      supervisor_id,
      document_name: req.file.originalname,
      document_type,
      file_path: req.file.path,
    });

    res.status(201).json({ message: "Document uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

// ✅ Supervisor views submissions
export const getSubmissionsForSupervisor = async (req, res) => {
  const { supervisor_id } = req.params;

  const submissions = await studentDocument.findAll({
    where: { supervisor_id },
    include: [
      {
        model: masterStu,
        attributes: ["stu_id", "Name"],
      },
    ],
    order: [["submitted_at", "DESC"]],
  });

  res.json(submissions);
};

// ✅ Supervisor review
export const reviewSubmission = async (req, res) => {
  const { doc_id } = req.params;
  const { status, score, comments } = req.body;

  await studentDocument.update(
    {
      status,
      score,
      comments,
      reviewed_at: new Date(),
    },
    { where: { doc_id } }
  );

  res.json({ message: "Review updated" });
};
