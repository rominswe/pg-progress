import bcrypt from 'bcryptjs';
import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class visiting_staff extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
    visiting_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
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
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Phonenumber: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    Profile_Image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Bio_Text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Affiliation: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    Dep_Code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: 'tbldepartments',
        key: 'Dep_Code'
      }
    },
    MustChangePassword: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
    }, {
      sequelize,
      tableName: 'visiting_staff',
      timestamps: false,
      indexes: [
        { name: "PRIMARY", unique: true, using: "BTREE", fields: ['visiting_id'] },
        { name: "fk_dep_code_visiting_staff", using: "BTREE", fields: ['Dep_Code'] },
        { name: "fk_role_visiting_staff", using: "BTREE", fields: ['role_id'] }
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

    // ✅ Instance method to check password
    VisitingStaff.prototype.checkPassword = function(plainPassword) {
      return bcrypt.compare(plainPassword, this.Password);
    };

    return VisitingStaff;
  }
}