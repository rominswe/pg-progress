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
      uploaded_by: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      master_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: 'master_stu',
          key: 'master_id'
        }
      },
      role_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        references: {
          model: 'roles',
          key: 'role_id'
        }
      },
      document_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      document_type: {
        type: DataTypes.ENUM('Thesis Chapter', 'Research Proposal', 'Progress Report', 'Literature Review', 'Other'),
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
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "Pending"
      },
      uploaded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      Dep_Code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        references: {
          model: 'tbldepartments',
          key: 'Dep_Code'
        }
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