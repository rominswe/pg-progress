export default (sequelize, DataTypes) => {
  return sequelize.define('evaluation', {
    evaluation_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    thesis_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    evaluator_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    evaluator_role: {
      type: DataTypes.ENUM('Supervisor','Examiner'),
      allowNull: true
    },
    score: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'evaluation',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "evaluation_id" },
        ]
      },
      {
        name: "thesis_id",
        using: "BTREE",
        fields: [
          { name: "thesis_id" },
        ]
      },
    ]
  });
};

