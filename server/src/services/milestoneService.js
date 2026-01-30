import { documents_uploads, milestones, milestone_templates, pgstudinfo, pgstaffinfo, studinfo } from "../config/config.js";
import { Op } from "sequelize";

class MilestoneService {
  async getTemplates(filters = {}) {
    const where = { is_active: true };

    if (filters.programId) {
      where[Op.or] = [
        { program_id: filters.programId },
        { program_id: null } // Include global templates
      ];
    }

    if (filters.departmentId) {
      where[Op.or] = [
        { department_id: filters.departmentId },
        { department_id: null } // Include global templates
      ];
    }

    return milestone_templates.findAll({
      where,
      order: [
        ["sort_order", "ASC"],
        ["id", "ASC"],
      ],
    });
  }

  async createTemplate(data) {
    const nextOrder = (await milestone_templates.max("sort_order")) ?? 0;
    return milestone_templates.create({
      ...data,
      sort_order: data.sort_order ?? nextOrder + 1,
    });
  }

  async updateTemplate(id, data) {
    const template = await milestone_templates.findByPk(id);
    if (!template) {
      const err = new Error("Milestone template not found");
      err.status = 404;
      throw err;
    }
    await template.update(data);
    return template;
  }

  async deleteTemplate(id) {
    const template = await milestone_templates.findByPk(id);
    if (!template) {
      const err = new Error("Milestone template not found");
      err.status = 404;
      throw err;
    }
    // Soft delete
    await template.update({ is_active: false });
    return template;
  }

  async findTemplateByName(name) {
    return milestone_templates.findOne({
      where: { name, is_active: true },
    });
  }

  async findTemplateById(id) {
    return milestone_templates.findOne({
      where: { id, is_active: true },
    });
  }

  async upsertStudentDeadline({ milestone_name, pg_student_id, deadline_date, reason, updated_by, alert_lead_days }) {
    const template = await this.findTemplateByName(milestone_name);
    if (!template) {
      const err = new Error(`Milestone template "${milestone_name}" not found`);
      err.status = 404;
      throw err;
    }

    const templateAlertLeadDays = template.alert_lead_days ?? 7;
    const overrideLead = alert_lead_days ?? templateAlertLeadDays;

    const [override, created] = await milestones.findOrCreate({
      where: {
        pgstudent_id: pg_student_id,
        template_id: template.id,
      },
      defaults: {
        name: template.name,
        description: template.description,
        type: template.type,
        document_type: template.document_type,
        sort_order: template.sort_order,
        pgstudent_id: pg_student_id,
        template_id: template.id,
        deadline_date,
        reason,
        updated_by,
        alert_lead_days: overrideLead,
      },
    });

    if (!created) {
      await override.update({
        deadline_date,
        reason,
        updated_by,
        alert_lead_days: overrideLead,
      });
    }

    return override;
  }

  async getStudentMilestones(studentId) {
    if (!studentId) {
      const err = new Error("Student ID is required");
      err.status = 400;
      throw err;
    }

    const templates = await this.getTemplates();
    const docs = await documents_uploads.findAll({
      where: { pg_student_id: studentId },
      order: [["uploaded_at", "DESC"]],
    });

    const overrides = await milestones.findAll({
      where: { pgstudent_id: studentId },
    });

    const overrideMap = new Map(overrides.map((item) => [item.template_id, item]));

    const docsByType = new Map();
    docs.forEach((doc) => {
      const key = doc.document_type || doc.document_name;
      if (!docsByType.has(key)) docsByType.set(key, []);
      docsByType.get(key).push(doc);
    });

    const completedStatuses = new Set(["Approved", "Completed"]);
    const isTemplateComplete = (template, records) => {
      if (template.document_type === "Final Thesis") {
        return records.some((doc) => doc.status === "Completed");
      }
      return records.some((doc) => completedStatuses.has(doc.status));
    };

    let nextActiveIndex = templates.length;
    for (let i = 0; i < templates.length; i += 1) {
      const template = templates[i];
      const docRecords = docsByType.get(template.document_type || template.name) || [];
      if (!isTemplateComplete(template, docRecords)) {
        nextActiveIndex = i;
        break;
      }
    }

    return templates.map((template, index) => {
      const docRecords = docsByType.get(template.document_type || template.name) || [];
      const override = overrideMap.get(template.id);

      const hasPending = docRecords.some((doc) => doc.status === "Pending");
      const isApprovedButFinal =
        template.document_type === "Final Thesis" &&
        docRecords.some((doc) => doc.status === "Approved");
      const completed = isTemplateComplete(template, docRecords);

      let status = "pending";
      if (completed) {
        status = "completed";
      } else if (hasPending || isApprovedButFinal || index === nextActiveIndex) {
        status = "in-progress";
      }

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        type: template.type,
        sort_order: template.sort_order,
        default_due_days: template.default_due_days,
        document_type: template.document_type || template.name,
        status,
        document_status: docRecords[0]?.status || null,
        last_submission: docRecords[0]?.uploaded_at || null,
        custom_deadline: override
          ? {
            deadline_date: override.deadline_date,
            reason: override.reason,
            updated_by: override.updated_by,
            alert_lead_days: override.alert_lead_days,
          }
          : null,
      };
    });
  }

  async listOverrides({ studentId } = {}) {
    const where = {
      pgstudent_id: { [Op.ne]: null },
    };

    if (studentId) {
      where.pgstudent_id = studentId;
    }

    return milestones.findAll({
      where,
      include: [
        {
          model: milestone_templates,
          as: "template",
          attributes: ["id", "name", "type"],
        },
        {
          model: pgstudinfo,
          as: "pg_student",
          attributes: ["pgstud_id", "FirstName", "LastName", "EmailId"],
          include: [{ model: studinfo, as: "stu", attributes: ["FirstName", "LastName"] }],
        },
        {
          model: pgstaffinfo,
          as: "staff",
          attributes: ["pgstaff_id", "FirstName", "LastName"],
        },
      ],
      order: [["deadline_date", "ASC"]],
    });
  }
}

export default new MilestoneService();
