import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class defense_evaluations extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            evaluation_id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            student_name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            student_id: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            defense_type: {
                type: DataTypes.ENUM('Proposal Defense', 'Final Thesis'),
                allowNull: false
            },
            viva_outcome: {
                type: DataTypes.ENUM('Pass', 'Minor Corrections', 'Major Corrections', 'Fail'),
                allowNull: true // Can be null if just a proposal defense, or initially? Prompt implies it's required for submission.
            },
            semester: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            knowledge_rating: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            presentation_rating: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            response_rating: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            organization_rating: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            overall_rating: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            strengths: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            weaknesses: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            recommendations: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            final_comments: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            supervisor_name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            evaluation_date: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'defense_evaluations',
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "evaluation_id" },
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
