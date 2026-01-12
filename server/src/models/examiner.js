import bcrypt from 'bcryptjs';
import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class examiner extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      examiner_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
        field: 'examiner_id'
      },
      emp_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        references: {
          model: 'empinfo',
          key: 'emp_id'
        },
        field: 'emp_id'
      },
      visiting_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        references: {
          model: 'visiting_staff',
          key: 'visiting_id'
        }
      },
      FirstName: {
        type: DataTypes.STRING(150),
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
        type: DataTypes.STRING(180),
        allowNull: false,
        field: 'Password'
      },
      Phonenumber: {
        type: DataTypes.CHAR(20),
        allowNull: false,
        field: 'Phonenumber'
      },
      Profile_Image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'Profile_Image'
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
      role_type: {
        type: DataTypes.ENUM('Internal', 'External'),
        allowNull: false,
        defaultValue: "Internal"
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
      Status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Pending'),
        allowNull: false,
        defaultValue: 'Pending',
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
      }
    }, {
      sequelize,
      tableName: 'examiner',
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "examiner_id" },
          ]
        },
        {
          name: "fk_emp_examiner",
          using: "BTREE",
          fields: [
            { name: "emp_id" },
          ]
        },
        {
          name: "fk_dep_code_examiner",
          using: "BTREE",
          fields: [
            { name: "Dep_Code" },
          ]
        },
        {
          name: "fk_role_examiner",
          using: "BTREE",
          fields: [
            { name: "role_id" },
          ]
        },
        {
          name: "fk_visiting_examiner",
          using: "BTREE",
          fields: [
            { name: "visiting_id" },
          ]
        },
      ],

      // 🔐 Password hashing hooks
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