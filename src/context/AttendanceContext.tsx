import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AttendanceLog, Employee, LeaveRequest, LeaveType, ScheduleOverride, ToastMessage } from '../types';
import { getInitialData } from '../data/initialData';
import { formatDate, formatTime } from '../utils/timeCalculations';

interface AttendanceContextType {
  currentView: 'employee' | 'admin';
  setCurrentView: (view: 'employee' | 'admin') => void;
  selectedEmployeeId: string;
  setSelectedEmployeeId: (id: string) => void;
  selectedEmployee: Employee | undefined;
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
  leaveRequests: LeaveRequest[];
  scheduleOverrides: ScheduleOverride[];
  toasts: ToastMessage[];
  currentTime: Date;
  todayStr: string;
  clockIn: (employeeId?: string) => boolean;
  clockOut: (employeeId?: string) => boolean;
  applyLeave: (leaveData: { employee_id: string; date: string; type: LeaveType; reason?: string }) => boolean;
  cancelLeave: (leaveId: number) => void;
  saveScheduleOverride: (override: { employee_id: string; date: string; is_workday: boolean; start_time: string; end_time: string; note?: string }) => void;
  removeScheduleOverride: (employee_id: string, date: string) => void;
  addEmployee: (name: string, department?: string, title?: string) => void;
  deleteEmployee: (employeeId: string) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  resetToInitial: () => void;
  syncWithServer: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = getInitialData();

