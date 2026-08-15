import React, { useState } from 'react';
import { X, Database, Table, Key, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SchemaReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaReferenceModal: React.FC<SchemaReferenceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'sql'>('tables');

  if (!isOpen) return null;

  const tables = [
    {
      name: '5.1 Employees (員工表)',
      description: '儲存員工基本資料與識別碼',
      columns: [
        { name: 'id', type: 'VARCHAR(50) / PK', desc: '員工唯一識別碼 (如 EMP-001)' },
        { name: 'name', type: 'VARCHAR(100)', desc: '員工姓名與部門/職稱資訊' },
      ],
    },
    {
      name: '5.2 Attendance_Logs (打卡紀錄表)',
      description: '紀錄員工每日上下班打卡時間戳記',
      columns: [
        { name: 'id', type: 'INT / PK, AI', desc: '紀錄流水號' },
        { name: 'employee_id', type: 'VARCHAR(50) / FK', desc: '關聯員工 ID' },
        { name: 'date', type: 'DATE', desc: '打卡日期 (YYYY-MM-DD)' },
        { name: 'in_time', type: 'TIME', desc: '上班打卡時間 (HH:MM:SS)' },
        { name: 'out_time', type: 'TIME', desc: '下班打卡時間 (HH:MM:SS)' },
      ],
    },
    {
      name: '5.3 Leave_Requests (請假紀錄表)',
      description: '紀錄員工之各類請假申請 (優先排除應出勤)',
      columns: [
        { name: 'id', type: 'INT / PK, AI', desc: '紀錄流水號' },
        { name: 'employee_id', type: 'VARCHAR(50) / FK', desc: '關聯員工 ID' },
        { name: 'date', type: 'DATE', desc: '請假日期 (YYYY-MM-DD)' },
        { name: 'type', type: 'VARCHAR(20)', desc: '假別 (事假, 病假, 特休, 公假)' },
      ],
    },
    {
      name: '5.4 Schedule_Overrides (排班設定表)',
      description: '管理員單日排班自訂設定 (擁有最高優先權)',
      columns: [
        { name: 'id', type: 'INT / PK, AI', desc: '紀錄流水號' },
        { name: 'employee_id', type: 'VARCHAR(50) / FK', desc: '關聯員工 ID' },
        { name: 'date', type: 'DATE', desc: '設定之特定日期 (YYYY-MM-DD)' },
        { name: 'is_workday', type: 'BOOLEAN', desc: '是否需出勤 (1:是, 0:排休)' },
        { name: 'start_time', type: 'TIME', desc: '規定上班時間 (HH:MM)' },
        { name: 'end_time', type: 'TIME', desc: '規定下班時間 (HH:MM)' },
      ],
    },
  ];

  const sqlDDL = `-- ==========================================
-- 簡易網頁出勤系統 RDBMS 關聯式資料庫 Schema 規劃
-- ==========================================

CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    title VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance_logs (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    in_time TIME,
    out_time TIME,
    CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, date)
);

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 事假, 病假, 特休, 公假
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_leave_employee_date UNIQUE (employee_id, date)
);

CREATE TABLE schedule_overrides (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_workday BOOLEAN NOT NULL DEFAULT TRUE, -- 1: 是, 0: 排休
    start_time TIME DEFAULT '09:00:00',
    end_time TIME DEFAULT '18:00:00',
    note TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_schedule_employee_date UNIQUE (employee_id, date)
);

-- 建立索引加速查詢與月曆計算效能
CREATE INDEX idx_att_emp_date ON attendance_logs(employee_id, date);
CREATE INDEX idx_leave_emp_date ON leave_requests(employee_id, date);
CREATE INDEX idx_override_emp_date ON schedule_overrides(employee_id, date);
`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3C35]/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white rounded-[28px] shadow-2xl border border-[#EBE9E0] max-w-3xl w-full overflow-hidden flex flex-col max-h-[85vh]"
          id="schema-reference-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EEE6] bg-[#FAFAF8]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#DDE5B6] text-[#6B705C] flex items-center justify-center border border-white shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#3D3C35]">
                  第 5 節 資料模型規劃 (Database Schema)
                </h3>
                <p className="text-xs text-[#A5A295]">
                  供未來串接真實關聯式資料庫 (RDBMS) 之規格架構建議
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

          {/* Sub Navigation */}
          <div className="flex border-b border-[#EBE9E0] px-6 bg-[#FAFAF8]">
            <button
              type="button"
              onClick={() => setActiveTab('tables')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'tables'
                  ? 'border-[#6B705C] text-[#6B705C] bg-white'
                  : 'border-transparent text-[#A5A295] hover:text-[#3D3C35]'
              }`}
            >
              <Table className="w-4 h-4" />
              規格欄位定義 (4 大表)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sql')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'sql'
                  ? 'border-[#6B705C] text-[#6B705C] bg-white'
                  : 'border-transparent text-[#A5A295] hover:text-[#3D3C35]'
              }`}
            >
              <Code className="w-4 h-4" />
              SQL DDL 建表指令
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#FAFAF8]/50">
            {activeTab === 'tables' ? (
              <div className="space-y-5">
                {tables.map((table, idx) => (
                  <div key={idx} className="border border-[#EBE9E0] rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="bg-[#FAFAF8] px-4 py-3 border-b border-[#EBE9E0] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#6B705C]" />
                        <span className="font-bold text-sm text-[#3D3C35]">{table.name}</span>
                      </div>
                      <span className="text-xs text-[#8A877B]">{table.description}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAFAF8] text-[#8A877B] border-b border-[#EBE9E0]">
                          <tr>
                            <th className="py-2.5 px-4 font-bold">欄位名稱</th>
                            <th className="py-2.5 px-4 font-bold">型別與限制</th>
                            <th className="py-2.5 px-4 font-bold">說明</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EEE6] font-mono">
                          {table.columns.map((col, cIdx) => (
                            <tr key={cIdx} className="hover:bg-[#FAFAF8] font-sans transition-colors">
                              <td className="py-2.5 px-4 font-mono font-bold text-[#3D3C35]">
                                {col.name}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-[#6B705C] font-semibold text-xs">
                                {col.type}
                              </td>
                              <td className="py-2.5 px-4 text-[#4A4941]">{col.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#2C2B26] text-[#DDE5B6] p-5 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-[#3D3C35] shadow-inner">
                <pre>{sqlDDL}</pre>
              </div>
            )}
          </div>

          <div className="px-6 py-3.5 bg-[#FAFAF8] border-t border-[#F0EEE6] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-[#3D3C35] bg-white border border-[#EBE9E0] rounded-xl hover:bg-[#F0EEE6] transition-colors shadow-xs cursor-pointer"
            >
              關閉
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
