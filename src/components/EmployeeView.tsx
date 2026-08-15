import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  calculateMonthlyStats,
  getDaySchedule,
  formatTime,
  calculateDurationHours,
} from '../utils/timeCalculations';
import {
  LogIn,
  LogOut,
  CalendarCheck,
  CalendarPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  User,
  Coffee,
  Calendar,
  Hourglass,
  Sparkles,
} from 'lucide-react';
import { LeaveModal } from './LeaveModal';

export const EmployeeView: React.FC = () => {
  const {
    selectedEmployeeId,
    selectedEmployee,
    attendanceLogs,
    leaveRequests,
    scheduleOverrides,
    todayStr,
    currentTime,
    clockIn,
    clockOut,
  } = useAttendance();

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveModalMode, setLeaveModalMode] = useState<'same-day' | 'advance'>('same-day');

  const currentYear = currentTime.getFullYear();
  const currentMonth = currentTime.getMonth() + 1;

  // Monthly statistics computation adhering strictly to Section 4.2
  const stats = useMemo(() => {
    if (!selectedEmployeeId) {
      return { requiredDays: 0, requiredHours: 0, actualDays: 0, actualHours: 0, balanceHours: 0 };
    }
    return calculateMonthlyStats(
      selectedEmployeeId,
      currentYear,
      currentMonth,
      attendanceLogs,
      leaveRequests,
      scheduleOverrides,
      todayStr
    );
  }, [selectedEmployeeId, currentYear, currentMonth, attendanceLogs, leaveRequests, scheduleOverrides, todayStr]);

  // Today's schedule detail for this employee
  const todayDetail = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return getDaySchedule(
      selectedEmployeeId,
      todayStr,
      scheduleOverrides,
      leaveRequests,
      attendanceLogs,
      todayStr
    );
  }, [selectedEmployeeId, todayStr, scheduleOverrides, leaveRequests, attendanceLogs]);

  // If no employee selected (狀態防呆)
  if (!selectedEmployee) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">請先選擇員工</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          請於上方導覽列選單中選擇要檢視或進行打卡的員工身分。
        </p>
      </div>
    );
  }

  const isLeaveToday = !!todayDetail?.leave;
  const isClockedInToday = !!todayDetail?.attendance?.in_time;
  const isClockedOutToday = !!todayDetail?.attendance?.out_time;

  // Punch Button States
  // 上班打卡：若今日已上班或已請假，按鈕自動反灰禁用
  const canClockIn = !isLeaveToday && !isClockedInToday;

  // 下班打卡：僅在「已上班且未下班」的狀態下啟用
  const canClockOut = !isLeaveToday && isClockedInToday && !isClockedOutToday;

  // Current working status summary
  let statusBadge = {
    text: '今日尚未打卡',
    color: 'bg-[#FAFAF8] text-[#A5A295] border-[#EBE9E0]',
    icon: <Hourglass className="w-4 h-4 text-[#A5A295]" />,
  };

  if (isLeaveToday) {
    statusBadge = {
      text: `今日請假中 (${todayDetail?.leave?.type})`,
      color: 'bg-[#FFE8D6] text-[#A47148] border-[#F2CCB6]',
      icon: <AlertCircle className="w-4 h-4 text-[#A47148]" />,
    };
  } else if (isClockedInToday && isClockedOutToday) {
    statusBadge = {
      text: '今日已完成打卡下班',
      color: 'bg-[#DDE5B6]/60 text-[#6B705C] border-[#CBD59E]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#6B705C]" />,
    };
  } else if (isClockedInToday && !isClockedOutToday) {
    statusBadge = {
      text: '出勤上班中',
      color: 'bg-[#F0EEE6] text-[#6B705C] border-[#EBE9E0]',
      icon: <Clock className="w-4 h-4 text-[#6B705C] animate-spin" />,
    };
  } else if (!todayDetail?.isWorkday) {
    statusBadge = {
      text: '今日為排休/休息日',
      color: 'bg-[#F0EEE6] text-[#8A877B] border-[#EBE9E0]',
      icon: <Coffee className="w-4 h-4 text-[#8A877B]" />,
    };
  }

  // Monthly Logs table data
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const monthDaysList = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = String(d).padStart(2, '0');
    const mStr = String(currentMonth).padStart(2, '0');
    const dateString = `${currentYear}-${mStr}-${dStr}`;
    const detail = getDaySchedule(
      selectedEmployeeId,
      dateString,
      scheduleOverrides,
      leaveRequests,
      attendanceLogs,
      todayStr
    );
    monthDaysList.push(detail);
  }

  // Filter to show only relevant logs (past/today workdays, leaves, or logged days)
  const displayLogs = monthDaysList
    .filter((d) => d.dateStr <= todayStr || d.leave || d.attendance || d.isOverridden)
    .reverse();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Employee Profile Header & Quick Actions */}
      <div className="bg-white rounded-[28px] p-6 border border-[#EBE9E0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#DDE5B6] text-[#6B705C] font-bold text-xl flex items-center justify-center border-2 border-white shadow-sm">
            {selectedEmployee.name.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-[#3D3C35]">{selectedEmployee.name}</h2>
              <span className="font-mono text-xs bg-[#F0EEE6] text-[#6B705C] px-2.5 py-0.5 rounded-full font-semibold border border-[#EBE9E0]">
                ID: {selectedEmployee.id}
              </span>
              <span className="text-xs bg-[#FFE8D6] text-[#A47148] px-2.5 py-0.5 rounded-full font-medium">
                {selectedEmployee.department}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#A5A295] mt-1">
              <span>職稱：{selectedEmployee.title || '正職員工'}</span>
              <span>•</span>
              <span>今天日期：{todayStr}</span>
            </div>
          </div>
        </div>

        {/* Leave application trigger buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="btn-sameday-leave"
            onClick={() => {
              setLeaveModalMode('same-day');
              setIsLeaveModalOpen(true);
            }}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl border border-[#F2CCB6] bg-[#FFE8D6] text-[#A47148] text-xs sm:text-sm font-semibold hover:bg-[#fedbc0] transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Clock className="w-4 h-4" />
            當日請假
          </button>
          <button
            type="button"
            id="btn-advance-leave"
            onClick={() => {
              setLeaveModalMode('advance');
              setIsLeaveModalOpen(true);
            }}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl border border-[#EBE9E0] bg-[#F0EEE6] text-[#6B705C] text-xs sm:text-sm font-semibold hover:bg-[#e4e1d7] transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <CalendarPlus className="w-4 h-4" />
            預先請假
          </button>
        </div>
      </div>

      {/* Primary Row: Punch Card & Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Punch Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[32px] p-8 border border-[#EBE9E0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#A5A295] uppercase tracking-wider">
                今日打卡作業
              </span>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}
              >
                {statusBadge.icon}
                {statusBadge.text}
              </div>
            </div>

            {/* Scheduled work info */}
            <div className="p-4 bg-[#FAFAF8] border border-[#F0EEE6] rounded-2xl mb-6 text-xs text-[#4A4941] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#A5A295]">今日排班規則：</span>
                <span className="font-semibold text-[#3D3C35]">
                  {todayDetail?.isOverridden
                    ? '管理員自訂排班'
                    : todayDetail?.isWorkday
                    ? '常規工作日 (週一至五)'
                    : '週末休息日'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A295]">規定出勤時段：</span>
                <span className="font-mono font-medium text-[#3D3C35]">
                  {todayDetail?.isWorkday
                    ? `${todayDetail.startTime} ~ ${todayDetail.endTime} (${todayDetail.requiredHours} 小時)`
                    : '0 小時 (休息日)'}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#A5A295] pt-1.5 border-t border-[#F0EEE6]">
                <span>午休扣除規則：</span>
                <span>時段 &gt; 4 小時自動扣除 1 小時午休</span>
              </div>
            </div>

            {/* Punch Action Buttons */}
            <div className="grid grid-cols-2 gap-3.5 mb-6">
              {/* Clock In Button */}
              <button
                type="button"
                id="btn-clock-in"
                disabled={!canClockIn}
                onClick={() => clockIn(selectedEmployeeId)}
                className={`py-4 px-4 rounded-2xl font-semibold text-sm flex flex-col items-center justify-center gap-1.5 transition-all ${
                  canClockIn
                    ? 'bg-[#6B705C] hover:bg-[#5a5f4c] text-white shadow-lg shadow-[#6B705C33] active:scale-95 cursor-pointer'
                    : 'bg-white text-[#A5A295] cursor-not-allowed border-2 border-[#EBE9E0]'
                }`}
              >
                <LogIn className="w-6 h-6" />
                <span>上班打卡</span>
                <span className="text-[10px] opacity-70 font-normal uppercase mt-0.5">
                  {isClockedInToday
                    ? `已打卡 ${todayDetail?.attendance?.in_time}`
                    : isLeaveToday
                    ? '今日已請假'
                    : '點擊記錄當前時間'}
                </span>
              </button>

              {/* Clock Out Button */}
              <button
                type="button"
                id="btn-clock-out"
                disabled={!canClockOut}
                onClick={() => clockOut(selectedEmployeeId)}
                className={`py-4 px-4 rounded-2xl font-semibold text-sm flex flex-col items-center justify-center gap-1.5 transition-all ${
                  canClockOut
                    ? 'bg-[#A47148] hover:bg-[#8f5f37] text-white shadow-lg shadow-[#A4714833] active:scale-95 cursor-pointer'
                    : 'bg-white text-[#A5A295] cursor-not-allowed border-2 border-[#EBE9E0]'
                }`}
              >
                <LogOut className="w-6 h-6" />
                <span>下班打卡</span>
                <span className="text-[10px] opacity-70 font-normal uppercase mt-0.5">
                  {isClockedOutToday
                    ? `已簽退 ${todayDetail?.attendance?.out_time}`
                    : !isClockedInToday
                    ? '需先完成上班打卡'
                    : '點擊完成今日簽退'}
                </span>
              </button>
            </div>
          </div>

          {/* Today's Punch Time Display */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F0EEE6]">
            <div className="bg-[#FAFAF8] p-3 rounded-2xl border border-[#F0EEE6]">
              <span className="text-[11px] text-[#A5A295] block mb-0.5">今日上班簽到</span>
              <span className="font-mono text-sm font-bold text-[#3D3C35]">
                {todayDetail?.attendance?.in_time || '—:—:—'}
              </span>
            </div>
            <div className="bg-[#FAFAF8] p-3 rounded-2xl border border-[#F0EEE6]">
              <span className="text-[11px] text-[#A5A295] block mb-0.5">今日下班簽退</span>
              <span className="font-mono text-sm font-bold text-[#3D3C35]">
                {todayDetail?.attendance?.out_time || '—:—:—'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Monthly Statistics Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-8 border border-[#EBE9E0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#A5A295] uppercase tracking-wider">
                  當月工時統計面板
                </span>
                <span className="text-xs font-medium text-[#8A877B]">
                  ({currentYear} 年 {currentMonth} 月)
                </span>
              </div>
              <span className="text-[11px] bg-[#F0EEE6] text-[#6B705C] px-2.5 py-0.5 rounded-full font-medium">
                統計結算至今日 ({todayStr})
              </span>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Required Attendance */}
              <div className="bg-[#FAFAF8] p-5 rounded-3xl border border-[#EBE9E0]">
                <div className="text-xs font-bold text-[#A5A295] uppercase mb-1">當月應出勤</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-light text-[#3D3C35] font-mono">
                    {stats.requiredHours}
                  </span>
                  <span className="text-xs text-[#A5A295]">小時</span>
                </div>
                <div className="text-xs text-[#8A877B] mt-3 font-medium">
                  應出勤天數：<span className="font-semibold text-[#3D3C35]">{stats.requiredDays} 天</span>
                </div>
              </div>

              {/* Actual Attendance */}
              <div className="bg-[#F0EEE6]/60 p-5 rounded-3xl border border-[#EBE9E0]">
                <div className="text-xs font-bold text-[#6B705C] uppercase mb-1">當月已出勤</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-light text-[#6B705C] font-mono">
                    {stats.actualHours}
                  </span>
                  <span className="text-xs text-[#6B705C]/70">小時</span>
                </div>
                <div className="text-xs text-[#6B705C] mt-3 font-medium">
                  實際打卡：<span className="font-semibold text-[#6B705C]">{stats.actualDays} 天</span>
                </div>
              </div>

              {/* Balance (Overtime or Deficit) */}
              <div
                className={`p-5 rounded-3xl border ${
                  stats.balanceHours >= 0
                    ? 'bg-[#DDE5B6]/40 border-[#CBD59E]'
                    : 'bg-[#FFE8D6]/60 border-[#F2CCB6]'
                }`}
              >
                <div
                  className={`text-xs font-bold uppercase mb-1 ${
                    stats.balanceHours >= 0 ? 'text-[#6B705C]' : 'text-[#A47148]'
                  }`}
                >
                  工時差額結算
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-3xl font-light font-mono ${
                      stats.balanceHours >= 0 ? 'text-[#6B705C]' : 'text-[#A47148]'
                    }`}
                  >
                    {stats.balanceHours >= 0 ? `+${stats.balanceHours}` : stats.balanceHours}
                  </span>
                  <span
                    className={`text-xs ${
                      stats.balanceHours >= 0 ? 'text-[#6B705C]/70' : 'text-[#A47148]/70'
                    }`}
                  >
                    小時
                  </span>
                </div>
                <div
                  className={`text-xs mt-3 font-semibold flex items-center gap-1 ${
                    stats.balanceHours >= 0 ? 'text-[#6B705C]' : 'text-[#A47148]'
                  }`}
                >
                  {stats.balanceHours >= 0 ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5" />
                      工時充裕 / 累計加班
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3.5 h-3.5" />
                      時數不足 / 待補足
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Core logic explainer note */}
            <div className="bg-[#FAFAF8] rounded-2xl p-4 border border-[#F0EEE6] text-xs text-[#4A4941] leading-relaxed space-y-1">
              <div className="font-semibold text-[#3D3C35] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#6B705C]" />
                結算核心規則說明：
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[#8A877B] pl-1 text-[11px]">
                <li>
                  <span className="font-medium text-[#3D3C35]">統計結算點：</span>
                  「應出勤時數」僅結算至今天為止，不預算未來天數，確保工時差額準確。
                </li>
                <li>
                  <span className="font-medium text-[#3D3C35]">請假優先權：</span>
                  請假日自動排除於應出勤計算之外，不計入應出勤天數與時數。
                </li>
                <li>
                  <span className="font-medium text-[#3D3C35]">午休自動扣除：</span>
                  單日打卡工時區間大於 4 小時自動扣除 1 小時午休。
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance & Leave Logs for the Month */}
      <div className="bg-white rounded-[32px] border border-[#EBE9E0] shadow-sm overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-[#F0EEE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#3D3C35] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6B705C]" />
              {currentYear} 年 {currentMonth} 月出勤與請假紀錄明細
            </h3>
            <p className="text-xs text-[#A5A295] mt-0.5">
              顯示該員工本月出勤打卡、請假申請及排班狀態
            </p>
          </div>
          <div className="text-xs text-[#6B705C] bg-[#F0EEE6] px-3.5 py-1.5 rounded-full border border-[#EBE9E0] font-semibold">
            共 {displayLogs.length} 筆紀錄
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] text-[#A5A295] text-[10px] border-b border-[#F0EEE6] uppercase font-bold tracking-widest">
              <tr>
                <th className="py-4 px-8">日期</th>
                <th className="py-4 px-4">星期</th>
                <th className="py-4 px-4">排班型態</th>
                <th className="py-4 px-4">上班打卡</th>
                <th className="py-4 px-4">下班打卡</th>
                <th className="py-4 px-4">實計工時</th>
                <th className="py-4 px-8 text-right">出勤狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE6]">
              {displayLogs.map((log) => {
                const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
                const isToday = log.dateStr === todayStr;

                return (
                  <tr
                    key={log.dateStr}
                    className={`hover:bg-[#FAFAF8] transition-colors ${
                      isToday ? 'bg-[#F0EEE6]/40 font-medium' : ''
                    }`}
                  >
                    <td className="py-4 px-8 font-mono font-medium text-[#3D3C35]">
                      <div className="flex items-center gap-2">
                        <span>{log.dateStr}</span>
                        {isToday && (
                          <span className="text-[10px] bg-[#6B705C] text-white px-2 py-0.5 rounded-full font-bold">
                            今日
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#8A877B]">{dayNames[log.dayOfWeek]}</td>
                    <td className="py-4 px-4">
                      {log.isOverridden ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0EEE6] text-[#6B705C] border border-[#EBE9E0]">
                          {log.isWorkday ? `自訂出勤 (${log.startTime}~${log.endTime})` : '自訂排休'}
                        </span>
                      ) : log.isWorkday ? (
                        <span className="text-[#4A4941]">常規工作日 (09:00~18:00)</span>
                      ) : (
                        <span className="text-[#A5A295]">週末休息日</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-[#3D3C35]">
                      {log.attendance?.in_time || '—'}
                    </td>
                    <td className="py-4 px-4 font-mono text-[#3D3C35]">
                      {log.attendance?.out_time || '—'}
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-[#6B705C]">
                      {log.actualHours > 0 ? `${log.actualHours} hrs` : '—'}
                    </td>
                    <td className="py-4 px-8 text-right">
                      {log.leave ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFE8D6] text-[#A47148] border border-[#F2CCB6]">
                          請假：{log.leave.type}
                        </span>
                      ) : log.attendance?.in_time && log.attendance?.out_time ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#DDE5B6] text-[#6B705C] border border-[#CBD59E]">
                          已出勤
                        </span>
                      ) : log.attendance?.in_time && !log.attendance?.out_time ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0EEE6] text-[#6B705C] border border-[#EBE9E0]">
                          出勤中
                        </span>
                      ) : log.status === 'absent' ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAFAF8] text-[#A5A295] border border-[#EBE9E0]">
                          未打卡
                        </span>
                      ) : !log.isWorkday ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0EEE6] text-[#8A877B]">
                          休息日
                        </span>
                      ) : (
                        <span className="text-[#A5A295]">未到</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        initialMode={leaveModalMode}
      />
    </div>
  );
};
