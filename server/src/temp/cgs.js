import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class cgs extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    cgs_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    emp_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'empinfo',
        key: 'emp_id'
      }
    },
    FirstName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    LastName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    EmailId: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    Password: {
      type: DataTypes.STRING(180),
      allowNull: false
    },
    Phonenumber: {
      type: DataTypes.CHAR(20),
      allowNull: false
    },
    Profile_Image: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    Status: {
      type: DataTypes.ENUM('Active','Inactive','Pending'),
      allowNull: false,
      defaultValue: "Pending"
    },
    RegDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    EndDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    IsVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    MustChangePassword: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'cgs',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cgs_id" },
        ]
      },
      {
        name: "fk_emp_cgs",
        using: "BTREE",
        fields: [
          { name: "emp_id" },
        ]
      },
      {
        name: "fk_dep_code_cgs",
        using: "BTREE",
        fields: [
          { name: "Dep_Code" },
        ]
      },
      {
        name: "fk_role_cgs",
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
    ]
  });
  }
}
