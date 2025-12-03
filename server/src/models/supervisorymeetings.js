export default (sequelize, DataTypes) => {
  return sequelize.define('supervisory_meetings', {
    meeting_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    stu_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'master_stu',
        key: 'stu_id'
      }
    },
    supervisor_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'supervisor',
        key: 'emp_id'
      }
    },
    co_supervisor_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'supervisor',
        key: 'emp_id'
      }
    },
    meeting_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Semester: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    meeting_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    supervisory_method: {
      type: DataTypes.ENUM('Face to face','Online'),
      allowNull: false
    },
    research_progress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    supervisor_feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    issues_challenges: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    suggested_action: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    discussion_summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    student_signature: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    supervisor_signature: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    suv_sign_date: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    co_supervisor_signature: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    co_suv_sign_date: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    submission_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    tableName: 'supervisory_meetings',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "meeting_id" },
        ]
      },
      {
        name: "stu_id",
        using: "BTREE",
        fields: [
          { name: "stu_id" },
        ]
      },
      {
        name: "supervisor_id",
        using: "BTREE",
        fields: [
          { name: "supervisor_id" },
        ]
      },
      {
        name: "co_supervisor_id",
        using: "BTREE",
        fields: [
          { name: "co_supervisor_id" },
        ]
      },
    ]
  });
};

