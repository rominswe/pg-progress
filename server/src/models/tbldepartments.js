export default (sequelize, DataTypes) => {
  return sequelize.define('tbldepartments', {
    Dep_Code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    DepartmentName: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    CreationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    tableName: 'tbldepartments',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Dep_Code" },
        ]
      },
    ]
  });
};

