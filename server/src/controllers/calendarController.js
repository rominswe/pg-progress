import calendarService from '../services/calendarService.js';

class CalendarController {
    /**
     * Get events for the logged-in student
     */
    async getStudentCalendar(req, res) {
        try {
            const events = await calendarService.getStudentEvents(req.session.user.id);
            res.status(200).json({
                success: true,
                data: events
            });
        } catch (error) {
            console.error('Error fetching student calendar:', error);
            res.status(500).json({
                success: false,
                message: 'Calendar temporarily unavailable'
            });
        }
    }

    /**
     * Get events for the logged-in staff member
     */
    async getStaffCalendar(req, res) {
        try {
            const events = await calendarService.getStaffEvents(req.session.user.id);
            res.status(200).json({
                success: true,
                data: events
            });
        } catch (error) {
            console.error('Error fetching staff calendar:', error);
            res.status(500).json({
                success: false,
                message: 'Calendar temporarily unavailable'
            });
        }
    }

    /**
     * Get all events (Master View for CGS Admin)
     */
    async getAdminCalendar(req, res) {
        try {
            const events = await calendarService.getAllEvents();
            res.status(200).json({
                success: true,
                data: events
            });
        } catch (error) {
            console.error('Error fetching admin calendar:', error);
            res.status(500).json({
                success: false,
                message: 'Calendar temporarily unavailable'
            });
        }
    }
}

export default new CalendarController();
