import bcrypt from 'bcryptjs';
import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class master_stu extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    master_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    stu_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'studinfo',
        key: 'stu_id'
      }
    },
    FirstName: {
      type: DataTypes.STRING(100),
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
      type: DataTypes.STRING(500),
      allowNull: false
    },
    Dep_Code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: 'tbldepartments',
        key: 'Dep_Code'
      }
    },
    Prog_Code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: 'program_info',
        key: 'Prog_Code'
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
      tableName: 'master_stu',
      timestamps: false,
      indexes: [
        { name: "PRIMARY", unique: true, using: "BTREE", fields: ['master_id'] },
        { name: "fk_stu_master", using: "BTREE", fields: ['stu_id'] },
        { name: "fk_dep_code_master", using: "BTREE", fields: ['Dep_Code'] },
        { name: "fk_program_code_master", using: "BTREE", fields: ['Prog_Code'] },
        { name: "fk_role_master_stu", using: "BTREE", fields: ['role_id'] }
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

    // ✅ Instance method to check password
    MasterStu.prototype.checkPassword = function(plainPassword) {
      return bcrypt.compare(plainPassword, this.Password);
    };

    return MasterStu;
  }
}
