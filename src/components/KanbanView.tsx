import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAttendance } from '../context/AttendanceContext';
import { KanbanTask, TaskPriority, TaskStatus } from '../types';
import { TaskModal } from './TaskModal';
import {
  Kanban,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  Zap,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit,
  Tag,
  Check,
  Layers,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';

const COLUMNS: { status: TaskStatus; title: string; subtitle: string; color: string; badgeBg: string; borderTop: string }[] = [
  {
    status: 'todo',
    title: '待處理',
    subtitle: 'To Do',
    color: 'text-[#6C6A5E]',
    badgeBg: 'bg-[#EAE8DD] text-[#4A4941]',
    borderTop: 'border-t-4 border-t-slate-400',
  },
  {
    status: 'in_progress',
    title: '進行中',
    subtitle: 'In Progress',
    color: 'text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-900 border border-amber-200',
    borderTop: 'border-t-4 border-t-amber-500',
  },
  {
    status: 'review',
    title: '審核中',
    subtitle: 'Review / Testing',
    color: 'text-blue-700',
    badgeBg: 'bg-blue-100 text-blue-900 border border-blue-200',
    borderTop: 'border-t-4 border-t-blue-500',
  },
  {
    status: 'done',
    title: '已完成',
    subtitle: 'Completed',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
    borderTop: 'border-t-4 border-t-emerald-500',
  },
];

export const KanbanView: React.FC = () => {
  const { kanbanTasks, employees, todayStr, moveTaskStatus, deleteTask } = useAttendance();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<KanbanTask | null>(null);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus>('todo');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return kanbanTasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q) || false;
        const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }

      // Filter Assignee
      if (filterAssignee !== 'all') {
        if (filterAssignee === 'unassigned') {
          if (task.assigneeId) return false;
        } else {
          if (task.assigneeId !== filterAssignee) return false;
        }
      }

      // Filter Priority
      if (filterPriority !== 'all') {
        if (task.priority !== filterPriority) return false;
      }

      return true;
    });
  }, [kanbanTasks, searchQuery, filterAssignee, filterPriority]);

  // Statistics
  const totalCount = kanbanTasks.length;
  const todoCount = kanbanTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = kanbanTasks.filter((t) => t.status === 'in_progress').length;
  const reviewCount = kanbanTasks.filter((t) => t.status === 'review').length;
  const doneCount = kanbanTasks.filter((t) => t.status === 'done').length;
  const completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Overdue count
  const overdueCount = kanbanTasks.filter(
    (t) => t.dueDate && t.dueDate < todayStr && t.status !== 'done'
  ).length;

  const handleOpenNewTask = (status: TaskStatus = 'todo') => {
    setTaskToEdit(null);
    setModalDefaultStatus(status);
    setIsModalOpen(true);
  };

  const handleOpenEditTask = (task: KanbanTask) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600" />
            急迫
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Zap className="w-3 h-3 text-amber-600" />
            高
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            中
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            低
          </span>
        );
    }
  };

  // Next and Previous status transitions
  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'review';
    if (current === 'review') return 'done';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'done') return 'review';
    if (current === 'review') return 'in_progress';
    if (current === 'in_progress') return 'todo';
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Section: Title & Top Statistics Cards */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6B705C] text-white flex items-center justify-center shadow-md shadow-[#6B705C33]">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#3D3C35] tracking-tight flex items-center gap-2">
                專案工作看板
                <span className="text-xs font-mono font-bold bg-[#EAE8DD] text-[#6B705C] px-2.5 py-0.5 rounded-full border border-[#EBE9E0]">
                  Project Kanban
                </span>
              </h2>
              <p className="text-xs text-[#8C887B] mt-0.5">
                追蹤專案進度、排定待辦任務與員工指派分工
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenNewTask('todo')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#6B705C] hover:bg-[#585C4B] text-white text-xs font-bold shadow-md shadow-[#6B705C33] transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>新增專案任務</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Total Tasks */}
        <div className="p-4 rounded-2xl bg-white border border-[#EBE9E0] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8C887B] uppercase tracking-wider">全部任務</div>
            <div className="text-2xl font-black text-[#3D3C35] mt-0.5 font-mono">{totalCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#F7F6F2] text-[#6B705C] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex items-center justify-between bg-amber-50/20">
          <div>
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">進行中</div>
            <div className="text-2xl font-black text-amber-700 mt-0.5 font-mono">{inProgressCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        {/* Review */}
        <div className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-xs flex items-center justify-between bg-blue-50/20">
          <div>
            <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">審核中</div>
            <div className="text-2xl font-black text-blue-700 mt-0.5 font-mono">{reviewCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Completed Rate */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs flex items-center justify-between bg-emerald-50/20">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">已完成</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5 font-mono">
              {doneCount} <span className="text-xs text-emerald-600 font-sans font-medium">({completionRate}%)</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Overdue Warning */}
        <div className={`col-span-2 sm:col-span-4 lg:col-span-1 p-4 rounded-2xl border shadow-xs flex items-center justify-between ${
          overdueCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-[#EBE9E0]'
        }`}>
          <div>
            <div className={`text-[11px] font-bold uppercase tracking-wider ${
              overdueCount > 0 ? 'text-rose-800' : 'text-[#8C887B]'
            }`}>
              逾期提醒
            </div>
            <div className={`text-2xl font-black mt-0.5 font-mono ${
              overdueCount > 0 ? 'text-rose-700' : 'text-[#3D3C35]'
            }`}>
              {overdueCount} <span className="text-xs font-sans font-normal">項</span>
            </div>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            overdueCount > 0 ? 'bg-rose-200 text-rose-800' : 'bg-[#F7F6F2] text-[#A5A295]'
          }`}>
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE9E0] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A5A295]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋任務名稱、說明或標籤 (#後端, #前端)..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAFAF8] border border-[#EBE9E0] rounded-xl text-xs text-[#3D3C35] placeholder-[#A5A295] focus:outline-hidden focus:border-[#6B705C] focus:bg-white transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A5A295] hover:text-[#3D3C35]"
            >
              &times;
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Assignee Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAFAF8] border border-[#EBE9E0] px-3 py-1.5 rounded-xl text-xs">
            <User className="w-3.5 h-3.5 text-[#6B705C]" />
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#3D3C35] focus:outline-hidden"
            >
              <option value="all">所有指派成員</option>
              <option value="unassigned">未指派</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.title || emp.id})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAFAF8] border border-[#EBE9E0] px-3 py-1.5 rounded-xl text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B705C]" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#3D3C35] focus:outline-hidden"
            >
              <option value="all">所有優先級</option>
              <option value="urgent">🚨 急迫 (Urgent)</option>
              <option value="high">⚡ 高 (High)</option>
              <option value="medium">🔹 中 (Medium)</option>
              <option value="low">⚪ 低 (Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns (4 Columns Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.status);

          return (
            <div
              key={col.status}
              className={`bg-[#FAF9F5] rounded-3xl border border-[#EBE9E0] shadow-xs flex flex-col min-h-[520px] overflow-hidden ${col.borderTop}`}
            >
              {/* Column Header */}
              <div className="px-4 py-3.5 border-b border-[#EBE9E0] bg-white/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black ${col.color}`}>{col.title}</span>
                  <span className="text-[11px] text-[#A5A295] font-sans font-medium hidden sm:inline">
                    {col.subtitle}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}
                  >
                    {colTasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenNewTask(col.status)}
                  title={`在「${col.title}」新增任務`}
                  className="w-7 h-7 rounded-lg text-[#8C887B] hover:text-[#3D3C35] hover:bg-[#F0EEE6] flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                {colTasks.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-[#EBE9E0] rounded-2xl">
                    <p className="text-xs text-[#A5A295] font-medium">目前無任何卡片</p>
                    <button
                      onClick={() => handleOpenNewTask(col.status)}
                      className="mt-2 text-[11px] font-bold text-[#6B705C] hover:underline"
                    >
                      + 點此新增任務
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {colTasks.map((task) => {
                      const assignee = employees.find((e) => e.id === task.assigneeId);
                      const isOverdue =
                        task.dueDate && task.dueDate < todayStr && task.status !== 'done';
                      const prevStatus = getPrevStatus(task.status);
                      const nextStatus = getNextStatus(task.status);

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white rounded-2xl p-4 border border-[#EBE9E0] shadow-xs hover:shadow-md transition-all space-y-3 group"
                        >
                          {/* Card Top: Priority & Task ID */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {getPriorityBadge(task.priority)}
                              {task.estimatedHours && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-[#8C887B] bg-[#F7F6F2] px-1.5 py-0.5 rounded">
                                  <Clock className="w-2.5 h-2.5" />
                                  {task.estimatedHours}h
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-[#A5A295] font-semibold">
                              {task.id}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-xs sm:text-sm font-bold text-[#3D3C35] leading-snug break-words">
                            {task.title}
                          </h4>

                          {/* Description snippet */}
                          {task.description && (
                            <p className="text-[11px] text-[#6C6A5E] line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F4F3ED] text-[#6C6A5E]"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Card Meta: Assignee & Due Date */}
                          <div className="pt-2 border-t border-[#F0EEE6] flex items-center justify-between text-xs">
                            {/* Assignee */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-5 h-5 rounded-full bg-[#6B705C] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {assignee ? assignee.name.charAt(0) : '?'}
                              </div>
                              <span className="text-[11px] font-medium text-[#4A4941] truncate">
                                {assignee ? assignee.name : '未指派'}
                              </span>
                            </div>

                            {/* Due Date */}
                            {task.dueDate && (
                              <div
                                className={`flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                                  isOverdue
                                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                                    : 'bg-[#F7F6F2] text-[#8C887B]'
                                }`}
                                title={isOverdue ? '任務已逾期' : '預計完成日'}
                              >
                                <Calendar className="w-3 h-3" />
                                <span>{task.dueDate.slice(5)}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions Bar (Flow transitions & Edit/Delete) */}
                          <div className="pt-2 border-t border-[#F0EEE6] flex items-center justify-between">
                            {/* Move Left Button */}
                            <div>
                              {prevStatus ? (
                                <button
                                  type="button"
                                  onClick={() => moveTaskStatus(task.id, prevStatus)}
                                  title="移至上一階段"
                                  className="p-1.5 rounded-lg bg-[#FAF9F5] hover:bg-[#6B705C] hover:text-white text-[#8C887B] transition-colors"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <div className="w-6" />
                              )}
                            </div>

                            {/* Center Edit / Delete */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditTask(task)}
                                title="編輯任務"
                                className="p-1.5 rounded-lg text-[#8C887B] hover:text-[#3D3C35] hover:bg-[#F0EEE6] transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`確定要刪除任務「${task.title}」嗎？`)) {
                                    deleteTask(task.id);
                                  }
                                }}
                                title="刪除任務"
                                className="p-1.5 rounded-lg text-[#8C887B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Move Right Button */}
                            <div>
                              {nextStatus ? (
                                <button
                                  type="button"
                                  onClick={() => moveTaskStatus(task.id, nextStatus)}
                                  title="推進至下一階段"
                                  className="p-1.5 rounded-lg bg-[#FAF9F5] hover:bg-[#6B705C] hover:text-white text-[#8C887B] transition-colors"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-50">
                                  <Check className="w-3 h-3" />
                                  完成
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal (Add / Edit) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultStatus={modalDefaultStatus}
      />
    </div>
  );
};
