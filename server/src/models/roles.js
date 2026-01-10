import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class roles extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      role_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true,
        field: 'role_id'
      },
      role_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'role_name'
      },
      Creation_Date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'Creation_Date'
      },
      Dep_Code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'Dep_Code'
      }
    }, {
      sequelize,
      tableName: 'roles',
      freezeTableName: true,
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
  }
}