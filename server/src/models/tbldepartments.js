import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class tbldepartments extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      Dep_Code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        primaryKey: true,
        field: 'Dep_Code'
      },
      DepartmentName: {
        type: DataTypes.STRING(150),
        allowNull: true,
        field: 'DepartmentName'
      },
      CreationDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'CreationDate'
      }
    }, {
      sequelize,
      tableName: 'tbldepartments',
      timestamps: false,
      freezeTableName: true,
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
  }
}