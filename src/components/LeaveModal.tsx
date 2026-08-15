import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { LeaveType } from '../types';
import { X, CalendarDays, Clock, FileText, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'same-day' | 'advance';
  initialDate?: string;
}

const LEAVE_TYPES: { type: LeaveType; desc: string; color: string }[] = [
  { type: '事假', desc: '個人私事需處理', color: 'border-amber-500 text-amber-700 bg-amber-50' },
  { type: '病假', desc: '身體不適或就醫', color: 'border-rose-500 text-rose-700 bg-rose-50' },
  { type: '特休', desc: '年度特別休假', color: 'border-indigo-500 text-indigo-700 bg-indigo-50' },
  { type: '公假', desc: '公務或兵役召集', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
];

export const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'advance',
  initialDate,
}) => {
  const { employees, selectedEmployeeId, todayStr, applyLeave, showToast } = useAttendance();

  const [mode, setMode] = useState<'same-day' | 'advance'>(initialMode);
  const [employeeId, setEmployeeId] = useState<string>(selectedEmployeeId);
  const [date, setDate] = useState<string>(initialDate || todayStr);
  const [type, setType] = useState<LeaveType>('特休');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmployeeId(selectedEmployeeId);
      if (initialMode === 'same-day') {
        setDate(todayStr);
      } else {
        setDate(initialDate || todayStr);
      }
      setReason('');
    }
  }, [isOpen, initialMode, initialDate, selectedEmployeeId, todayStr]);

  const handleModeChange = (newMode: 'same-day' | 'advance') => {
    setMode(newMode);
    if (newMode === 'same-day') {
      setDate(todayStr);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      showToast('error', '請選擇申請員工！');
      return;
    }

    if (!date) {
      showToast('error', '請選擇請假日期！');
      return;
    }

    if (mode === 'advance' && date < todayStr) {
      showToast('error', '預先請假日期不得小於今日！');
      return;
    }

    const success = applyLeave({
      employee_id: employeeId,
      date,
      type,
      reason: reason.trim(),
    });

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3C35]/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white rounded-[28px] shadow-2xl border border-[#EBE9E0] max-w-lg w-full overflow-hidden"
          id="leave-application-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EEE6] bg-[#FAFAF8]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#FFE8D6] text-[#A47148] flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#3D3C35]">請假申請</h3>
                <p className="text-xs text-[#A5A295]">
                  {mode === 'same-day' ? '當日臨時請假' : '預先請假排休'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#A5A295] hover:text-[#3D3C35] p-1.5 rounded-full hover:bg-[#F0EEE6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0EEE6] rounded-full border border-[#EBE9E0]">
              <button
                type="button"
                onClick={() => handleModeChange('same-day')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'same-day'
                    ? 'bg-white text-[#6B705C] shadow-xs'
                    : 'text-[#A5A295] hover:text-[#3D3C35]'
                }`}
              >
                <Clock className="w-4 h-4" />
                當日請假 (今日)
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('advance')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'advance'
                    ? 'bg-white text-[#6B705C] shadow-xs'
                    : 'text-[#A5A295] hover:text-[#3D3C35]'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                預先請假 (未來日期)
              </button>
            </div>

            {/* Employee Selector */}
            <div>
              <label className="block text-xs font-bold text-[#A5A295] uppercase tracking-wider mb-1.5">
                申請員工
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#EBE9E0] rounded-xl text-[#3D3C35] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#6B705C] focus:border-[#CBD59E]"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) - {emp.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-bold text-[#A5A295] uppercase tracking-wider mb-1.5">
                請假日期
              </label>
              {mode === 'same-day' ? (
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#F0EEE6] border border-[#EBE9E0] rounded-xl text-[#3D3C35] text-sm">
                  <span className="font-mono font-bold">{todayStr}</span>
                  <span className="text-xs bg-white text-[#6B705C] px-2.5 py-0.5 rounded-full font-semibold border border-[#EBE9E0]">
                    強制鎖定今日
                  </span>
                </div>
              ) : (
                <input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#EBE9E0] rounded-xl text-[#3D3C35] text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#6B705C] focus:border-[#CBD59E]"
                  required
                />
              )}
              {mode === 'advance' && (
                <p className="text-xs text-[#A5A295] mt-1">只可選擇大於或等於今日之日期</p>
              )}
            </div>

            {/* Leave Type Selector */}
            <div>
              <label className="block text-xs font-bold text-[#A5A295] uppercase tracking-wider mb-2">
                請假假別
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {LEAVE_TYPES.map((lt) => {
                  const isSelected = type === lt.type;
                  return (
                    <button
                      key={lt.type}
                      type="button"
                      onClick={() => setType(lt.type)}
                      className={`flex flex-col text-left p-3.5 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-[#6B705C] bg-[#F0EEE6]/70 shadow-xs'
                          : 'border-[#EBE9E0] bg-white hover:border-[#CBD59E]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm text-[#3D3C35]">{lt.type}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-[#6B705C]" />}
                      </div>
                      <span className="text-xs text-[#8A877B]">{lt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-[#A5A295] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#A5A295]" />
                事由說明 (選填)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="請輸入請假事由或備註..."
                rows={2}
                className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#EBE9E0] rounded-xl text-[#3D3C35] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#6B705C] focus:border-[#CBD59E] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EEE6]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold text-[#8A877B] hover:text-[#3D3C35] hover:bg-[#F0EEE6] rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                id="submit-leave-btn"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#6B705C] hover:bg-[#5a5f4c] rounded-xl shadow-md shadow-[#6B705C33] transition-all active:scale-95 cursor-pointer"
              >
                確認送出請假
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
