import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class student_documents extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    doc_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sup_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'supervisor',
        key: 'sup_id'
      }
    },
    master_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'master_stu',
        key: 'master_id'
      }
    },
    document_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    document_type: {
      type: DataTypes.ENUM('Thesis Chapter','Research Proposal','Progress Report','Literature Review','Other'),
      allowNull: false,
      defaultValue: "Thesis Chapter"
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    status: {
      type: DataTypes.ENUM('pending','approved','rejected'),
      allowNull: false,
      defaultValue: "pending"
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'student_documents',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "doc_id" },
        ]
      },
      {
        name: "fk_master_id_student_documents",
        using: "BTREE",
        fields: [
          { name: "master_id" },
        ]
      },
      {
        name: "fksup_id_student_documents",
        using: "BTREE",
        fields: [
          { name: "sup_id" },
        ]
      },
    ]
  });
  }
}