  const [currentView, setCurrentView] = useState<'employee' | 'admin'>('employee');
  const [employees, setEmployees] = useState<Employee[]>(initial.employees);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('EMP-001');
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(initial.attendanceLogs);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initial.leaveRequests);
  const [scheduleOverrides, setScheduleOverrides] = useState<ScheduleOverride[]>(initial.scheduleOverrides);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Real-time clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = formatDate(currentTime);
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message, timestamp: Date.now() }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync data with backend API
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) {
        if (data.employees) setEmployees(data.employees);
        if (data.attendanceLogs) setAttendanceLogs(data.attendanceLogs);
        if (data.leaveRequests) setLeaveRequests(data.leaveRequests);
        if (data.scheduleOverrides) setScheduleOverrides(data.scheduleOverrides);
      }
    } catch {
      // Offline fallback: keep local state
    }
  }, []);

  // Initial load from server and periodic polling for real-time multi-device sync
  useEffect(() => {
    syncWithServer();
    const interval = setInterval(() => {
      syncWithServer();
    }, 5000);
    return () => clearInterval(interval);
  }, [syncWithServer]);

  // Clock In
  const clockIn = (empId?: string): boolean => {
    const targetId = empId || selectedEmployeeId;
    if (!targetId) {
      showToast('error', '請先選擇要打卡的員工！');
      return false;
    }

    const employee = employees.find((e) => e.id === targetId);
    const empName = employee ? employee.name : targetId;

    // Check if on leave today
    const isLeaveToday = leaveRequests.some((l) => l.employee_id === targetId && l.date === todayStr);
    if (isLeaveToday) {
      showToast('error', `${empName} 今日已有請假紀錄，無法進行上班打卡。`);
      return false;
    }

    // Check if already clocked in today
    const existingLog = attendanceLogs.find((l) => l.employee_id === targetId && l.date === todayStr);
    if (existingLog && existingLog.in_time) {
      showToast('error', `${empName} 今日已於 ${existingLog.in_time} 完成上班打卡！`);
      return false;
    }

    const nowTimeStr = formatTime(new Date());

    // Optimistic UI update
    if (existingLog) {
      setAttendanceLogs((prev) =>
        prev.map((l) => (l.id === existingLog.id ? { ...l, in_time: nowTimeStr } : l))
      );
    } else {
      const newLog: AttendanceLog = {
        id: Date.now(),
        employee_id: targetId,
        date: todayStr,
        in_time: nowTimeStr,
        out_time: null,
      };
      setAttendanceLogs((prev) => [newLog, ...prev]);
    }

    showToast('success', `【上班打卡成功】${empName} 已於 ${nowTimeStr} 簽到！`);

    // Backend Sync
    fetch('/api/clock-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: targetId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success && data.message) {
          showToast('error', data.message);
        }
        syncWithServer();
      })
      .catch(() => {
        // Handled silently
      });

    return true;
  };

  // Clock Out
  const clockOut = (empId?: string): boolean => {
    const targetId = empId || selectedEmployeeId;
    if (!targetId) {
      showToast('error', '請先選擇員工！');
      return false;
    }

    const employee = employees.find((e) => e.id === targetId);
    const empName = employee ? employee.name : targetId;

    const existingLog = attendanceLogs.find((l) => l.employee_id === targetId && l.date === todayStr);

    if (!existingLog || !existingLog.in_time) {
      showToast('error', `尚未進行今日上班打卡，無法執行下班打卡。`);
      return false;
    }

    if (existingLog.out_time) {
      showToast('error', `${empName} 今日已於 ${existingLog.out_time} 完成下班打卡！`);
      return false;
    }

    const nowTimeStr = formatTime(new Date());

    // Optimistic UI update
    setAttendanceLogs((prev) =>
      prev.map((l) => (l.id === existingLog.id ? { ...l, out_time: nowTimeStr } : l))
    );

    showToast('success', `【下班打卡成功】${empName} 已於 ${nowTimeStr} 簽退，當月工時已即時更新！`);

    // Backend Sync
    fetch('/api/clock-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: targetId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success && data.message) {
          showToast('error', data.message);
        }
        syncWithServer();
      })
      .catch(() => {
        // Handled silently
      });

    return true;
  };

  // Apply Leave
  const applyLeave = (leaveData: { employee_id: string; date: string; type: LeaveType; reason?: string }): boolean => {
    const employee = employees.find((e) => e.id === leaveData.employee_id);
    const empName = employee ? employee.name : leaveData.employee_id;

    const exists = leaveRequests.some(
      (l) => l.employee_id === leaveData.employee_id && l.date === leaveData.date
    );

    if (exists) {
      showToast('error', `${empName} 於 ${leaveData.date} 已有請假紀錄，請勿重複申請。`);
      return false;
    }

    const newLeave: LeaveRequest = {
      id: Date.now(),
      employee_id: leaveData.employee_id,
      date: leaveData.date,
      type: leaveData.type,
      reason: leaveData.reason || '',
    };

    setLeaveRequests((prev) => [newLeave, ...prev]);
    showToast('success', `已成功為 ${empName} 申請 ${leaveData.date} 之【${leaveData.type}】！`);

    fetch('/api/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success && data.message) {
          showToast('error', data.message);
        }
        syncWithServer();
      })
      .catch(() => {});

    return true;
  };

  // Cancel Leave
  const cancelLeave = (leaveId: number) => {
    setLeaveRequests((prev) => prev.filter((l) => l.id !== leaveId));
    showToast('info', '已取消該筆請假申請。');

    fetch(`/api/leave/${leaveId}`, { method: 'DELETE' })
      .then(() => syncWithServer())
      .catch(() => {});
  };

  // Set / Update Schedule Override
  const saveScheduleOverride = (override: {
    employee_id: string;
    date: string;
    is_workday: boolean;
    start_time: string;
    end_time: string;
    note?: string;
  }) => {
    const employee = employees.find((e) => e.id === override.employee_id);
    const empName = employee ? employee.name : override.employee_id;

    setScheduleOverrides((prev) => {
      const filtered = prev.filter(
        (o) => !(o.employee_id === override.employee_id && o.date === override.date)
      );
      const newOverride: ScheduleOverride = {
        id: Date.now(),
        ...override,
      };
      return [...filtered, newOverride];
    });

    const statusDesc = override.is_workday
      ? `設為【需出勤 (${override.start_time}~${override.end_time})】`
      : '設為【排休 (不需出勤)】';
    showToast('success', `已更新 ${empName} 於 ${override.date} 之排班：${statusDesc}`);

    fetch('/api/schedule-override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(override),
    })
      .then(() => syncWithServer())
      .catch(() => {});
  };

  // Remove Schedule Override
  const removeScheduleOverride = (employee_id: string, date: string) => {
    setScheduleOverrides((prev) =>
      prev.filter((o) => !(o.employee_id === employee_id && o.date === date))
    );
    showToast('info', `已恢復 ${date} 之預設排班規則。`);

    fetch(`/api/schedule-override?employee_id=${encodeURIComponent(employee_id)}&date=${encodeURIComponent(date)}`, {
      method: 'DELETE',
    })
      .then(() => syncWithServer())
      .catch(() => {});
  };

  // Add Employee
  const addEmployee = (name: string, department?: string, title?: string) => {
    if (!name.trim()) {
      showToast('error', '請輸入員工姓名！');
      return;
    }

    const nextNumber = employees.length + 1;
    const newId = `EMP-${String(nextNumber).padStart(3, '0')}`;

    const newEmp: Employee = {
      id: newId,
      name: name.trim(),
      department: department?.trim() || '通用部門',
      title: title?.trim() || '正職員工',
    };

    setEmployees((prev) => [...prev, newEmp]);
    setSelectedEmployeeId(newId);
    showToast('success', `成功新增員工：${newEmp.name} (工號: ${newId})`);

    fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, department, title }),
    })
      .then(() => syncWithServer())
      .catch(() => {});
  };

  // Delete Employee
  const deleteEmployee = (employeeId: string) => {
    const target = employees.find((e) => e.id === employeeId);
    if (!target) return;

    if (employees.length <= 1) {
      showToast('error', '系統中至少需保留一名員工！');
      return;
    }

    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    setAttendanceLogs((prev) => prev.filter((l) => l.employee_id !== employeeId));
    setLeaveRequests((prev) => prev.filter((l) => l.employee_id !== employeeId));
    setScheduleOverrides((prev) => prev.filter((o) => o.employee_id !== employeeId));

    if (selectedEmployeeId === employeeId) {
      const remaining = employees.filter((e) => e.id !== employeeId);
      setSelectedEmployeeId(remaining[0]?.id || '');
    }

    showToast('info', `已刪除員工：${target.name} (${target.id})`);

    fetch(`/api/employees/${employeeId}`, {
      method: 'DELETE',
    })
      .then(() => syncWithServer())
      .catch(() => {});
  };

  // Reset to initial prototype state
  const resetToInitial = () => {
    const fresh = getInitialData();
    setEmployees(fresh.employees);
    setSelectedEmployeeId('EMP-001');
    setAttendanceLogs(fresh.attendanceLogs);
    setLeaveRequests(fresh.leaveRequests);
    setScheduleOverrides(fresh.scheduleOverrides);
    showToast('info', '已重置系統至初始資料狀態。');

    fetch('/api/reset', { method: 'POST' })
      .then(() => syncWithServer())
      .catch(() => {});
  };

  return (
    <AttendanceContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedEmployeeId,
        setSelectedEmployeeId,
        selectedEmployee,
        employees,
        attendanceLogs,
        leaveRequests,
        scheduleOverrides,
        toasts,
        currentTime,
        todayStr,
        clockIn,
        clockOut,
        applyLeave,
        cancelLeave,
        saveScheduleOverride,
        removeScheduleOverride,
        addEmployee,
        deleteEmployee,
        showToast,
        removeToast,
        resetToInitial,
        syncWithServer,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
