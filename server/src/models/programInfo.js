export default (sequelize, DataTypes) => {
  return sequelize.define('program_info', {
    Prog_Code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    Dep_Code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: 'tbldepartments',
        key: 'Dep_Code'
      }
    },
    prog_name: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    Creation_Date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    tableName: 'program_info',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Prog_Code" },
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

