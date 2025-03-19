import { 
  format as dateFnsFormat,
  startOfWeek as dateFnsStartOfWeek,
  endOfWeek as dateFnsEndOfWeek,
  addDays as dateFnsAddDays,
  addMonths as dateFnsAddMonths,
  startOfMonth as dateFnsStartOfMonth,
  endOfMonth as dateFnsEndOfMonth,
  eachDayOfInterval as dateFnsEachDayOfInterval,
  isSameMonth as dateFnsIsSameMonth,
  isToday as dateFnsIsToday,
  parseISO
} from "date-fns";

// Re-export date-fns functions for consistent usage across the app
export const format = dateFnsFormat;
export const startOfWeek = (date: Date) => dateFnsStartOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
export const endOfWeek = (date: Date) => dateFnsEndOfWeek(date, { weekStartsOn: 1 });
export const addDays = dateFnsAddDays;
export const addMonths = dateFnsAddMonths;
export const startOfMonth = dateFnsStartOfMonth;
export const endOfMonth = dateFnsEndOfMonth;
export const eachDayOfInterval = dateFnsEachDayOfInterval;
export const isSameMonth = dateFnsIsSameMonth;
export const isToday = dateFnsIsToday;
export const parse = parseISO;

// Helper function to get weeks for a month (for the calendar)
export function getWeeksForMonth(month: Date) {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start, end });
  
  const weeks = [];
  let week = [];
  
  days.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  
  return weeks;
}

// Get weekday as a string
export function getWeekday(date: Date): string {
  return format(date, "EEEE").toLowerCase();
}

// Check if a date string is today
export function isDateToday(dateString: string): boolean {
  const date = new Date(dateString);
  return isToday(date);
}

// Get a date range for the current week
export function getCurrentWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return { start, end };
}

// Format a date range as a string
export function formatDateRange(start: Date, end: Date): string {
  return `${format(start, "MMMM d")} - ${format(end, "d, yyyy")}`;
}
