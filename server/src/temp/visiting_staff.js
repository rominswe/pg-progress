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
      allowNull: false,
      unique: "visiting_staff__email_id"
    },
    Gender: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Country: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    Passport: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    Dob: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Address: {
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
    Expertise: {
      type: DataTypes.STRING(255),
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
    EndDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Dep_Code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: 'tbldepartments',
        key: 'Dep_Code'
      }
    }
  }, {
    sequelize,
    tableName: 'visiting_staff',
    timestamps: false,
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
        name: "visiting_staff_visiting_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "visiting_id" },
        ]
      },
      {
        name: "visiting_staff__email_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "EmailId" },
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
      {
        name: "visiting_staff_role_id",
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
      {
        name: "visiting_staff__dep__code",
        using: "BTREE",
        fields: [
          { name: "Dep_Code" },
        ]
      },
    ]
  });
  }
}
