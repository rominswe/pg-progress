import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class program_info extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      Prog_Code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true
      },
      Dep_Code: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      prog_name: {
        type: DataTypes.STRING(300),
        allowNull: false
      },
      Creation_Date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
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
  }
}
