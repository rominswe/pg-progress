import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class AuditLog extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    audit_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'User identifier (email, ID, etc.)'
    },
    user_role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'User role at time of action'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Action performed (LOGIN, UPLOAD_DOCUMENT, etc.)'
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Type of entity affected (USER, DOCUMENT, PROGRESS, etc.)'
    },
    entity_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'ID of the affected entity'
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detailed description of the action'
    },
    old_values: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Previous values before change (for updates)'
    },
    new_values: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'New values after change (for updates)'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: false,
      comment: 'Client IP address'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Browser/client user agent'
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Session identifier for tracking'
    },
    status: {
      type: DataTypes.ENUM('SUCCESS', 'FAILURE', 'WARNING'),
      allowNull: false,
      defaultValue: 'SUCCESS',
      comment: 'Outcome of the action'
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error details if action failed'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: 'Timestamp of the action'
    }
  }, {
    sequelize,
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "audit_id" },
        ]
      },
      {
        name: "idx_user_action",
        using: "BTREE",
        fields: [
          { name: "user_id" },
          { name: "action" }
        ]
      },
      {
        name: "idx_entity",
        using: "BTREE",
        fields: [
          { name: "entity_type" },
          { name: "entity_id" }
        ]
      },
      {
        name: "idx_timestamp",
        using: "BTREE",
        fields: [
          { name: "created_at" }
        ]
      },
      {
        name: "idx_status",
        using: "BTREE",
        fields: [
          { name: "status" }
        ]
      }
    ]
  });
  }
}
