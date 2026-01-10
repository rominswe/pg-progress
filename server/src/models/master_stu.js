import bcrypt from 'bcryptjs';
import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class master_stu extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      master_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
        field: 'master_id'
      },
      stu_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: 'studinfo',
          key: 'stu_id'
        },
        field: 'stu_id'
      },
      FirstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'FirstName'
      },
      LastName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: 'LastName'
      },
      EmailId: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'EmailId'
      },
      Password: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'Password'
      },
      Dep_Code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        references: {
          model: 'tbldepartments',
          key: 'Dep_Code'
        },
        field: 'Dep_Code'
      },
      Prog_Code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        references: {
          model: 'program_info',
          key: 'Prog_Code'
        },
        field: 'Prog_Code'
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
      Status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Pending'),
        allowNull: false,
        defaultValue: "Pending",
        field: 'Status'
      },
      RegDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'RegDate'
      },
      StartDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'StartDate'
      },
      EndDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'EndDate'
      },
      IsVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
        field: 'IsVerified'
      },
      MustChangePassword: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
        field: 'MustChangePassword'
      },
      Profile_Image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'Profile_Image'
      }
    }, {
      sequelize,
      tableName: 'master_stu',
      freezeTableName: true,
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "master_id" },
          ]
        },
        {
          name: "fk_stu_master",
          using: "BTREE",
          fields: [
            { name: "stu_id" },
          ]
        },
        {
          name: "fk_dep_code_master",
          using: "BTREE",
          fields: [
            { name: "Dep_Code" },
          ]
        },
        {
          name: "fk_program_code_master",
          using: "BTREE",
          fields: [
            { name: "Prog_Code" },
          ]
        },
        {
          name: "fk_role_master_stu",
          using: "BTREE",
          fields: [
            { name: "role_id" },
          ]
        },
      ],

      // 🔐 Hooks for password hashing
      hooks: {
        beforeCreate: async (user) => {
          if (user.Password) {
            user.Password = await bcrypt.hash(user.Password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('Password')) {
            user.Password = await bcrypt.hash(user.Password, 10);
          }
        }
      }
    });
  }
}
