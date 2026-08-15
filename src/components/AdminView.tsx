import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  getDaySchedule,
  calculateMonthlyStats,
  formatDate,
} from '../utils/timeCalculations';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  Settings,
  AlertCircle,
  CheckCircle2,
  CalendarPlus,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { ScheduleOverrideModal } from './ScheduleOverrideModal';
import { EmployeeManageModal } from './EmployeeManageModal';
import { LeaveModal } from './LeaveModal';

export const AdminView: React.FC = () => {
  const {
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedEmployee,
    attendanceLogs,
    leaveRequests,
    scheduleOverrides,
    todayStr,
    currentTime,
    showToast,
  } = useAttendance();

  // Calendar View State: Year and Month
  const [viewYear, setViewYear] = useState<number>(currentTime.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(currentTime.getMonth() + 1); // 1-12

  // Modals state
  const [selectedDateForOverride, setSelectedDateForOverride] = useState<string | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    setViewYear(currentTime.getFullYear());
    setViewMonth(currentTime.getMonth() + 1);
  };

  // Calendar Days Grid Generation (7 columns: Sun-Sat)
  const calendarCells = useMemo(() => {
    if (!selectedEmployeeId) return [];

    const firstDayIndex = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth - 1, 0).getDate();

    const cells: {
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      detail?: ReturnType<typeof getDaySchedule>;
    }[] = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = viewMonth === 1 ? 12 : viewMonth - 1;
      const prevY = viewMonth === 1 ? viewYear - 1 : viewYear;
      const dStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dateStr: dStr,
        dayNum,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const detail = getDaySchedule(
        selectedEmployeeId,
        dStr,
        scheduleOverrides,
        leaveRequests,
        attendanceLogs,
        todayStr
      );
      cells.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: true,
        detail,
      });
    }

    // Trailing days to fill last week
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 12 ? 1 : viewMonth + 1;
      const nextY = viewMonth === 12 ? viewYear + 1 : viewYear;
      const dStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr: dStr,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [viewYear, viewMonth, selectedEmployeeId, scheduleOverrides, leaveRequests, attendanceLogs, todayStr]);

  // Selected Employee Monthly Stats for this viewed month
  const monthlyStats = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return calculateMonthlyStats(
      selectedEmployeeId,
      viewYear,
      viewMonth,
      attendanceLogs,
      leaveRequests,
      scheduleOverrides,
      todayStr
    );
  }, [selectedEmployeeId, viewYear, viewMonth, attendanceLogs, leaveRequests, scheduleOverrides, todayStr]);

  // Count overrides and leaves for the current month
  const monthLeavesCount = leaveRequests.filter((l) => {
    if (l.employee_id !== selectedEmployeeId) return false;
    const [y, m] = l.date.split('-').map(Number);
    return y === viewYear && m === viewMonth;
  }).length;

  const monthOverridesCount = scheduleOverrides.filter((o) => {
    if (o.employee_id !== selectedEmployeeId) return false;
    const [y, m] = o.date.split('-').map(Number);
    return y === viewYear && m === viewMonth;
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Control Bar & Overview */}
      <div className="bg-white rounded-[28px] p-6 border border-[#EBE9E0] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#DDE5B6] text-[#6B705C] flex items-center justify-center border-2 border-white shadow-sm">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#3D3C35]">管理後台 • 出勤月曆與動態排班</h2>
              <span className="text-xs bg-[#F0EEE6] text-[#6B705C] px-2.5 py-0.5 rounded-full font-semibold border border-[#EBE9E0]">
                管理員視圖
              </span>
            </div>
            <p className="text-xs text-[#A5A295] mt-1">
              點擊月曆上的任一日期即可開啟排班覆蓋 (Override) 設定，調整工作日/排休與規定工時。
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsEmployeeModalOpen(true)}
            className="px-5 py-2.5 rounded-xl border border-[#EBE9E0] bg-[#F0EEE6] text-[#6B705C] text-xs sm:text-sm font-semibold hover:bg-[#e4e1d7] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Users className="w-4 h-4" />
            人員名冊管理 ({employees.length})
          </button>
          <button
            type="button"
            onClick={() => setIsLeaveModalOpen(true)}
            className="px-5 py-2.5 rounded-xl border border-[#F2CCB6] bg-[#FFE8D6] text-[#A47148] text-xs sm:text-sm font-semibold hover:bg-[#fedbc0] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <CalendarPlus className="w-4 h-4" />
            代申請請假
          </button>
        </div>
      </div>

      {/* Target Employee Bar & Month Summary Ribbon */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Employee Switcher */}
        <div className="lg:col-span-4 bg-white p-5 rounded-[24px] border border-[#EBE9E0] shadow-sm">
          <label className="block text-xs font-bold text-[#A5A295] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#6B705C]" />
            檢視對象員工
          </label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => {
              setSelectedEmployeeId(e.target.value);
              const emp = employees.find((x) => x.id === e.target.value);
              if (emp) showToast('info', `已切換月曆為：${emp.name}`);
            }}
            className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#EBE9E0] rounded-xl text-[#3D3C35] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#6B705C] cursor-pointer"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.id}) - {emp.department}
              </option>
            ))}
          </select>
        </div>

        {/* Month Summary Metrics */}
        <div className="lg:col-span-8 bg-white p-5 rounded-[24px] border border-[#EBE9E0] shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#FAFAF8] p-3.5 rounded-2xl border border-[#F0EEE6]">
            <span className="text-[11px] text-[#A5A295] block">本月應出勤</span>
            <div className="text-xl font-light text-[#3D3C35] font-mono">
              {monthlyStats?.requiredHours || 0} <span className="text-xs font-normal text-[#A5A295]">hrs</span>
            </div>
            <span className="text-[11px] text-[#8A877B]">({monthlyStats?.requiredDays || 0} 天)</span>
          </div>

          <div className="bg-[#F0EEE6]/70 p-3.5 rounded-2xl border border-[#EBE9E0]">
            <span className="text-[11px] text-[#6B705C] block">本月已打卡</span>
            <div className="text-xl font-light text-[#6B705C] font-mono">
              {monthlyStats?.actualHours || 0} <span className="text-xs font-normal text-[#6B705C]/70">hrs</span>
            </div>
            <span className="text-[11px] text-[#6B705C]/80">({monthlyStats?.actualDays || 0} 天)</span>
          </div>

          <div className="bg-[#FFE8D6]/70 p-3.5 rounded-2xl border border-[#F2CCB6]">
            <span className="text-[11px] text-[#A47148] block">請假次數</span>
            <div className="text-xl font-light text-[#A47148] font-mono">
              {monthLeavesCount} <span className="text-xs font-normal text-[#A47148]/70">天</span>
            </div>
            <span className="text-[11px] text-[#A47148]/80">已排除應出勤</span>
          </div>

          <div className="bg-[#DDE5B6]/50 p-3.5 rounded-2xl border border-[#CBD59E]">
            <span className="text-[11px] text-[#6B705C] block">排班覆蓋</span>
            <div className="text-xl font-light text-[#6B705C] font-mono">
              {monthOverridesCount} <span className="text-xs font-normal text-[#6B705C]/70">次</span>
            </div>
            <span className="text-[11px] text-[#6B705C]/80">自訂設定</span>
          </div>
        </div>
      </div>

      {/* Calendar Card (Spec Section 3.3) */}
      <div className="bg-white rounded-[32px] border border-[#EBE9E0] shadow-sm overflow-hidden flex flex-col">
        {/* Calendar Header & Month Switcher */}
        <div className="p-6 border-b border-[#F0EEE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border border-[#EBE9E0] rounded-full p-1 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-[#F0EEE6] rounded-full text-[#6B705C] transition-colors"
                title="上一個月"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-1 text-sm font-bold text-[#3D3C35] font-mono min-w-[120px] text-center">
                {viewYear} 年 {viewMonth} 月
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-[#F0EEE6] rounded-full text-[#6B705C] transition-colors"
                title="下一個月"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetToCurrentMonth}
              className="px-4 py-1.5 text-xs font-semibold text-[#6B705C] hover:text-[#3D3C35] bg-white border border-[#EBE9E0] rounded-full hover:bg-[#F0EEE6] transition-colors shadow-2xs"
            >
              本月
            </button>
          </div>

          {/* Color Legend (Spec Section 3.3 Visual States) */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A877B]">
            <span className="font-semibold text-[#A5A295]">狀態圖例：</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-white border border-[#EBE9E0]"></span>
              <span>一般工作日</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F0EEE6] border border-[#EBE9E0]"></span>
              <span>休息日</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FFE8D6] border border-[#F2CCB6]"></span>
              <span>請假日</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#DDE5B6] border border-[#CBD59E]"></span>
              <span>已出勤</span>
            </div>
          </div>
        </div>

        {/* 7-Column Calendar Grid */}
        <div className="p-4 sm:p-6">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-[#A5A295]">
            <div className="py-2 text-[#A47148] bg-[#FFE8D6]/40 rounded-xl">週日 (Sun)</div>
            <div className="py-2 bg-[#FAFAF8] rounded-xl">週一 (Mon)</div>
            <div className="py-2 bg-[#FAFAF8] rounded-xl">週二 (Tue)</div>
            <div className="py-2 bg-[#FAFAF8] rounded-xl">週三 (Wed)</div>
            <div className="py-2 bg-[#FAFAF8] rounded-xl">週四 (Thu)</div>
            <div className="py-2 bg-[#FAFAF8] rounded-xl">週五 (Fri)</div>
            <div className="py-2 text-[#A47148] bg-[#FFE8D6]/40 rounded-xl">週六 (Sat)</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, idx) => {
              if (!cell.isCurrentMonth || !cell.detail) {
                return (
                  <div
                    key={idx}
                    className="min-h-[110px] p-2.5 rounded-2xl bg-[#FAFAF8]/50 border border-[#F0EEE6] text-[#D0CDC4] text-xs font-mono select-none"
                  >
                    <span>{cell.dayNum}</span>
                  </div>
                );
              }

              const detail = cell.detail;
              const isToday = cell.dateStr === todayStr;

              // Spec Section 3.3 Visual State Colors
              let cellBg = 'bg-white border-[#EBE9E0] hover:border-[#6B705C]';
              let badgeType = null;

              if (detail.leave) {
                cellBg = 'bg-[#FFE8D6]/70 border-[#F2CCB6] hover:border-[#A47148]';
                badgeType = {
                  text: `請假: ${detail.leave.type}`,
                  color: 'bg-[#FFE8D6] text-[#A47148] border-[#F2CCB6]',
                };
              } else if (detail.attendance?.in_time && detail.attendance?.out_time) {
                cellBg = 'bg-[#DDE5B6]/50 border-[#CBD59E] hover:border-[#6B705C]';
                badgeType = {
                  text: `已出勤 (${detail.actualHours}h)`,
                  color: 'bg-[#DDE5B6] text-[#6B705C] border-[#CBD59E]',
                };
              } else if (detail.attendance?.in_time && !detail.attendance?.out_time) {
                cellBg = 'bg-[#F0EEE6] border-[#EBE9E0] hover:border-[#6B705C]';
                badgeType = {
                  text: '上班中',
                  color: 'bg-white text-[#6B705C] border-[#EBE9E0]',
                };
              } else if (!detail.isWorkday) {
                cellBg = 'bg-[#FAFAF8] border-[#F0EEE6] text-[#A5A295] hover:border-[#EBE9E0]';
                badgeType = {
                  text: '休息日',
                  color: 'bg-[#F0EEE6] text-[#8A877B] border-[#EBE9E0]',
                };
              } else {
                // General Workday
                cellBg = 'bg-white border-[#EBE9E0] hover:border-[#6B705C]';
              }

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDateForOverride(cell.dateStr)}
                  className={`min-h-[110px] p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-md ${cellBg} ${
                    isToday ? 'ring-2 ring-[#6B705C] ring-offset-2' : ''
                  }`}
                  title="點擊設定此日排班"
                >
                  {/* Top Bar: Date Number + Tags */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <span
                        className={`font-mono text-sm font-bold ${
                          isToday
                            ? 'bg-[#6B705C] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs'
                            : detail.dayOfWeek === 0 || detail.dayOfWeek === 6
                            ? 'text-[#A47148]'
                            : 'text-[#3D3C35]'
                        }`}
                      >
                        {cell.dayNum}
                      </span>
                    </div>

                    {/* Override marker */}
                    {detail.isOverridden && (
                      <span className="text-[10px] bg-[#6B705C] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-2xs">
                        自訂
                      </span>
                    )}
                  </div>

                  {/* Middle: Scheduled or Actual Times */}
                  <div className="my-1.5 space-y-1">
                    {/* Status Badge */}
                    {badgeType && (
                      <div
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border leading-none inline-block ${badgeType.color}`}
                      >
                        {badgeType.text}
                      </div>
                    )}

                    {/* Actual Punch info */}
                    {detail.attendance?.in_time && (
                      <div className="text-[11px] font-mono text-[#3D3C35] leading-tight">
                        <div className="truncate">進: {detail.attendance.in_time}</div>
                        {detail.attendance.out_time && (
                          <div className="truncate">退: {detail.attendance.out_time}</div>
                        )}
                      </div>
                    )}

                    {/* Scheduled Work Hours if workday and not attended */}
                    {detail.isWorkday && !detail.attendance?.in_time && !detail.leave && (
                      <div className="text-[10px] font-mono text-[#8A877B] leading-tight">
                        班表: {detail.startTime}~{detail.endTime}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Click prompt on hover */}
                  <div className="text-[10px] text-[#6B705C] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 justify-end">
                    <Settings className="w-3 h-3" />
                    排班
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Schedule Override Modal */}
      {selectedDateForOverride && (
        <ScheduleOverrideModal
          isOpen={!!selectedDateForOverride}
          onClose={() => setSelectedDateForOverride(null)}
          employeeId={selectedEmployeeId}
          dateStr={selectedDateForOverride}
        />
      )}

      {/* Employee Management Modal */}
      <EmployeeManageModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
      />

      {/* Leave Modal */}
      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        initialMode="advance"
      />
    </div>
  );
};
