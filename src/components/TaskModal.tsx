import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAttendance } from '../context/AttendanceContext';
import { KanbanTask, TaskPriority, TaskStatus } from '../types';
import {
  X,
  Plus,
  Edit3,
  Calendar,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  Flame,
  Zap,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: KanbanTask | null;
  defaultStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultStatus = 'todo',
}) => {
  const { employees, addTask, updateTask, showToast } = useAttendance();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [estimatedHours, setEstimatedHours] = useState<string>('4');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setAssigneeId(taskToEdit.assigneeId || '');
      setDueDate(taskToEdit.dueDate || '');
      setEstimatedHours(taskToEdit.estimatedHours ? String(taskToEdit.estimatedHours) : '');
      setTags(taskToEdit.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setAssigneeId(employees[0]?.id || '');
      // Default due date: 3 days from now
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().split('T')[0]);
      setEstimatedHours('4');
      setTags(['專案任務']);
    }
  }, [taskToEdit, defaultStatus, isOpen, employees]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('error', '請輸入任務標題！');
      return;
    }

    const estHoursNum = estimatedHours ? parseFloat(estimatedHours) : undefined;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        estimatedHours: estHoursNum,
        tags,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        estimatedHours: estHoursNum,
        tags,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3C35]/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-[#EBE9E0] max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#EBE9E0] bg-[#FAF9F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6B705C] text-white flex items-center justify-center shadow-md">
                {taskToEdit ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#3D3C35]">
                  {taskToEdit ? '編輯專案任務' : '新增專案任務'}
                </h3>
                <p className="text-xs text-[#A5A295]">
                  {taskToEdit ? `任務編號: ${taskToEdit.id}` : '建立新看板卡片並指派成員'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#A5A295] hover:text-[#3D3C35] hover:bg-[#EBE9E0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6C6A5E] mb-1.5">
                任務名稱 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：實作多裝置打卡即時輪詢機制..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE9E0] bg-[#FAFAF8] text-[#3D3C35] placeholder-[#A5A295] text-sm focus:outline-hidden focus:border-[#6B705C] focus:bg-white transition-all font-medium"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6C6A5E] mb-1.5">
                任務說明與備註
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="說明該任務的需求細節、驗收標準或待辦要點..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE9E0] bg-[#FAFAF8] text-[#3D3C35] placeholder-[#A5A295] text-xs focus:outline-hidden focus:border-[#6B705C] focus:bg-white transition-all leading-relaxed resize-none"
              />
            </div>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6C6A5E] mb-1.5">
                  當前狀態
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE9E0] bg-[#FAFAF8] text-[#3D3C35] text-xs font-semibold focus:outline-hidden focus:border-[#6B705C]"
                >
                  <option value="todo">📌 待處理 (To Do)</option>
                  <option value="in_progress">⚡ 進行中 (In Progress)</option>
                  <option value="review">🔍 審核中 (Review)</option>
                  <option value="done">✅ 已完成 (Done)</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6C6A5E] mb-1.5">
                  優先層級 (Priority)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { key: 'low', label: '低', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                      { key: 'medium', label: '中', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                      { key: 'high', label: '高', color: 'bg-amber-50 text-amber-800 border-amber-200' },
                      { key: 'urgent', label: '急', color: 'bg-rose-50 text-rose-700 border-rose-200' },
                    ] as const
                  ).map((p) => {
                    const isSelected = priority === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPriority(p.key)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? `${p.color} ring-2 ring-[#6B705C] shadow-xs`
                            : 'bg-white text-[#8C887B] border-[#EBE9E0] hover:bg-[#FAF9F5]'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Assignee & Due Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assignee */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6C6A5E] mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#6B705C]" />
                  <span>指派負責人</span>
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE9E0] bg-[#FAFAF8] text-[#3D3C35] text-xs font-medium focus:outline-hidden focus:border-[#6B705C]"
                >
                  <option value="">-- 未指派負責人 --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department || emp.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6C6A5E] mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#6B705C]" />
                  <span>預計完成日 (Due Date)</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE9E0] bg-[#FAFAF8] text-[#3D3C35] text-xs font-medium focus:outline-hidden focus:border-[#6B705C]"
                />
              </div>
            </div>

            {/* Estimated Hours & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6C6A5E] mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#6B705C]" />
                  <span>預估工時 (小時)</span>
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  placeholder="4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE9E0] bg-[#FAFAF8] text-[#3D3C35] text-xs font-medium focus:outline-hidden focus:border-[#6B705C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6C6A5E] mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#6B705C]" />
                  <span>標籤管理 (Tags)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="輸入標籤按 Enter 新增..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#EBE9E0] bg-[#FAFAF8] text-[#3D3C35] text-xs font-medium focus:outline-hidden focus:border-[#6B705C]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-[#F0EEE6] hover:bg-[#6B705C] hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    新增
                  </button>
                </div>
                {/* Tag chips */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAE8DD] text-[#4A4941] text-[11px] font-semibold"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-600 ml-0.5"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#EBE9E0] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#EBE9E0] text-[#6C6A5E] hover:bg-[#F0EEE6] font-semibold text-xs transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#6B705C] hover:bg-[#585C4B] text-white font-bold text-xs shadow-md shadow-[#6B705C33] transition-all"
              >
                {taskToEdit ? '儲存變更' : '建立任務'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
