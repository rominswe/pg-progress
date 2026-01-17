import _sequelize from 'sequelize';
import bcrypt from 'bcryptjs';
const { Model } = _sequelize;

export default class pgstudinfo extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      pgstud_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true
      },
      stu_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
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
        type: DataTypes.STRING(100),
        allowNull: false
      },
      Phonenumber: {
        type: DataTypes.CHAR(20),
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
      role_level: {
        type: DataTypes.ENUM('Master Student', 'Doctoral Student'),
        allowNull: false,
        defaultValue: "Master Student"
      },
      Status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Pending'),
        allowNull: false,
        defaultValue: "Pending"
      },
      Country: {
        type: DataTypes.STRING(300),
        allowNull: false
      },
      Passport: {
        type: DataTypes.STRING(30),
        allowNull: true,
        defaultValue: "Not Provided"
      },
      RegDate: {
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
      Profile_Image: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'pgstudinfo',
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "pgstud_id" },
          ]
        },
        {
          name: "fk_stu_pgstu",
          using: "BTREE",
          fields: [
            { name: "stu_id" },
          ]
        },
        {
          name: "fk_dep_code_pgstu",
          using: "BTREE",
          fields: [
            { name: "Dep_Code" },
          ]
        },
        {
          name: "fk_program_code_pgstu",
          using: "BTREE",
          fields: [
            { name: "Prog_Code" },
          ]
        },
        {
          name: "fk_role_pgstu",
          using: "BTREE",
          fields: [
            { name: "role_id" },
          ]
        },
      ],
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
