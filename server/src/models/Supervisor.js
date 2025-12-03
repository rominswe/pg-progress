export default (sequelize, DataTypes) => {
  return sequelize.define('supervisor', {
    emp_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
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
      allowNull: false,
      references: {
        model: 'tbldepartments',
        key: 'Dep_Code'
      }
    },
    Designation: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Role: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "Supervisor",
      references: {
        model: 'roles',
        key: 'role_id'
      }
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
    }
  }, {
    sequelize,
    tableName: 'supervisor',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "emp_id" },
        ]
      },
      {
        name: "emp_email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "emp_email" },
        ]
      },
      {
        name: "Role",
        using: "BTREE",
        fields: [
          { name: "Role" },
        ]
      },
      {
        name: "Dep_Code",
        using: "BTREE",
        fields: [
          { name: "Dep_Code" },
        ]
      },
    ]
  });
};