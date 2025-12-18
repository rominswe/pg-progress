import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class document_submissions extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    document_id: {
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
    file_size_kb: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending','approved','rejected'),
      allowNull: false,
      defaultValue: "pending"
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'document_submissions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "document_id" },
        ]
      },
      {
        name: "fk_sup_id_doc_submission",
        using: "BTREE",
        fields: [
          { name: "sup_id" },
        ]
      },
      {
        name: "fk_master_id_doc_submission",
        using: "BTREE",
        fields: [
          { name: "master_id" },
        ]
      },
    ]
  });
  }
}
