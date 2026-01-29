import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class qualification extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      qualification_code: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      qualification_level: {
        type: DataTypes.ENUM('Bachelor', 'Master', 'Doctorate', ''),
        allowNull: false
      },
      qualification_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      Creation_Date: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'qualification',
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
  }
}
