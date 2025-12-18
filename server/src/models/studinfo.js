import bcrypt from 'bcryptjs';
import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class studinfo extends Model {
  static init(sequelize, DataTypes) {
    const StudInfo = super.init({
      stu_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true
      },
      Dep_Code: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      Prog_Code: {
        type: DataTypes.STRING(100),
        allowNull: false
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
      Gender: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      Dob: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      Acad_Year: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      Exp_GraduatedYear: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      Address: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      Av_leave: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      Phonenumber: {
        type: DataTypes.CHAR(20),
        allowNull: false
      },
      Status: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      RegDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      role: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      ID_Image: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      Country: {
        type: DataTypes.STRING(300),
        allowNull: true
      },
      Passport: {
        type: DataTypes.STRING(30),
        allowNull: true
      },
      Roomnum: {
        type: DataTypes.STRING(15),
        allowNull: true
      },
      Vcode: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      Isverified: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'studinfo',
      hasTrigger: true,
      timestamps: false,
      indexes: [
        { name: "PRIMARY", unique: true, using: "BTREE", fields: ['stu_id'] },
        { name: "Dep_Code", using: "BTREE", fields: ['Dep_Code'] },
        { name: "Prog_Code", using: "BTREE", fields: ['Prog_Code'] }
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

    // ✅ Instance method to verify password
    StudInfo.prototype.checkPassword = function(plainPassword) {
      return bcrypt.compare(plainPassword, this.Password);
    };

    return StudInfo;
  }
}