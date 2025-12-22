import { loginAttempt } from "../config/config.js";

/* ================= GET ALL LOGIN ATTEMPTS ================= */
export const getAllLoginAttempts = async (req, res) => {
  try {
    const attempts = await loginAttempt.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET LOGIN ATTEMPT BY EMAIL ================= */
export const getLoginAttemptByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const attempt = await loginAttempt.findOne({ where: { email } });
    if (!attempt) return res.status(404).json({ error: "Login attempt not found" });
    res.status(200).json(attempt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= CREATE LOGIN ATTEMPT ================= */
export const createLoginAttempt = async (req, res) => {
  const { email } = req.body;
  try {
    const attempt = await loginAttempt.create({ email });
    res.status(201).json({ message: "Login attempt recorded", attempt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE LOGIN ATTEMPT ================= */
export const deleteLoginAttempt = async (req, res) => {
  const { email } = req.params;
  try {
    const deleted = await loginAttempt.destroy({ where: { email } });
    if (!deleted) return res.status(404).json({ error: "Login attempt not found" });
    res.status(200).json({ message: "Login attempt deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE ALL LOGIN ATTEMPTS ================= */
export const deleteAllLoginAttempts = async (req, res) => {
  try {
    await loginAttempt.destroy({ where: {} });
    res.status(200).json({ message: "All login attempts deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};