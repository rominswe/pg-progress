export default (sequelize, DataTypes) => {
  return sequelize.define('cgs_admin', {
    cgs_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      primaryKey: true
    },
    emp_id: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    FirstName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    LastName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    EmailId: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    Password: {
      type: DataTypes.STRING(180),
      allowNull: false
    },
    Gender: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Dep_Code: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Phonenumber: {
      type: DataTypes.CHAR(20),
      allowNull: false
    },
    Status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    RegDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    role: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    Country: {
      type: DataTypes.STRING(300),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'cgs_admin',
    timestamps: false,
    indexes: [
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

