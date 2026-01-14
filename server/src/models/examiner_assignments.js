
import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class examiner_assignments extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            assignment_id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            examiner_id: {
                type: DataTypes.STRING(20),
                allowNull: false,
                references: {
                    model: 'examiner',
                    key: 'examiner_id'
                }
            },
            student_id: {
                type: DataTypes.STRING(20),
                allowNull: false,
                references: {
                    model: 'master_stu',
                    key: 'master_id'
                }
            },
            assigned_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            status: {
                type: DataTypes.ENUM('Active', 'Completed', 'Cancelled'),
                allowNull: false,
                defaultValue: 'Active'
            }
        }, {
            sequelize,
            tableName: 'examiner_assignments',
            timestamps: true,
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
                    name: "unique_assignment",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "examiner_id" },
                        { name: "student_id" }
                    ]
                }
            ]
        });
    }
}
