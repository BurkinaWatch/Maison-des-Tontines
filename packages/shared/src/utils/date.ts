import { format, formatDistanceToNow, isAfter, isBefore, addDays, addMonths, startOfDay, endOfDay } from 'date-fns';

export const formatDate = (date: Date | string, pattern: string = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern);
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM/yyyy HH:mm');
};

export const formatRelativeDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const isDateInPast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return isBefore(d, new Date());
};

export const isDateInFuture = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return isAfter(d, new Date());
};

export const addDaysToDate = (date: Date, days: number): Date => addDays(date, days);
export const addMonthsToDate = (date: Date, months: number): Date => addMonths(date, months);

export const getStartOfDay = (date: Date): Date => startOfDay(date);
export const getEndOfDay = (date: Date): Date => endOfDay(date);

export const getDaysBetween = (start: Date | string, end: Date | string): number => {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  const diff = e.getTime() - s.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dueDate: Date | string): boolean => {
  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return isBefore(d, startOfDay(new Date()));
};
