import { Employee, AttendanceLog, LeaveRequest, ScheduleOverride, KanbanTask } from '../types';
import { formatDate } from '../utils/timeCalculations';

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: '王大明', department: '工程研發部', title: '資深工程師' },
  { id: 'EMP-002', name: '李小華', department: '產品設計部', title: 'UI/UX 設計師' },
  { id: 'EMP-003', name: '陳志遠', department: '行銷推廣部', title: '行銷企劃' },
  { id: 'EMP-004', name: '林雅婷', department: '人事行政部', title: '行政專員' },
  { id: 'EMP-005', name: '張家豪', department: '營運維護部', title: '系統管理員' },
];

export const INITIAL_KANBAN_TASKS: KanbanTask[] = [
  {
    id: 'TASK-101',
    title: '伺服器外部連線與 HTTPS 安全通道部署',
    description: '整合 Cloudflare Tunnel 與 Windows 防火牆放行規則，支援跨外網 4G/5G 加密連線打卡。',
    status: 'done',
    priority: 'high',
    assigneeId: 'EMP-005', // 張家豪 (系統管理員)
    dueDate: '2026-08-15',
    tags: ['DevOps', '後端', '安全'],
    estimatedHours: 8,
    createdAt: '2026-08-10T09:00:00.000Z',
    updatedAt: '2026-08-15T14:30:00.000Z',
  },
  {
    id: 'TASK-102',
    title: '出勤系統手機端響應式介面優化',
    description: '微調手機瀏覽器打卡按鈕觸控區域，提升小螢幕下的月曆顯示流暢度。',
    status: 'in_progress',
    priority: 'urgent',
    assigneeId: 'EMP-002', // 李小華 (UI/UX)
    dueDate: '2026-08-18',
    tags: ['前端', 'UI設計', 'Mobile'],
    estimatedHours: 12,
    createdAt: '2026-08-12T10:30:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
  },
  {
    id: 'TASK-103',
    title: '多裝置打卡即時輪詢與資料同步',
    description: '實作前端 Context 背景自動輪詢機制，讓手機打卡後主管電腦即時跳出最新紀錄。',
    status: 'done',
    priority: 'high',
    assigneeId: 'EMP-001', // 王大明 (資深工程師)
    dueDate: '2026-08-15',
    tags: ['後端', 'API', '前端'],
    estimatedHours: 6,
    createdAt: '2026-08-13T14:00:00.000Z',
    updatedAt: '2026-08-15T12:00:00.000Z',
  },
  {
    id: 'TASK-104',
    title: '主管審批多天連續請假流程',
    description: '支援跨日請假區間批次申請，並於管理後台加入一鍵快速核准功能。',
    status: 'review',
    priority: 'medium',
    assigneeId: 'EMP-004', // 林雅婷 (行政專員)
    dueDate: '2026-08-20',
    tags: ['業務邏輯', '管理後台'],
    estimatedHours: 10,
    createdAt: '2026-08-14T11:00:00.000Z',
    updatedAt: '2026-08-15T09:30:00.000Z',
  },
  {
    id: 'TASK-105',
    title: '月度出勤報表 Excel / CSV 匯出功能',
    description: '後台提供一鍵匯出全體同仁當月應出勤、實際出勤與加班欠工時統計試算表。',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'EMP-001', // 王大明
    dueDate: '2026-08-25',
    tags: ['報表', '後端'],
    estimatedHours: 16,
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
  },
  {
    id: 'TASK-106',
    title: '打卡防呆 GPS 地理圍欄 (Geo-fencing) 可行性評估',
    description: '評估 HTML5 Geolocation API 在公司半徑 100 公尺內打卡之實作細節與隱私權規範。',
    status: 'todo',
    priority: 'low',
    assigneeId: 'EMP-003', // 陳志遠 (行銷企劃)
    dueDate: '2026-08-28',
    tags: ['研究', '架構規劃'],
    estimatedHours: 5,
    createdAt: '2026-08-15T08:30:00.000Z',
    updatedAt: '2026-08-15T08:30:00.000Z',
  },
];

export function getInitialData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const todayDate = now.getDate();

  const monthStr = String(month).padStart(2, '0');

  const attendanceLogs: AttendanceLog[] = [];
  const leaveRequests: LeaveRequest[] = [];
  const scheduleOverrides: ScheduleOverride[] = [];

  let logId = 1;
  let leaveId = 1;
  let overrideId = 1;

  // Generate realistic logs for EMP-001 (王大明) up to today
  for (let d = 1; d < todayDate; d++) {
    const dStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dStr}`;
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (d === 6) {
        // Leave on day 6
        leaveRequests.push({
          id: leaveId++,
          employee_id: 'EMP-001',
          date: dateStr,
          type: '特休',
          reason: '個人事務休假',
        });
      } else if (d === 10) {
        // Overtime log
        attendanceLogs.push({
          id: logId++,
          employee_id: 'EMP-001',
          date: dateStr,
          in_time: '08:52:14',
          out_time: '19:35:40',
        });
      } else {
        // Normal log
        attendanceLogs.push({
          id: logId++,
          employee_id: 'EMP-001',
          date: dateStr,
          in_time: '08:55:20',
          out_time: '18:05:10',
        });
      }
    }
  }

  // Today for EMP-001: Clocked in this morning
  const todayStr = formatDate(now);
  attendanceLogs.push({
    id: logId++,
    employee_id: 'EMP-001',
    date: todayStr,
    in_time: '08:58:32',
    out_time: null, // currently working
  });

  // Logs for EMP-002 (李小華)
  for (let d = 1; d < todayDate; d++) {
    const dStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dStr}`;
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      attendanceLogs.push({
        id: logId++,
        employee_id: 'EMP-002',
        date: dateStr,
        in_time: '09:02:11',
        out_time: '18:00:25',
      });
    }
  }

  // EMP-002 has a future leave request
  const futureLeaveDate = new Date(now);
  futureLeaveDate.setDate(todayDate + 4);
  leaveRequests.push({
    id: leaveId++,
    employee_id: 'EMP-002',
    date: formatDate(futureLeaveDate),
    type: '事假',
    reason: '家庭聚會',
  });

  // EMP-003 has an override (e.g. customized weekend duty or altered hours)
  const overrideDate = new Date(now);
  overrideDate.setDate(todayDate + 2);
  scheduleOverrides.push({
    id: overrideId++,
    employee_id: 'EMP-003',
    date: formatDate(overrideDate),
    is_workday: true,
    start_time: '10:00',
    end_time: '19:00',
    note: '專案週末輪值調班',
  });

  return {
    employees: INITIAL_EMPLOYEES,
    attendanceLogs,
    leaveRequests,
    scheduleOverrides,
    kanbanTasks: INITIAL_KANBAN_TASKS,
  };
}
