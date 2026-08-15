export interface Employee {
  id: string;
  name: string;
  department?: string;
  title?: string;
}

export type LeaveType = '事假' | '病假' | '特休' | '公假';

export interface AttendanceLog {
  id: number;
  employee_id: string;
  date: string; // YYYY-MM-DD
  in_time: string | null; // HH:mm:ss or HH:mm
  out_time: string | null; // HH:mm:ss or HH:mm
}

export interface LeaveRequest {
  id: number;
  employee_id: string;
  date: string; // YYYY-MM-DD
  type: LeaveType;
  reason?: string;
}

export interface ScheduleOverride {
  id: number;
  employee_id: string;
  date: string; // YYYY-MM-DD
  is_workday: boolean; // 1: 需出勤, 0: 排休
  start_time: string; // HH:mm (e.g. "09:00")
  end_time: string; // HH:mm (e.g. "18:00")
  note?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: number;
}

export interface MonthlyStats {
  requiredDays: number;
  requiredHours: number;
  actualDays: number;
  actualHours: number;
  balanceHours: number; // actualHours - requiredHours (positive: overtime, negative: deficit)
}

export interface DayScheduleDetail {
  dateStr: string;
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  isWorkday: boolean;
  startTime: string;
  endTime: string;
  requiredHours: number;
  isOverridden: boolean;
  leave?: LeaveRequest;
  attendance?: AttendanceLog;
  actualHours: number;
  status: 'attended' | 'working' | 'leave' | 'absent' | 'rest' | 'future_work' | 'future_rest';
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string; // Links to Employee.id
  dueDate?: string; // YYYY-MM-DD
  tags?: string[];
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
}
