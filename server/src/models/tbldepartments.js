import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class tbldepartments extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
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
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
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
  }
}
