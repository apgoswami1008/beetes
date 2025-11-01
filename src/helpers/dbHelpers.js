// helpers/dbHelpers.js
const { Op } = require("sequelize");

/**
 * Delete a record by ID
 * Works for both soft delete (if paranoid: true) and hard delete
 * @param {Model} model - Sequelize model
 * @param {number} id - Record ID to delete
 * @param {boolean} [force=false] - Set true for permanent delete even if paranoid enabled
 */
const deleteRecord = async (model, id, force = false) => {
  try {
    const record = await model.findByPk(id);
    if (!record) {
      return {
        success: false,
        statusCode: 404,
        message: "Record not found",
      };
    }

    await record.destroy({ force });
    return {
      success: true,
      statusCode: 200,
      message: force
        ? "Record permanently deleted successfully"
        : "Record deleted successfully",
    };
  } catch (error) {
    console.error("❌ Delete Record Error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Something went wrong while deleting record",
      error: error.message,
    };
  }
};

/**
 * Toggle Boolean Status Field (default: isActive)
 * Example: Active/Inactive, Published/Unpublished, etc.
 * @param {Model} model - Sequelize model
 * @param {number} id - Record ID
 * @param {string} [fieldName='isActive'] - Field name to toggle
 */
const toggleStatus = async (model, id, fieldName = "isActive") => {
  try {
    const record = await model.findByPk(id);
    if (!record) {
      return {
        success: false,
        statusCode: 404,
        message: "Record not found",
      };
    }

    record[fieldName] = !record[fieldName];
    await record.save();

    return {
      success: true,
      statusCode: 200,
      message: `${fieldName} changed successfully`,
      data: {
        id: record.id,
        [fieldName]: record[fieldName],
      },
    };
  } catch (error) {
    console.error("❌ Toggle Status Error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Something went wrong while changing status",
      error: error.message,
    };
  }
};

module.exports = {
  deleteRecord,
  toggleStatus,
};
