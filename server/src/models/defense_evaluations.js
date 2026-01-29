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
            pg_student_id: {
                type: DataTypes.STRING(50),
                allowNull: false,
                references: {
                    model: 'pgstudinfo',
                    key: 'pgstud_id'
                }
            },
            defense_type: {
                type: DataTypes.ENUM('Proposal Defense', 'Final Thesis'),
                allowNull: false
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
            evaluation_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            evaluator_role: {
                type: DataTypes.STRING(20),
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'role_id'
                }
            },
            evaluator_id: {
                type: DataTypes.STRING(50),
                allowNull: true,
                references: {
                    model: 'pgstaffinfo',
                    key: 'pgstaff_id'
                }
            },
            viva_outcome: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'defense_evaluations',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
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
                    name: "fk_defense_evaluations_roles_id",
                    using: "BTREE",
                    fields: [
                        { name: "evaluator_role" },
                    ]
                },
                {
                    name: "fk_defense_evaluations_pgstud_id",
                    using: "BTREE",
                    fields: [
                        { name: "pg_student_id" },
                    ]
                },
                {
                    name: "fk_defense_evaluations_pgstaff_id",
                    using: "BTREE",
                    fields: [
                        { name: "evaluator_id" },
                    ]
                },
            ]
        });
    }
}
