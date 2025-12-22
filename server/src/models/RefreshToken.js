import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class RefreshToken extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    'userId:': {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    user_table: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    tokenId: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'RefreshToken',
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
