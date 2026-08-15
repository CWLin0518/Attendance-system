import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  User,
  ShieldCheck,
  Clock,
  RotateCcw,
  Users,
  Database,
  CalendarCheck,
  ChevronDown,
  Server,
} from 'lucide-react';
import { EmployeeManageModal } from './EmployeeManageModal';
import { SchemaReferenceModal } from './SchemaReferenceModal';
import { ServerInfoModal } from './ServerInfoModal';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedEmployee,
    employees,
    currentTime,
    resetToInitial,
    showToast,
  } = useAttendance();

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  const formattedDate = currentTime.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  const formattedTime = currentTime.toLocaleTimeString('zh-TW', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-[#EBE9E0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#6B705C] text-white flex items-center justify-center shadow-md shadow-[#6B705C33]">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#3D3C35]">
                    AttendancePro
                  </h1>
                  <span className="hidden md:inline-block text-[10px] uppercase font-mono tracking-wider bg-[#F0EEE6] text-[#6B705C] px-2 py-0.5 rounded-full font-semibold border border-[#EBE9E0]">
                    v1.0
                  </span>
                </div>
                <p className="text-[11px] text-[#A5A295] hidden sm:block">
                  出勤打卡 • 請假申請 • 工時即時結算 • 動態排班
                </p>
              </div>
            </div>

            {/* Middle: Global Employee Selector & View Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Employee Selector (Global & Synchronized) */}
              <div className="flex items-center gap-1.5 bg-[#F0EEE6] p-1 rounded-full border border-[#EBE9E0]">
                <div className="hidden lg:flex items-center pl-2.5 text-xs font-semibold text-[#8A877B]">
                  <User className="w-3.5 h-3.5 mr-1 text-[#6B705C]" />
                  當前員工：
                </div>
                <div className="relative">
                  <select
                    id="global-employee-select"
                    value={selectedEmployeeId}
                    onChange={(e) => {
                      setSelectedEmployeeId(e.target.value);
                      const emp = employees.find((x) => x.id === e.target.value);
                      if (emp) {
                        showToast('info', `已切換選取員工：${emp.name}`);
                      }
                    }}
                    className="appearance-none bg-white text-[#3D3C35] text-xs sm:text-sm font-semibold pl-3 pr-8 py-1 rounded-full border border-[#EBE9E0] shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#6B705C] cursor-pointer hover:border-[#CBD59E]"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#A5A295] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* View Switcher Toggle */}
              <nav className="flex bg-[#F0EEE6] rounded-full p-1 border border-[#EBE9E0]">
                <button
                  type="button"
                  id="tab-employee-view"
                  onClick={() => setCurrentView('employee')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    currentView === 'employee'
                      ? 'bg-white text-[#6B705C] shadow-sm'
                      : 'text-[#A5A295] hover:text-[#3D3C35]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>員工前台</span>
                </button>
                <button
                  type="button"
                  id="tab-admin-view"
                  onClick={() => setCurrentView('admin')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    currentView === 'admin'
                      ? 'bg-white text-[#6B705C] shadow-sm'
                      : 'text-[#A5A295] hover:text-[#3D3C35]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>管理後台</span>
                </button>
              </nav>
            </div>

            {/* Right: Live Clock & Utilities */}
            <div className="flex items-center gap-2">
              {/* Digital Clock */}
              <div className="hidden xl:flex flex-col items-end px-3 py-1 bg-[#FAFAF8] border border-[#EBE9E0] rounded-2xl">
                <div className="text-[11px] font-medium text-[#A5A295]">{formattedDate}</div>
                <div className="flex items-center gap-1 text-sm font-mono font-bold text-[#6B705C]">
                  <Clock className="w-3.5 h-3.5 text-[#6B705C] animate-pulse" />
                  {formattedTime}
                </div>
              </div>

              {/* Server Info / Remote Access */}
              <button
                type="button"
                onClick={() => setIsServerModalOpen(true)}
                title="伺服器與外部連線指南"
                className="p-2 rounded-xl text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-semibold bg-emerald-50/50"
              >
                <Server className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="hidden sm:inline">伺服器連線</span>
              </button>

              {/* Admin Employee Manage button */}
              <button
                type="button"
                onClick={() => setIsEmployeeModalOpen(true)}
                title="管理員工名單"
                className="p-2 rounded-xl text-[#6B705C] hover:text-[#3D3C35] hover:bg-[#F0EEE6] border border-[#EBE9E0] transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold bg-white"
              >
                <Users className="w-4 h-4 text-[#6B705C]" />
                <span className="hidden md:inline">人員管理</span>
              </button>

              {/* Database Schema Reference */}
              <button
                type="button"
                onClick={() => setIsSchemaModalOpen(true)}
                title="檢視資料庫 Schema 規格"
                className="p-2 rounded-xl text-[#A47148] hover:text-[#8B5E3C] hover:bg-[#FFE8D6]/60 border border-[#EBE9E0] transition-colors flex items-center gap-1 text-xs font-semibold bg-white"
              >
                <Database className="w-4 h-4 text-[#A47148]" />
                <span className="hidden lg:inline">Schema 規格</span>
              </button>

              {/* Reset Prototype */}
              <button
                type="button"
                onClick={() => {
                  if (confirm('確定要將所有打卡、排班與名單重置為初始狀態嗎？')) {
                    resetToInitial();
                  }
                }}
                title="重置系統資料"
                className="p-2 rounded-xl text-[#A5A295] hover:text-[#3D3C35] hover:bg-[#F0EEE6] border border-[#EBE9E0] transition-colors bg-white"
                aria-label="重置系統資料"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <ServerInfoModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
      />
      <EmployeeManageModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
      />
      <SchemaReferenceModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />
    </>
  );
};
