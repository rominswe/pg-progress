import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class role_assignment extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      assignment_id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      pg_student_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: 'pgstudinfo',
          key: 'pgstud_id'
        }
      },
      pg_staff_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
          model: 'pgstaffinfo',
          key: 'pg_staff_id'
        }
      },
      pg_staff_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: 'roles',
          key: 'role_id'
        }
      },
      assignment_type: {
        type: DataTypes.ENUM('Main Supervisor', 'Co-Supervisor', 'Proposal Defense Examiner', 'Final Thesis Examiner', 'Viva Voce Examiner'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: "Pending"
      },
      requested_by: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      approved_by: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      request_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      approval_date: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'role_assignment',
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "assignment_id" },
          ]
        },
        {
          name: "fk_role_assignment_pgstud_id",
          using: "BTREE",
          fields: [
            { name: "pg_student_id" },
          ]
        },
        {
          name: "fk_role_assignment_pgstaff_id",
          using: "BTREE",
          fields: [
            { name: "pg_staff_id" },
          ]
        },
        {
          name: "fk_role_assignement_pgstaff_role_id",
          using: "BTREE",
          fields: [
            { name: "pg_staff_type" },
          ]
        },
      ]
    });
  }
}
