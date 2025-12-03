export default (sequelize, DataTypes) => {
  return sequelize.define('thesis', {
    thesis_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    topic: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    submission_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "Pending"
    },
    stu_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    emp_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'thesis',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "thesis_id" },
        ]
      },
      {
        name: "student_id",
        using: "BTREE",
        fields: [
          { name: "stu_id" },
        ]
      },
      {
        name: "supervisor_id",
        using: "BTREE",
        fields: [
          { name: "emp_id" },
        ]
      },
    ]
  });
};

