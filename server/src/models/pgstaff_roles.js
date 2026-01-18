import _sequelize from 'sequelize';
const { Model } = _sequelize;

export default class pgstaff_roles extends Model {
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
          key: 'pg_staff_id'
        }
      },
      role_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: 'roles',
          key: 'role_id'
        }
      },
      employment_type: {
        type: DataTypes.ENUM('Internal', 'External'),
        allowNull: false
      },
      role_level: {
        type: DataTypes.ENUM('Director', 'Executive', 'Not Applicable'),
        allowNull: true
      },
      Dep_Code: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: 'tbldepartments',
          key: 'Dep_Code'
        }
      }
    }, {
      sequelize,
      tableName: 'pgstaff_roles',
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
          name: "fk_dep_code_pgstaff",
          using: "BTREE",
          fields: [
            { name: "Dep_Code" },
          ]
        },
        {
          name: "fk_pgstaff_id",
          using: "BTREE",
          fields: [
            { name: "pg_staff_id" },
          ]
        },
        {
          name: "fk_role_id_pgstaff",
          using: "BTREE",
          fields: [
            { name: "role_id" },
          ]
        },
      ]
    });
  }
}
