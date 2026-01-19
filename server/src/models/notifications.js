import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class notifications extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            user_id: {
                type: DataTypes.STRING(50),
                allowNull: false,
                comment: "Can be pgstud_id or pgstaff_id"
            },
            role_id: {
                type: DataTypes.STRING(20),
                allowNull: false
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            type: {
                type: DataTypes.STRING(50),
                allowNull: true,
                comment: "e.g., 'DOCUMENT_UPLOAD', 'REVIEW_COMPLETED', 'EVALUATION_SUBMITTED'"
            },
            link: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            is_read: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
            }
        }, {
            sequelize,
            tableName: 'notifications',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
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
                    name: "idx_user_notifications",
                    using: "BTREE",
                    fields: [
                        { name: "user_id" },
                        { name: "is_read" }
                    ]
                }
            ]
        });
    }
}
