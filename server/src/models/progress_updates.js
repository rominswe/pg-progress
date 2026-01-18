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
            student_id: {
                type: DataTypes.STRING(20),
                allowNull: false
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
            document_path: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
            status: {
                type: DataTypes.ENUM('Pending Review', 'Reviewed'),
                defaultValue: 'Pending Review',
                allowNull: false
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
                defaultValue: DataTypes.NOW,
                allowNull: false
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'progress_updates',
            timestamps: false,
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
                    name: "student_idx",
                    using: "BTREE",
                    fields: [
                        { name: "student_id" },
                    ]
                }
            ]
        });
    }
}
