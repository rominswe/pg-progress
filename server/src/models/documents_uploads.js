import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class documents_uploads extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      doc_up_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'doc_up_id'
      },
      uploaded_by: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'uploaded_by'
      },
      master_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: 'master_stu',
          key: 'master_id'
        },
        field: 'master_id'
      },
      role_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        references: {
          model: 'roles',
          key: 'role_id'
        },
        field: 'role_id'
      },
      document_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'document_name'
      },
      document_type: {
        type: DataTypes.ENUM('Thesis Chapter', 'Research Proposal', 'Progress Report', 'Literature Review', 'Other'),
        allowNull: false,
        defaultValue: "Other",
        field: 'document_type'
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_path'
      },
      file_size_kb: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'file_size_kb'
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: "Pending",
        field: 'status'
      },
      uploaded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'uploaded_at'
      },
      Dep_Code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        references: {
          model: 'tbldepartments',
          key: 'Dep_Code'
        },
        field: 'Dep_Code'
      }
    }, {
      sequelize,
      tableName: 'documents_uploads',
      timestamps: true,
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
          name: "fk_role_doc_up",
          using: "BTREE",
          fields: [
            { name: "role_id" },
          ]
        },
        {
          name: "fk_master_doc_up",
          using: "BTREE",
          fields: [
            { name: "master_id" },
          ]
        },
        {
          name: "fk_dep_code_doc_up",
          using: "BTREE",
          fields: [
            { name: "Dep_Code" },
          ]
        },
      ]
    });
  }
}