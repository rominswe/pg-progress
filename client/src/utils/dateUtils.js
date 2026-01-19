import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/**
 * Converts a UTC date string from the backend to a localized, readable format.
 * @param {string} dateString - UTC date string (e.g., "2026-01-19T12:00:00Z")
 * @param {string} formatStr - Desired output format (default: "PPpp")
 * @returns {string} - Localized date string
 */
export const formatLocalizedDate = (dateString, formatStr = 'PPPP, p') => {
    if (!dateString) return 'N/A';

    try {
        const date = parseISO(dateString);
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const zonedDate = toZonedTime(date, timeZone);
        return format(zonedDate, formatStr);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
};

/**
 * Converts a date to a format suitable for FullCalendar events.
 */
export const toCalendarDate = (dateString) => {
    if (!dateString) return null;
    try {
        const date = parseISO(dateString);
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return toZonedTime(date, timeZone);
    } catch (error) {
        return dateString;
    }
};
