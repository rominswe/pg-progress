import bcrypt from 'bcryptjs';
import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class studinfo extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      stu_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true,
        field: 'stu_id'
      },
      Dep_Code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'Dep_Code'
      },
      Prog_Code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'Prog_Code'
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
      Gender: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'Gender'
      },
      Dob: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'Dob'
      },
      Acad_Year: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'Acad_Year'
      },
      Exp_GraduatedYear: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'Exp_GraduatedYear'
      },
      Address: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Address'
      },
      Av_leave: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: 'Av_leave'
      },
      Phonenumber: {
        type: DataTypes.CHAR(20),
        allowNull: false,
        field: 'Phonenumber'
      },
      Status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Status'
      },
      RegDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'RegDate'
      },
      role: {
        type: DataTypes.STRING(30),
        allowNull: false,
        field: 'role'
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'location'
      },
      ID_Image: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'ID_Image'
      },
      Country: {
        type: DataTypes.STRING(300),
        allowNull: true,
        field: 'Country'
      },
      Passport: {
        type: DataTypes.STRING(30),
        allowNull: true,
        field: 'Passport'
      },
      Roomnum: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: 'Roomnum'
      },
      Vcode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'Vcode'
      },
      Isverified: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Isverified'
      }
    }, {
      sequelize,
      tableName: 'studinfo',
      freezeTableName: true,
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "stu_id" },
          ]
        },
        {
          name: "Dep_Code",
          using: "BTREE",
          fields: [
            { name: "Dep_Code" },
          ]
        },
        {
          name: "Prog_Code",
          using: "BTREE",
          fields: [
            { name: "Prog_Code" },
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