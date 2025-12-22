import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class VerificationToken extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    user_table: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'VerificationToken',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "token" },
        ]
      },
    ]
  });
  }
}
