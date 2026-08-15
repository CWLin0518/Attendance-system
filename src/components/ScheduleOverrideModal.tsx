import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { calculateDurationHours } from '../utils/timeCalculations';
import { X, Calendar, Clock, RotateCcw, Save, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  dateStr: string;
}

export const ScheduleOverrideModal: React.FC<ScheduleOverrideModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  dateStr,
}) => {
  const {
    employees,
    scheduleOverrides,
    saveScheduleOverride,
    removeScheduleOverride,
    showToast,
  } = useAttendance();

  const employee = employees.find((e) => e.id === employeeId);
  const existingOverride = scheduleOverrides.find(
    (o) => o.employee_id === employeeId && o.date === dateStr
  );

  // Derive default workday if not overridden
  const dateObj = dateStr ? new Date(dateStr) : new Date();
  const defaultIsWorkday = dateObj.getDay() >= 1 && dateObj.getDay() <= 5;

  const [isWorkday, setIsWorkday] = useState<boolean>(
    existingOverride ? existingOverride.is_workday : defaultIsWorkday
  );
  const [startTime, setStartTime] = useState<string>(
    existingOverride?.start_time || '09:00'
  );
  const [endTime, setEndTime] = useState<string>(
    existingOverride?.end_time || '18:00'
  );
  const [note, setNote] = useState<string>(existingOverride?.note || '');

  useEffect(() => {
    if (isOpen) {
      if (existingOverride) {
        setIsWorkday(existingOverride.is_workday);
        setStartTime(existingOverride.start_time || '09:00');
        setEndTime(existingOverride.end_time || '18:00');
        setNote(existingOverride.note || '');
      } else {
        setIsWorkday(defaultIsWorkday);
        setStartTime('09:00');
        setEndTime('18:00');
        setNote('');
      }
    }
  }, [isOpen, existingOverride, defaultIsWorkday, dateStr]);

  const calculatedHours = isWorkday ? calculateDurationHours(startTime, endTime) : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isWorkday && (!startTime || !endTime)) {
      showToast('error', '出勤日請設定上班與下班時間！');
      return;
    }

    if (isWorkday && startTime >= endTime) {
      showToast('error', '下班時間必須晚於上班時間！');
      return;
    }

    saveScheduleOverride({
      employee_id: employeeId,
      date: dateStr,
      is_workday: isWorkday,
      start_time: startTime,
      end_time: endTime,
      note: note.trim(),
    });
    onClose();
  };

  const handleRevert = () => {
    removeScheduleOverride(employeeId, dateStr);
    onClose();
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
          id="schedule-override-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EEE6] bg-[#FAFAF8]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#DDE5B6] text-[#6B705C] flex items-center justify-center border border-white shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#3D3C35]">單日排班設定 (Override)</h3>
                <p className="text-xs text-[#A5A295]">
                  {employee?.name} ({employee?.id}) • {dateStr}
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

          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* Override Priority Notice */}
            <div className="p-3.5 bg-[#FFE8D6]/70 border border-[#F2CCB6] rounded-2xl flex items-start gap-2.5 text-xs text-[#A47148] leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-[#A47148] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">管理員排班最高優先權：</span>
                此處自訂設定將覆蓋預設週一至週五常規班表，並即時影響前台應出勤天數與工時計算。
              </div>
            </div>

            {/* Workday Switch */}
            <div className="p-4 bg-[#FAFAF8] border border-[#EBE9E0] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[#3D3C35]">該日出勤狀態</div>
                  <div className="text-xs text-[#8A877B]">
                    {isWorkday ? '此日設定為【需出勤工作日】' : '此日設定為【排休/休息日】'}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isWorkday}
                    onChange={(e) => setIsWorkday(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#EBE9E0] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6B705C]"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EBE9E0]">
                <button
                  type="button"
                  onClick={() => setIsWorkday(true)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all border ${
                    isWorkday
                      ? 'bg-[#F0EEE6] text-[#6B705C] border-[#CBD59E]'
                      : 'bg-white text-[#8A877B] border-[#EBE9E0]'
                  }`}
                >
                  ✓ 設為需出勤日
                </button>
                <button
                  type="button"
                  onClick={() => setIsWorkday(false)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all border ${
                    !isWorkday
                      ? 'bg-[#FFE8D6] text-[#A47148] border-[#F2CCB6]'
                      : 'bg-white text-[#8A877B] border-[#EBE9E0]'
                  }`}
                >
                  ✕ 設為排休 (免出勤)
                </button>
              </div>
            </div>

            {/* Time Configuration if Workday */}
            {isWorkday && (
              <div className="space-y-4 p-4 bg-[#F0EEE6]/50 border border-[#EBE9E0] rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6B705C] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    規定出勤時段
                  </span>
                  <span className="text-xs font-mono font-bold text-[#6B705C] bg-[#DDE5B6] px-2.5 py-0.5 rounded-full">
                    計為 {calculatedHours} 工時
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8A877B] mb-1">
                      上班時間
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EBE9E0] rounded-xl text-[#3D3C35] text-sm font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-[#6B705C]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8A877B] mb-1">
                      下班時間
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EBE9E0] rounded-xl text-[#3D3C35] text-sm font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-[#6B705C]"
                      required
                    />
                  </div>
                </div>

                <p className="text-[11px] text-[#8A877B] leading-relaxed flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#6B705C] shrink-0" />
                  時數大於 4 小時自動扣除 1 小時午休時間。目前區間計為 {calculatedHours} 小時。
                </p>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-[#A5A295] uppercase tracking-wider mb-1.5">
                調班備註說明
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例如：專案週末輪值、例休調移..."
                className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#EBE9E0] rounded-xl text-[#3D3C35] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#6B705C] focus:border-[#CBD59E]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#F0EEE6]">
              {existingOverride ? (
                <button
                  type="button"
                  onClick={handleRevert}
                  className="px-3.5 py-2 text-xs font-semibold text-[#A47148] hover:bg-[#FFE8D6] rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  恢復預設排班
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-[#8A877B] hover:text-[#3D3C35] hover:bg-[#F0EEE6] rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  id="save-override-btn"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#6B705C] hover:bg-[#5a5f4c] rounded-xl shadow-md shadow-[#6B705C33] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  儲存排班
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
