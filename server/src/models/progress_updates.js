import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class progress_updates extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            update_id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
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
            title: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            achievements: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            challenges: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            next_steps: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM('Pending Review', 'Reviewed'),
                allowNull: false,
                defaultValue: "Pending Review"
            },
            supervisor_feedback: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            reviewed_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
            submission_date: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            document_path: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'progress_updates',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "update_id" },
                    ]
                },
                {
                    name: "fk_progress_updates_pgstud_id",
                    using: "BTREE",
                    fields: [
                        { name: "pg_student_id" },
                    ]
                },
            ]
        });
    }
}
