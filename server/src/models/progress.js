import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class progress extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    progress_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    thesis_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'thesis',
        key: 'thesis_id'
      }
    },
    milestone_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    progress_percentage: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_updated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'progress',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "progress_id" },
        ]
      },
      {
        name: "fk_progress_thesis",
        using: "BTREE",
        fields: [
          { name: "thesis_id" },
        ]
      },
    ]
  });
  }
}
