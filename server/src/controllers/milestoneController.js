import milestoneService from "../services/milestoneService.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export const listTemplates = async (req, res) => {
  try {
    const templates = await milestoneService.getTemplates();
    sendSuccess(res, "Milestone templates fetched", { templates });
  } catch (err) {
    sendError(res, err.message || "Failed to fetch milestones", err.status || 500);
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, description, type, sort_order, default_due_days } = req.body;
    if (!name) return sendError(res, "Name is required", 400);
    const template = await milestoneService.createTemplate({
      name,
      description,
      type,
      sort_order,
      default_due_days,
    });
    sendSuccess(res, "Milestone template created", { template }, 201);
  } catch (err) {
    sendError(res, err.message || "Failed to create milestone", err.status || 500);
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, sort_order, default_due_days } = req.body;
    const template = await milestoneService.updateTemplate(id, {
      name,
      description,
      type,
      sort_order,
      default_due_days,
    });
    sendSuccess(res, "Milestone template updated", { template });
  } catch (err) {
    sendError(res, err.message || "Failed to update milestone", err.status || 500);
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await milestoneService.deleteTemplate(id);
    sendSuccess(res, "Milestone template deleted");
  } catch (err) {
    sendError(res, err.message || "Failed to delete milestone", err.status || 500);
  }
};

export const listOverrides = async (req, res) => {
  try {
    const overrides = await milestoneService.listOverrides({
      studentId: req.query.student_id,
    });
    sendSuccess(res, "Milestone overrides fetched", { overrides });
  } catch (err) {
    sendError(res, err.message || "Failed to fetch milestone overrides", err.status || 500);
  }
};

export const getStudentMilestones = async (req, res) => {
  try {
    const studentId =
      req.user.role_id === "STU"
        ? req.user.pgstud_id || req.user.id
        : req.query.student_id;
    if (!studentId) {
      return sendError(res, "Student ID is required", 400);
    }
    const milestones = await milestoneService.getStudentMilestones(studentId);
    sendSuccess(res, "Student milestones fetched", { milestones });
  } catch (err) {
    sendError(res, err.message || "Failed to fetch student milestones", err.status || 500);
  }
};
