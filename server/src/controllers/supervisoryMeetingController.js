import supervisoryMeeting from "../models/supervisoryMeeting.js";

// Get all meetings
export const getAllMeetings = async (req, res) => {
  try {
    const meetings = await supervisoryMeeting.findAll();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single meeting by meeting_id
export const getMeetingById = async (req, res) => {
  try {
    const meeting = await supervisoryMeeting.findByPk(req.params.meeting_id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new meeting
export const createMeeting = async (req, res) => {
  try {
    const newMeeting = await supervisoryMeeting.create(req.body);
    res.status(201).json(newMeeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a meeting
export const updateMeeting = async (req, res) => {
  try {
    const meeting = await supervisoryMeeting.findByPk(req.params.meeting_id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    await meeting.update(req.body);
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a meeting
export const deleteMeeting = async (req, res) => {
  try {
    const meeting = await supervisoryMeeting.findByPk(req.params.meeting_id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    await meeting.destroy();
    res.json({ message: "Meeting deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};