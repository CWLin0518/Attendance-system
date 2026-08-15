import { Employee, AttendanceLog, LeaveRequest, ScheduleOverride } from '../types';
import { formatDate } from '../utils/timeCalculations';

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: '王大明', department: '工程研發部', title: '資深工程師' },
  { id: 'EMP-002', name: '李小華', department: '產品設計部', title: 'UI/UX 設計師' },
  { id: 'EMP-003', name: '陳志遠', department: '行銷推廣部', title: '行銷企劃' },
  { id: 'EMP-004', name: '林雅婷', department: '人事行政部', title: '行政專員' },
  { id: 'EMP-005', name: '張家豪', department: '營運維護部', title: '系統管理員' },
];

export function getInitialData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const todayDate = now.getDate();

  const monthStr = String(month).padStart(2, '0');

  const attendanceLogs: AttendanceLog[] = [];
  const leaveRequests: LeaveRequest[] = [];
  const scheduleOverrides: ScheduleOverride[] = [];

  let logId = 1;
  let leaveId = 1;
  let overrideId = 1;

  // Generate realistic logs for EMP-001 (王大明) up to today
  for (let d = 1; d < todayDate; d++) {
    const dStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dStr}`;
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (d === 6) {
        // Leave on day 6
        leaveRequests.push({
          id: leaveId++,
          employee_id: 'EMP-001',
          date: dateStr,
          type: '特休',
          reason: '個人事務休假',
        });
      } else if (d === 10) {
        // Overtime log
        attendanceLogs.push({
          id: logId++,
          employee_id: 'EMP-001',
          date: dateStr,
          in_time: '08:52:14',
          out_time: '19:35:40',
        });
      } else {
        // Normal log
        attendanceLogs.push({
          id: logId++,
          employee_id: 'EMP-001',
          date: dateStr,
          in_time: '08:55:20',
          out_time: '18:05:10',
        });
      }
    }
  }

  // Today for EMP-001: Clocked in this morning
  const todayStr = formatDate(now);
  attendanceLogs.push({
    id: logId++,
    employee_id: 'EMP-001',
    date: todayStr,
    in_time: '08:58:32',
    out_time: null, // currently working
  });

  // Logs for EMP-002 (李小華)
  for (let d = 1; d < todayDate; d++) {
    const dStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dStr}`;
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      attendanceLogs.push({
        id: logId++,
        employee_id: 'EMP-002',
        date: dateStr,
        in_time: '09:02:11',
        out_time: '18:00:25',
      });
    }
  }

  // EMP-002 has a future leave request
  const futureLeaveDate = new Date(now);
  futureLeaveDate.setDate(todayDate + 4);
  leaveRequests.push({
    id: leaveId++,
    employee_id: 'EMP-002',
    date: formatDate(futureLeaveDate),
    type: '事假',
    reason: '家庭聚會',
  });

  // EMP-003 has an override (e.g. customized weekend duty or altered hours)
  const overrideDate = new Date(now);
  overrideDate.setDate(todayDate + 2);
  scheduleOverrides.push({
    id: overrideId++,
    employee_id: 'EMP-003',
    date: formatDate(overrideDate),
    is_workday: true,
    start_time: '10:00',
    end_time: '19:00',
    note: '專案週末輪值調班',
  });

  return {
    employees: INITIAL_EMPLOYEES,
    attendanceLogs,
    leaveRequests,
    scheduleOverrides,
  };
}
