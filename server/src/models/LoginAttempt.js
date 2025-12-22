import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class LoginAttempt extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'LoginAttempt',
    timestamps: true,
    indexes: [
      {
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
