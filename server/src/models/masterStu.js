export default (sequelize, DataTypes) => {
  return sequelize.define('master_stu', {
    stu_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    stu_email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    personal_email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Phone_Num: {
      type: DataTypes.STRING(20),
      allowNull: true
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
    Role: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "Student"
    },
    Country: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Admission_Date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Exp_GrDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Research_Title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Passport_num: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Study_Mode: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    Profile_Pic: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "Active"
    },
    Supervisor: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'supervisor',
        key: 'emp_id'
      }
    },
    Co_Supervisor: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'supervisor',
        key: 'emp_id'
      }
    },
    Co_S_Suv: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'supervisor',
        key: 'emp_id'
      }
    },
    Co_T_Suv: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'supervisor',
        key: 'emp_id'
      }
    },
    Defence_Examiner: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Defence_Status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Defence_Date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Viva_Examiner: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Viva_Status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Viva_Date: {
      type: DataTypes.DATEONLY,
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
    Reg_Date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    tableName: 'master_stu',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "stu_id" },
        ]
      },
      {
        name: "Dep_Code",
        using: "BTREE",
        fields: [
          { name: "Dep_Code" },
        ]
      },
      {
        name: "Prog_Code",
        using: "BTREE",
        fields: [
          { name: "Prog_Code" },
        ]
      },
      {
        name: "Supervisor",
        using: "BTREE",
        fields: [
          { name: "Supervisor" },
        ]
      },
      {
        name: "Co_Supervisor",
        using: "BTREE",
        fields: [
          { name: "Co_Supervisor" },
        ]
      },
      {
        name: "Co_T_Suv",
        using: "BTREE",
        fields: [
          { name: "Co_T_Suv" },
        ]
      },
      {
        name: "Co_S_Suv",
        using: "BTREE",
        fields: [
          { name: "Co_S_Suv" },
        ]
      },
      {
        name: "master_stu_ibfk_1",
        using: "BTREE",
        fields: [
          { name: "stu_id" },
        ]
      },
    ]
  });
};

