export default (sequelize, DataTypes) => {
  const studentDocument = sequelize.define(
    "studentDocument",
    {
      doc_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      stu_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      supervisor_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      document_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      document_type: {
        type: DataTypes.ENUM(
          "Thesis Chapter",
          "Research Proposal",
          "Progress Report",
          "Literature Review",
          "Other"
        ),
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      file_size_kb: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      submitted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "student_documents",
      timestamps: false,
    }
  );

  return studentDocument;
};
