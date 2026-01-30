import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class milestones extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Document"
      },
      document_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "The document type this milestone tracks"
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      default_due_days: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      alert_lead_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Custom reminder lead time in days for this override"
      },
      pgstudent_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        references: {
          model: 'pgstudinfo',
          key: 'pgstud_id'
        },
        charset: "latin1",
        collate: "latin1_swedish_ci"
      },
      template_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      deadline_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "Active"
      },
      updated_by: {
        type: DataTypes.STRING(20),
        allowNull: true,
        references: {
          model: 'pgstaffinfo',
          key: 'pgstaff_id'
        },
        charset: "latin1",
        collate: "latin1_swedish_ci"
      }
    }, {
      sequelize,
      tableName: 'milestones',
      timestamps: true,
      charset: "latin1",
      collate: "latin1_swedish_ci",
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
          name: "idx_milestone_student",
          using: "BTREE",
          fields: [
            { name: "pgstudent_id" },
          ]
        },
        {
          name: "idx_milestone_template",
          using: "BTREE",
          fields: [
            { name: "template_id" },
          ]
        },
        {
          name: "idx_milestone_staff",
          using: "BTREE",
          fields: [
            { name: "updated_by" },
          ]
        },
      ]
    });
  }
}
