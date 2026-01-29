import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class pgstaff_qualification extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      pg_staff_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: 'pgstaffinfo',
          key: 'pgstaff_id'
        }
      },
      qualification_code: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'pgstaff_qualification',
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
          name: "fk_pgstaff_qualification",
          using: "BTREE",
          fields: [
            { name: "pg_staff_id" },
          ]
        },
      ]
    });
  }
}
