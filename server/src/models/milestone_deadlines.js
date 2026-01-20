import _sequelize from 'sequelize';
const { Model } = _sequelize;

export default class milestone_deadlines extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            pgstudent_id: {
                type: DataTypes.STRING(20),
                allowNull: false,
                references: {
                    model: 'pgstudinfo',
                    key: 'pgstud_id'
                }
            },
            milestone_name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            deadline_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            reason: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            updated_by: {
                type: DataTypes.STRING(20),
                allowNull: false,
                references: {
                    model: 'pgstaffinfo',
                    key: 'pgstaff_id'
                }
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        }, {
            sequelize,
            tableName: 'milestone_deadlines',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
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
                    name: "fk_student_deadline",
                    using: "BTREE",
                    fields: [
                        { name: "pgstudent_id" },
                    ]
                },
                {
                    name: "fk_staff_deadline",
                    using: "BTREE",
                    fields: [
                        { name: "updated_by" },
                    ]
                },
            ]
        });
    }
}
