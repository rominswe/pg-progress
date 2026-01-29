import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class service_requests extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            request_id: {
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
            current_semester: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            service_category: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            request_details: {
                type: DataTypes.JSON,
                allowNull: true
            },
            status: {
                type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'More Info'),
                allowNull: false,
                defaultValue: "Pending"
            },
            submission_date: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            signature: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'service_requests',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "request_id" },
                    ]
                },
                {
                    name: "fk_service_request_pgstud_id",
                    using: "BTREE",
                    fields: [
                        { name: "pg_student_id" },
                    ]
                },
            ]
        });
    }
}
