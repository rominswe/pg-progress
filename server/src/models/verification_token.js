import _sequelize from 'sequelize';
const { Model} = _sequelize;

export default class verification_token extends Model {
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
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'verification_token',
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