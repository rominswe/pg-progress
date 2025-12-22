import { visiting_staff } from "../config/config.js";
import { logAuthEvent } from "../utils/authSecurity.js";

/* ================= GET ALL VISITING STAFF ================= */
export const getAllVisitingStaff = async (req, res) => {
  try {
    const staff = await visiting_staff.findAll();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET VISITING STAFF BY ID ================= */
export const getVisitingStaffById = async (req, res) => {
  try {
    const staff = await visiting_staff.findByPk(req.params.staff_id);
    if (!staff) return res.status(404).json({ error: "Visiting staff not found" });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= CREATE VISITING STAFF ================= */
export const createVisitingStaff = async (req, res) => {
  try {
    const staff = await visiting_staff.create(req.body); // password hashed via hook
    await logAuthEvent(req.user.email, "EXA", "CREATE_VISITING_STAFF", req);
    res.status(201).json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE VISITING STAFF ================= */
export const updateVisitingStaff = async (req, res) => {
  try {
    const staff = await visiting_staff.findByPk(req.params.staff_id);
    if (!staff) return res.status(404).json({ error: "Visiting staff not found" });

    await staff.update(req.body);
    await logAuthEvent(req.user.email, "EXA", "UPDATE_VISITING_STAFF", req);

    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE VISITING STAFF ================= */
export const deleteVisitingStaff = async (req, res) => {
  try {
    const staff = await visiting_staff.findByPk(req.params.staff_id);
    if (!staff) return res.status(404).json({ error: "Visiting staff not found" });

    await staff.destroy();
    await logAuthEvent(req.user.email, "EXA", "DELETE_VISITING_STAFF", req);

    res.json({ message: "Visiting staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};