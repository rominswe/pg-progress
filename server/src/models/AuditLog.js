import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class AuditLog extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    role_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    event: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    userAgent: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'AuditLog',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
  }
}
