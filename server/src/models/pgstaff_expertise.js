import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class pgstaff_expertise extends Model {
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
      expertise_code: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'pgstaff_expertise',
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
          name: "fk_pgstaff_expertise",
          using: "BTREE",
          fields: [
            { name: "pg_staff_id" },
          ]
        },
      ]
    });
  }
}
