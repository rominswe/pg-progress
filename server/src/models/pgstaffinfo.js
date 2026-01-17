import _sequelize from 'sequelize';
import bcrypt from 'bcryptjs';
const { Model } = _sequelize;

export default class pgstaffinfo extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      pg_staff_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        primaryKey: true
      },
      emp_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        references: {
          model: 'empinfo',
          key: 'emp_id'
        }
      },
      FirstName: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      LastName: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      EmailId: {
        type: DataTypes.STRING(200),
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
      Address: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      Phonenumber: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      Profile_Image: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      Status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Pending'),
        allowNull: false,
        defaultValue: "Pending"
      },
      RegDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      Affiliation: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "Albukhary International University"
      },
      Univ_Domain: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Country: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "Not Provided"
      },
      Passport: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "Not Provided"
      },
      Academic_Rank: {
        type: DataTypes.ENUM('Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer', 'Assistant Lecturer', 'Research Fellow', 'Adjunct Professor', 'Visiting Professor'),
        allowNull: true
      },
      Honorific_Titles: {
        type: DataTypes.ENUM('Prof.', 'Assoc. Prof.', 'Dr.', 'Ir.', 'Ts.', 'Grs.', 'Sr.', 'Ar.', 'Tuan', 'Puan', 'Cik'),
        allowNull: true
      },
      EndDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      IsVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'pgstaffinfo',
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "pg_staff_id" },
          ]
        },
        {
          name: "fk_emp_pgstaff",
          using: "BTREE",
          fields: [
            { name: "emp_id" },
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
