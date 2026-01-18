import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class documents_reviews extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    doc_rev_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    doc_up_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'documents_uploads',
        key: 'doc_up_id'
      }
    },
    reviewed_by: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    role_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: 'roles',
        key: 'role_id'
      }
    },
    Dep_Code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: 'tbldepartments',
        key: 'Dep_Code'
      }
    },
    status: {
      type: DataTypes.ENUM('Pending','Approved','Rejected'),
      allowNull: false,
      defaultValue: "Pending"
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'documents_reviews',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "doc_rev_id" },
        ]
      },
      {
        name: "fk_doc_up_id_doc_rev_id",
        using: "BTREE",
        fields: [
          { name: "doc_up_id" },
        ]
      },
      {
        name: "fk_role_doc_rev",
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
      {
        name: "fk_dep_code_doc_rev",
        using: "BTREE",
        fields: [
          { name: "Dep_Code" },
        ]
      },
    ]
  });
  }
}
