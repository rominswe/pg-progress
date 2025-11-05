import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class supervisor extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    emp_id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false
    },
    emp_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "emp_email"
    },
    Phone_Num: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Password: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    Dep_Code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Designation: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Role: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "Supervisor"
    },
    Profession: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Bio_Text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "Active"
    },
    Office_Address: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    Office_Hours: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Qualification: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    Specialization: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    Joining_Date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Experience_Years: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Profile_Image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    V_Code: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    V_Status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
  }, {
    sequelize,
    tableName: 'supervisor',
    timestamps: true,
    createdAt: 'Created_At',
    updatedAt: 'Updated_At',
  });
  }
}
