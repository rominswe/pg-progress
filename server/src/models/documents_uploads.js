import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class documents_uploads extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      doc_up_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      pg_student_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: 'pgstudinfo',
          key: 'pgstud_id'
        }
      },
      document_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      document_type: {
        type: DataTypes.ENUM('Research Proposal', 'Literature Review', 'Methodology', 'Data Analysis', 'Final Thesis', 'Thesis Chapter', 'Progress Report', 'Other'),
        allowNull: false,
        defaultValue: "Other"
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      file_size_kb: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Completed', 'Resubmit'),
        allowNull: false,
        defaultValue: "Pending"
      },
      uploaded_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'documents_uploads',
      timestamps: true,
      createdAt: false,
      updatedAt: 'updated_at',
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "doc_up_id" },
          ]
        },
        {
          name: "fk_doc_up_pgstudent_id",
          using: "BTREE",
          fields: [
            { name: "pg_student_id" },
          ]
        },
      ]
    });
  }
}
