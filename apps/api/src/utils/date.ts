import { format, addDays, addMonths, addYears, differenceInDays, startOfMonth, endOfMonth, isBefore, isAfter } from "date-fns";

export function getNextDate(startDate: Date, frequency: string, occurrence: number): Date {
  const date = new Date(startDate);

  switch (frequency) {
    case "daily":
      return addDays(date, occurrence);
    case "weekly":
      return addDays(date, occurrence * 7);
    case "biweekly":
      return addDays(date, occurrence * 14);
    case "monthly":
      return addMonths(date, occurrence);
    case "bimonthly":
      return addMonths(date, occurrence * 2);
    case "quarterly":
      return addMonths(date, occurrence * 3);
    case "semesterly":
      return addMonths(date, occurrence * 6);
    case "yearly":
      return addYears(date, occurrence);
    default:
      return addMonths(date, occurrence);
  }
}

export function calculateDueDate(
  startDate: Date,
  frequency: string,
  sequence: number
): Date {
  return getNextDate(startDate, frequency, sequence - 1);
}

export function isOverdue(dueDate: Date, now: Date = new Date()): boolean {
  return isBefore(dueDate, now) && differenceInDays(now, dueDate) > 0;
}

export function calculateLateDays(dueDate: Date, now: Date = new Date()): number {
  return Math.max(0, differenceInDays(now, dueDate));
}

export function getCycleWindow(startDate: Date, endDate: Date): { start: Date; end: Date } {
  return {
    start: startOfMonth(startDate),
    end: endOfMonth(endDate || startDate),
  };
}

export function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
}
