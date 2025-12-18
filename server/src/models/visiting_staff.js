import bcrypt from 'bcryptjs';
import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class visiting_staff extends Model {
  static init(sequelize, DataTypes) {
    const VisitingStaff = super.init({
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
      Affiliation: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      RegDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      EndDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      Bio_Text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      role_id: {
        type: DataTypes.ENUM('Examiner','Supervisor'),
        allowNull: false,
        defaultValue: "Examiner"
      },
      Vcode: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      Status: {
        type: DataTypes.ENUM('Active','Inactive'),
        allowNull: false,
        defaultValue: "Active"
      },
      StartDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'visiting_staff',
      timestamps: false,
      indexes: [
        { name: "PRIMARY", unique: true, using: "BTREE", fields: ['visiting_id'] }
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