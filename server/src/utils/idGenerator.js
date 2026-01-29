import { Op } from "sequelize";

/**
 * Generates a sequential, human-readable ID based on the current year and month.
 * Format: <PREFIX><YYMM><NNNN>
 * 
 * @param {import('sequelize').Model} Model - The Sequelize model to query
 * @param {string} idColumn - The primary key or ID column name
 * @param {string} prefix - The role-specific prefix (e.g., SUV, MST, EXA)
 * @param {object} options - Optional parameters (e.g., transaction)
 * @returns {Promise<string>} - The generated sequential ID
 */
export const generateSequentialId = async (Model, idColumn, prefix, options = {}) => {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, "0");
    const yymm = `${yy}${mm}`;
    const prefixPattern = `${prefix}${yymm}`;

    // Find the last record with the same prefix and month
    const lastRecord = await Model.findOne({
        where: {
            [idColumn]: {
                [Op.like]: `${prefixPattern}%`
            }
        },
        order: [[idColumn, "DESC"]],
        attributes: [idColumn],
        transaction: options.transaction,
        lock: options.transaction ? true : false // pessimistic lock if in transaction
    });

    let nextNumber = 1;
    if (lastRecord) {
        const lastId = lastRecord[idColumn];
        const sequencePart = lastId.replace(prefixPattern, "");
        const lastNumber = parseInt(sequencePart, 10);
        if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
        }
    }

    const nnnn = nextNumber.toString().padStart(4, "0");
    return `${prefixPattern}${nnnn}`;
};
