export default (sequelize, DataTypes) => {
  return sequelize.define('roles', {
    role_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    role_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    Creation_Date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    tableName: 'roles',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "role_id" },
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

