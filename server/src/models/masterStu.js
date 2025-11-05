import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class masterStu extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    stu_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'studinfo',
        key: 'stu_id'
      }
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
      allowNull: false
    },
    Prog_Code: {
      type: DataTypes.STRING(100),
      allowNull: false
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
      allowNull: true
    },
    Co_Supervisor: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    Co_S_Suv: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    Co_T_Suv: {
      type: DataTypes.STRING(20),
      allowNull: true
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
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'master_stu',
    timestamps: false,
    indexes: [
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
  }
}
