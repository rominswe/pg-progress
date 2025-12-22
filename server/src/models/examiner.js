import bcrypt from 'bcryptjs';
import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class examiner extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    examiner_id: {
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
      type: DataTypes.ENUM('Active','Inactive'),
      allowNull: false
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
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    MustChangePassword: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
    }, {
      sequelize,
      tableName: 'examiner',
      timestamps: false,
      indexes: [
        { name: "PRIMARY", unique: true, using: "BTREE", fields: ['examiner_id'] },
        { name: "fk_emp_examiner", using: "BTREE", fields: ['emp_id'] },
        { name: "fk_dep_code_examiner", using: "BTREE", fields: ['Dep_Code'] },
        { name: "fk_role_examiner", using: "BTREE", fields: ['role_id'] }
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

    // ✅ Instance method for login
    Examiner.prototype.checkPassword = function(plainPassword) {
      return bcrypt.compare(plainPassword, this.Password);
    };

    return Examiner;
  }
}