import { AttendanceLog, DayScheduleDetail, LeaveRequest, MonthlyStats, ScheduleOverride } from '../types';

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object to HH:mm:ss
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Calculate duration in hours between two times (HH:mm or HH:mm:ss).
 * Core business rule: If duration > 4 hours, automatically deduct 1 hour for lunch break.
 */
export function calculateDurationHours(startTimeStr?: string | null, endTimeStr?: string | null): number {
  if (!startTimeStr || !endTimeStr) return 0;

  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  if (endTotalMinutes <= startTotalMinutes) return 0;

  const diffMinutes = endTotalMinutes - startTotalMinutes;
  const rawHours = diffMinutes / 60;

  // 午休扣除機制：時間區間大於 4 小時，自動扣除 1 小時
  if (rawHours > 4) {
    return Math.max(0, parseFloat((rawHours - 1).toFixed(2)));
  }

  return parseFloat(rawHours.toFixed(2));
}

/**
 * Determine the scheduled work hours and status for a specific date and employee
 */
export function getDaySchedule(
  employeeId: string,
  dateStr: string,
  overrides: ScheduleOverride[],
  leaves: LeaveRequest[],
  logs: AttendanceLog[],
  todayStr: string
): DayScheduleDetail {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday

  // Check Override (Highest Priority)
  const override = overrides.find((o) => o.employee_id === employeeId && o.date === dateStr);
  
  // Check Leave
  const leave = leaves.find((l) => l.employee_id === employeeId && l.date === dateStr);

  // Check Attendance Log
  const attendance = logs.find((l) => l.employee_id === employeeId && l.date === dateStr);

  let isWorkday = false;
  let startTime = '09:00';
  let endTime = '18:00';
  let isOverridden = false;

  if (override) {
    isOverridden = true;
    isWorkday = override.is_workday;
    startTime = override.start_time || '09:00';
    endTime = override.end_time || '18:00';
  } else {
    // Default: Mon(1) - Fri(5) is Workday (09:00 ~ 18:00), Sat(6) / Sun(0) is Rest
    isWorkday = dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  // Calculate required hours
  let requiredHours = 0;
  if (isWorkday && !leave) {
    requiredHours = calculateDurationHours(startTime, endTime);
  }

  // Calculate actual hours worked
  let actualHours = 0;
  if (attendance?.in_time && attendance?.out_time) {
    actualHours = calculateDurationHours(attendance.in_time, attendance.out_time);
  }

  // Determine status
  const isPastOrToday = dateStr <= todayStr;
  const isToday = dateStr === todayStr;

  let status: DayScheduleDetail['status'] = 'rest';

  if (leave) {
    status = 'leave';
  } else if (attendance?.in_time && attendance?.out_time) {
    status = 'attended';
  } else if (attendance?.in_time && !attendance?.out_time) {
    status = 'working';
  } else if (isWorkday) {
    if (isPastOrToday && !isToday) {
      status = 'absent';
    } else if (isToday) {
      status = 'future_work'; // Still waiting for punch today
    } else {
      status = 'future_work';
    }
  } else {
    status = isPastOrToday ? 'rest' : 'future_rest';
  }

  return {
    dateStr,
    dayOfWeek,
    isWorkday,
    startTime,
    endTime,
    requiredHours,
    isOverridden,
    leave,
    attendance,
    actualHours,
    status,
  };
}

/**
 * Calculate monthly statistics for an employee
 * Business logic:
 * 1. Required hours count ONLY dates up to today in the current month (or all days for past months)
 * 2. Leaves are excluded from required attendance days and hours
 * 3. Overrides take precedence
 * 4. Actual hours summed from logs with in_time & out_time
 */
export function calculateMonthlyStats(
  employeeId: string,
  year: number,
  month: number, // 1-indexed (1-12)
  logs: AttendanceLog[],
  leaves: LeaveRequest[],
  overrides: ScheduleOverride[],
  todayStr: string
): MonthlyStats {
  const daysInMonth = new Date(year, month, 0).getDate();
  
  let requiredDays = 0;
  let requiredHours = 0;
  let actualDays = 0;
  let actualHours = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const detail = getDaySchedule(employeeId, dateStr, overrides, leaves, logs, todayStr);

    // Rule: "應出勤時數" only counts up to "今天" (Today)
    const isPastOrToday = dateStr <= todayStr;

    if (isPastOrToday && detail.isWorkday && !detail.leave) {
      requiredDays += 1;
      requiredHours += detail.requiredHours;
    }

    // Actual attendance for the whole month
    if (detail.attendance?.in_time && detail.attendance?.out_time) {
      actualDays += 1;
      actualHours += detail.actualHours;
    }
  }

  requiredHours = parseFloat(requiredHours.toFixed(2));
  actualHours = parseFloat(actualHours.toFixed(2));
  const balanceHours = parseFloat((actualHours - requiredHours).toFixed(2));

  return {
    requiredDays,
    requiredHours,
    actualDays,
    actualHours,
    balanceHours,
  };
}
