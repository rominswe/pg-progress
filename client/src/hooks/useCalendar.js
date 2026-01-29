import { useQuery } from '@tanstack/react-query';
import calendarService from '../services/calendarService';

export const useCalendar = (role) => {
    return useQuery({
        queryKey: ['calendar', role],
        queryFn: async () => {
            if (role === 'student') return calendarService.getStudentCalendar();
            if (role === 'staff') return calendarService.getStaffCalendar();
            if (role === 'admin') return calendarService.getAdminCalendar();
            return { data: [] };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1
    });
};
