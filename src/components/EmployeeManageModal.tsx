import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { X, UserPlus, Users, Trash2, Building, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmployeeManageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeManageModal: React.FC<EmployeeManageModalProps> = ({ isOpen, onClose }) => {
  const { employees, addEmployee, deleteEmployee, selectedEmployeeId, setSelectedEmployeeId, showToast } =
    useAttendance();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('工程研發部');
  const [title, setTitle] = useState('專員');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', '請輸入員工姓名');
      return;
    }
    addEmployee(name, department, title);
    setName('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string, empName: string) => {
    if (confirm(`確定要刪除員工「${empName} (${id})」及其所有打卡紀錄嗎？`)) {
      deleteEmployee(id);
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
          className="bg-white rounded-[28px] shadow-2xl border border-[#EBE9E0] max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]"
          id="employee-management-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EEE6] bg-[#FAFAF8]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#DDE5B6] text-[#6B705C] flex items-center justify-center border border-white shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#3D3C35]">員工名單管理</h3>
                <p className="text-xs text-[#A5A295]">
                  全系統共用同一員工名單，新增或刪除將即時同步前後台選單
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

          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Top action: Add new employee toggle */}
            {!showAddForm ? (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#CBD59E] bg-[#FAFAF8] text-[#6B705C] font-bold text-sm hover:bg-[#F0EEE6] hover:border-[#6B705C] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                新增員工資料
              </button>
            ) : (
              <form onSubmit={handleAdd} className="p-4.5 bg-[#FAFAF8] border border-[#EBE9E0] rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6B705C] uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-[#6B705C]" />
                    新增員工
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-[#A5A295] hover:text-[#3D3C35] font-semibold"
                  >
                    取消
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8A877B] mb-1">姓名 *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="例如：趙大勇"
                      className="w-full px-3 py-2 bg-white border border-[#EBE9E0] rounded-xl text-sm text-[#3D3C35] focus:ring-2 focus:ring-[#6B705C] focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8A877B] mb-1">部門</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EBE9E0] rounded-xl text-sm text-[#3D3C35] focus:ring-2 focus:ring-[#6B705C] focus:outline-hidden"
                    >
                      <option value="工程研發部">工程研發部</option>
                      <option value="產品設計部">產品設計部</option>
                      <option value="行銷推廣部">行銷推廣部</option>
                      <option value="人事行政部">人事行政部</option>
                      <option value="營運維護部">營運維護部</option>
                      <option value="業務發展部">業務發展部</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8A877B] mb-1">職稱</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="例如：工程師"
                      className="w-full px-3 py-2 bg-white border border-[#EBE9E0] rounded-xl text-sm text-[#3D3C35] focus:ring-2 focus:ring-[#6B705C] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#6B705C] hover:bg-[#5a5f4c] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    確認新增 (系統自動產生 ID)
                  </button>
                </div>
              </form>
            )}

            {/* Employee List */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-[#A5A295] uppercase tracking-wider">
                  現有員工名冊 ({employees.length} 人)
                </span>
                <span className="text-xs text-[#A5A295]">點擊可切換當前選取</span>
              </div>

              <div className="divide-y divide-[#F0EEE6] border border-[#EBE9E0] rounded-2xl overflow-hidden bg-white">
                {employees.map((emp) => {
                  const isCurrent = emp.id === selectedEmployeeId;
                  return (
                    <div
                      key={emp.id}
                      className={`p-3.5 flex items-center justify-between transition-colors ${
                        isCurrent ? 'bg-[#F0EEE6]/70' : 'hover:bg-[#FAFAF8]'
                      }`}
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => {
                          setSelectedEmployeeId(emp.id);
                          showToast('info', `已切換選取員工為：${emp.name}`);
                        }}
                      >
                        <div
                          className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center ${
                            isCurrent
                              ? 'bg-[#6B705C] text-white shadow-xs'
                              : 'bg-[#F0EEE6] text-[#6B705C]'
                          }`}
                        >
                          {emp.name.substring(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#3D3C35]">{emp.name}</span>
                            <span className="font-mono text-xs bg-[#FAFAF8] border border-[#EBE9E0] text-[#6B705C] px-2 py-0.5 rounded-full font-bold">
                              {emp.id}
                            </span>
                            {isCurrent && (
                              <span className="text-[11px] bg-[#DDE5B6] text-[#4A4941] px-2 py-0.5 rounded-full font-bold">
                                當前選取
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#8A877B] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-[#A5A295]" />
                              {emp.department || '未設定部門'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-[#A5A295]" />
                              {emp.title || '員工'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(emp.id, emp.name)}
                          disabled={employees.length <= 1}
                          title={employees.length <= 1 ? '至少需保留一名員工' : '刪除員工'}
                          className={`p-2 rounded-xl transition-colors ${
                            employees.length <= 1
                              ? 'text-[#EBE9E0] cursor-not-allowed'
                              : 'text-[#A5A295] hover:text-[#A47148] hover:bg-[#FFE8D6]'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-6 py-3.5 bg-[#FAFAF8] border-t border-[#F0EEE6] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-[#3D3C35] bg-white border border-[#EBE9E0] rounded-xl hover:bg-[#F0EEE6] transition-colors shadow-xs cursor-pointer"
            >
              完成
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
