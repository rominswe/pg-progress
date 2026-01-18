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
            master_id: {
                type: DataTypes.STRING(20),
                allowNull: false,
                references: {
                    model: 'pgstudinfo',
                    key: 'pgstud_id'
                }
            },
            full_name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            student_id_display: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            program: {
                type: DataTypes.STRING(255),
                allowNull: false
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
                defaultValue: 'Pending',
                allowNull: false
            },
            submission_date: {
                type: DataTypes.DATEONLY,
                defaultValue: DataTypes.NOW,
                allowNull: false
            },
            signature: {
                type: DataTypes.TEXT('long'),
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'service_requests',
            timestamps: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [{ name: "request_id" }]
                },
                {
                    name: "fk_master_service_req",
                    using: "BTREE",
                    fields: [{ name: "master_id" }]
                }
            ]
        });
    }
}
