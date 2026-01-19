import api from './api';

const calendarService = {
    getStudentCalendar: async () => {
        const response = await api.get('/calendar/student');
        return response.data;
    },

    getStaffCalendar: async () => {
        const response = await api.get('/calendar/staff');
        return response.data;
    },

    getAdminCalendar: async () => {
        const response = await api.get('/calendar/admin');
        return response.data;
    }
};

export default calendarService;
