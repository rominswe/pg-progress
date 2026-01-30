import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class milestone_templates extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            type: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: "Document"
            },
            document_type: {
                type: DataTypes.STRING(255),
                allowNull: true,
                comment: "The document type this milestone tracks"
            },
            sort_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            default_due_days: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: "Default number of days from enrollment"
            },
            alert_lead_days: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 7,
                comment: "Days before deadline to trigger reminder"
            },
            program_id: {
                type: DataTypes.STRING(20),
                allowNull: true,
                charset: "latin1",
                collate: "latin1_swedish_ci"
            },
            department_id: {
                type: DataTypes.STRING(20),
                allowNull: true,
                charset: "latin1",
                collate: "latin1_swedish_ci"
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            created_by: {
                type: DataTypes.STRING(20),
                allowNull: true,
                charset: "latin1",
                collate: "latin1_swedish_ci"
            },
            updated_by: {
                type: DataTypes.STRING(20),
                allowNull: true,
                charset: "latin1",
                collate: "latin1_swedish_ci"
            }
        }, {
            sequelize,
            tableName: 'milestone_templates',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: "latin1",
            collate: "latin1_swedish_ci",
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
                    name: "idx_template_program",
                    using: "BTREE",
                    fields: [
                        { name: "program_id" },
                    ]
                },
                {
                    name: "idx_template_dept",
                    using: "BTREE",
                    fields: [
                        { name: "department_id" },
                    ]
                },
                {
                    name: "idx_template_active",
                    using: "BTREE",
                    fields: [
                        { name: "is_active" },
                    ]
                },
                {
                    name: "idx_template_sort",
                    using: "BTREE",
                    fields: [
                        { name: "sort_order" },
                    ]
                },
            ]
        });
    }
}
