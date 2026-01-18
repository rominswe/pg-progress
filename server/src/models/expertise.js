import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class expertise extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    expertise_code: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    expertise_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Dep_Code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'tbldepartments',
        key: 'Dep_Code'
      }
    },
    Creation_Date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'expertise',
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
      {
        name: "fk_dep_code_expertise",
        using: "BTREE",
        fields: [
          { name: "Dep_Code" },
        ]
      },
    ]
  });
  }
}
