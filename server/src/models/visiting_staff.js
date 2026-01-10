import bcrypt from 'bcryptjs';
import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class visiting_staff extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      visiting_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
        field: 'visiting_id'
      },
      FirstName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'FirstName'
      },
      LastName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'LastName'
      },
      EmailId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'EmailId'
      },
      Password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Password'
      },
      Phonenumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'Phonennumber'
      },
      Profile_Image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'Profile_Image'
      },
      Expertise: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Expertise'
      },
      Affiliation: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Affiliation'
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
      Dep_Code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        references: {
          model: 'tbldepartments',
          key: 'Dep_Code'
        },
        field: 'Dep_Code'
      },
      MustChangePassword: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
        field: 'MustChangePassword'
      }
    }, {
      sequelize,
      tableName: 'visiting_staff',
      timestamps: false,
      freezeTableName: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "visiting_id" },
          ]
        },
        {
          name: "fk_role_visiting_staff",
          using: "BTREE",
          fields: [
            { name: "role_id" },
          ]
        },
        {
          name: "fk_dep_code_visiting_staff",
          using: "BTREE",
          fields: [
            { name: "Dep_Code" },
          ]
        },
      ],

      // 🔐 Password hashing hooks
      hooks: {
        beforeCreate: async (staff) => {
          if (staff.Password) {
            staff.Password = await bcrypt.hash(staff.Password, 10);
          }
        },
        beforeUpdate: async (staff) => {
          if (staff.changed('Password')) {
            staff.Password = await bcrypt.hash(staff.Password, 10);
          }
        }
      }
    });
  }
}