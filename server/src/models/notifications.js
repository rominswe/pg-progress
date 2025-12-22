import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class notifications extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    notification_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    recipient_id: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    recipient_role: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    sender_id: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    sender_role: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    notification_type: {
      type: DataTypes.ENUM(
        'DEADLINE_REMINDER',
        'SUPERVISOR_COMMENT',
        'EXAM_SCHEDULE',
        'DOCUMENT_REVIEW',
        'PROGRESS_UPDATE',
        'VERIFICATION_REMINDER',
        'ACCOUNT_VERIFICATION',
        'PASSWORD_RESET',
        'SYSTEM_ALERT',
        'MEETING_REMINDER'
      ),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
      allowNull: false,
      defaultValue: 'MEDIUM'
    },
    status: {
      type: DataTypes.ENUM('UNREAD', 'READ', 'ARCHIVED'),
      allowNull: false,
      defaultValue: 'UNREAD'
    },
    email_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    email_sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    related_entity_type: {
      type: DataTypes.ENUM(
        'USER',
        'DOCUMENT',
        'PROGRESS',
        'MEETING',
        'EXAM',
        'DEADLINE',
        'SYSTEM'
      ),
      allowNull: true
    },
    related_entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    action_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'notifications',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "notification_id" },
        ]
      },
      {
        name: "idx_recipient",
        using: "BTREE",
        fields: [
          { name: "recipient_id", "recipient_role" },
        ]
      },
      {
        name: "idx_type_status",
        using: "BTREE",
        fields: [
          { name: "notification_type", "status" },
        ]
      },
      {
        name: "idx_created_at",
        using: "BTREE",
        fields: [
          { name: "created_at" },
        ]
      },
    ]
  });
  }
}