export default (sequelize, DataTypes) => {
  return sequelize.define('examiner', {
    examiner_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    emp_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: "unique_emp_id"
    },
    First_Name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    Last_Name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    Dep_Code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Examiner_Type: {
      type: DataTypes.ENUM('Internal','External'),
      allowNull: false,
      defaultValue: "Internal"
    },
    Affiliation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "Albukhary International University"
    },
    Specialization: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    Experience_Years: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "Active"
    }
  }, {
    sequelize,
    tableName: 'examiner',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "examiner_id" },
        ]
      },
      {
        name: "unique_emp_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "emp_id" },
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

