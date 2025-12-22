import express from "express";
import {
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "../controllers/supervisoryMeetingController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllMeetings);
router.get("/:meeting_id", getMeetingById);
router.post("/", createMeeting);
router.put("/:meeting_id", updateMeeting);
router.delete("/:meeting_id", deleteMeeting);

export default router;