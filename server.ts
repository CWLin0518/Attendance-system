import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { getInitialData } from './src/data/initialData';
import { formatDate, formatTime } from './src/utils/timeCalculations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Enable CORS for local development when running Vite separately
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Database file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  employees: Array<{ id: string; name: string; department?: string; title?: string }>;
  attendanceLogs: Array<{ id: number; employee_id: string; date: string; in_time: string | null; out_time: string | null }>;
  leaveRequests: Array<{ id: number; employee_id: string; date: string; type: string; reason?: string }>;
  scheduleOverrides: Array<{ id: number; employee_id: string; date: string; is_workday: boolean; start_time: string; end_time: string; note?: string }>;
}

function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    saveDatabase(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, resetting to initial data:', err);
    const initial = getInitialData();
    saveDatabase(initial);
    return initial;
  }
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// ----------------------------------------------------
// REST API Endpoints
// ----------------------------------------------------

// 1. Get all system data
app.get('/api/data', (req, res) => {
  const db = loadDatabase();
  res.json({
    success: true,
    ...db,
    serverTime: new Date().toISOString(),
  });
});

// 2. Clock-in
app.post('/api/clock-in', (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res.status(400).json({ success: false, message: '請提供員工編號' });
  }

  const db = loadDatabase();
  const employee = db.employees.find((e) => e.id === employeeId);
  if (!employee) {
    return res.status(404).json({ success: false, message: '找不到該員工資料' });
  }

  const now = new Date();
  const todayStr = formatDate(now);
  const nowTimeStr = formatTime(now);

  // Check if leave applied for today
  const isLeave = db.leaveRequests.some((l) => l.employee_id === employeeId && l.date === todayStr);
  if (isLeave) {
    return res.status(400).json({ success: false, message: `${employee.name} 今日已有請假紀錄，無法簽到。` });
  }

  // Check existing log
  const existingIndex = db.attendanceLogs.findIndex((l) => l.employee_id === employeeId && l.date === todayStr);
  if (existingIndex >= 0 && db.attendanceLogs[existingIndex].in_time) {
    return res.status(400).json({
      success: false,
      message: `${employee.name} 今日已於 ${db.attendanceLogs[existingIndex].in_time} 完成上班打卡！`,
    });
  }

  let updatedLog;
  if (existingIndex >= 0) {
    db.attendanceLogs[existingIndex].in_time = nowTimeStr;
    updatedLog = db.attendanceLogs[existingIndex];
  } else {
    updatedLog = {
      id: Date.now(),
      employee_id: employeeId,
      date: todayStr,
      in_time: nowTimeStr,
      out_time: null,
    };
    db.attendanceLogs.unshift(updatedLog);
  }

  saveDatabase(db);
  res.json({
    success: true,
    message: `【上班打卡成功】${employee.name} 已於 ${nowTimeStr} 簽到！`,
    log: updatedLog,
  });
});

// 3. Clock-out
app.post('/api/clock-out', (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res.status(400).json({ success: false, message: '請提供員工編號' });
  }

  const db = loadDatabase();
  const employee = db.employees.find((e) => e.id === employeeId);
  if (!employee) {
    return res.status(404).json({ success: false, message: '找不到該員工資料' });
  }

  const now = new Date();
  const todayStr = formatDate(now);
  const nowTimeStr = formatTime(now);

  const existingIndex = db.attendanceLogs.findIndex((l) => l.employee_id === employeeId && l.date === todayStr);
  if (existingIndex < 0 || !db.attendanceLogs[existingIndex].in_time) {
    return res.status(400).json({ success: false, message: '尚未進行今日上班打卡，無法執行下班打卡。' });
  }

  if (db.attendanceLogs[existingIndex].out_time) {
    return res.status(400).json({
      success: false,
      message: `${employee.name} 今日已於 ${db.attendanceLogs[existingIndex].out_time} 完成下班打卡！`,
    });
  }

  db.attendanceLogs[existingIndex].out_time = nowTimeStr;
  const updatedLog = db.attendanceLogs[existingIndex];

  saveDatabase(db);
  res.json({
    success: true,
    message: `【下班打卡成功】${employee.name} 已於 ${nowTimeStr} 簽退，當月工時已即時更新！`,
    log: updatedLog,
  });
});

// 4. Apply Leave
app.post('/api/leave', (req, res) => {
  const { employee_id, date, type, reason } = req.body;
  if (!employee_id || !date || !type) {
    return res.status(400).json({ success: false, message: '請填寫完整請假資訊' });
  }

  const db = loadDatabase();
  const employee = db.employees.find((e) => e.id === employee_id);
  const empName = employee ? employee.name : employee_id;

  const duplicate = db.leaveRequests.some((l) => l.employee_id === employee_id && l.date === date);
  if (duplicate) {
    return res.status(400).json({ success: false, message: `${empName} 於 ${date} 已有請假紀錄，請勿重複申請。` });
  }

  const newLeave = {
    id: Date.now(),
    employee_id,
    date,
    type,
    reason: reason || '',
  };

  db.leaveRequests.unshift(newLeave);
  saveDatabase(db);

  res.json({
    success: true,
    message: `【請假成功】已為 ${empName} 登記 ${date} (${type})`,
    leave: newLeave,
  });
});

// 5. Cancel Leave
app.delete('/api/leave/:id', (req, res) => {
  const leaveId = parseInt(req.params.id, 10);
  const db = loadDatabase();
  db.leaveRequests = db.leaveRequests.filter((l) => l.id !== leaveId);
  saveDatabase(db);
  res.json({ success: true, message: '已取消該請假紀錄' });
});

// 6. Save Schedule Override
app.post('/api/schedule-override', (req, res) => {
  const { employee_id, date, is_workday, start_time, end_time, note } = req.body;
  if (!employee_id || !date) {
    return res.status(400).json({ success: false, message: '請提供員工編號與日期' });
  }

  const db = loadDatabase();
  const existingIdx = db.scheduleOverrides.findIndex((o) => o.employee_id === employee_id && o.date === date);

  const overrideData = {
    id: existingIdx >= 0 ? db.scheduleOverrides[existingIdx].id : Date.now(),
    employee_id,
    date,
    is_workday: Boolean(is_workday),
    start_time: start_time || '09:00',
    end_time: end_time || '18:00',
    note: note || '',
  };

  if (existingIdx >= 0) {
    db.scheduleOverrides[existingIdx] = overrideData;
  } else {
    db.scheduleOverrides.push(overrideData);
  }

  saveDatabase(db);
  res.json({ success: true, message: '排班設定已儲存', override: overrideData });
});

// 7. Delete Schedule Override
app.delete('/api/schedule-override', (req, res) => {
  const { employee_id, date } = req.query as { employee_id: string; date: string };
  if (!employee_id || !date) {
    return res.status(400).json({ success: false, message: '缺少員工編號或日期' });
  }

  const db = loadDatabase();
  db.scheduleOverrides = db.scheduleOverrides.filter((o) => !(o.employee_id === employee_id && o.date === date));
  saveDatabase(db);
  res.json({ success: true, message: '已恢復為預設排班' });
});

// 8. Add Employee
app.post('/api/employees', (req, res) => {
  const { name, department, title } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: '請填寫員工姓名' });
  }

  const db = loadDatabase();
  const nextNum = db.employees.length + 1;
  const newId = `EMP-${String(nextNum).padStart(3, '0')}`;

  const newEmp = {
    id: newId,
    name: name.trim(),
    department: department?.trim() || '未分配部門',
    title: title?.trim() || '專員',
  };

  db.employees.push(newEmp);
  saveDatabase(db);
  res.json({ success: true, message: `已成功新增員工：${newEmp.name} (${newEmp.id})`, employee: newEmp });
});

// 9. Delete Employee
app.delete('/api/employees/:id', (req, res) => {
  const empId = req.params.id;
  const db = loadDatabase();
  const emp = db.employees.find((e) => e.id === empId);
  if (!emp) {
    return res.status(404).json({ success: false, message: '找不到該員工' });
  }

  db.employees = db.employees.filter((e) => e.id !== empId);
  db.attendanceLogs = db.attendanceLogs.filter((l) => l.employee_id !== empId);
  db.leaveRequests = db.leaveRequests.filter((l) => l.employee_id !== empId);
  db.scheduleOverrides = db.scheduleOverrides.filter((o) => o.employee_id !== empId);

  saveDatabase(db);
  res.json({ success: true, message: `已刪除員工：${emp.name}` });
});

// 10. Reset Data
app.post('/api/reset', (req, res) => {
  const initial = getInitialData();
  saveDatabase(initial);
  res.json({ success: true, message: '資料已成功重設為初始狀態', ...initial });
});

// 11. Server info & local IPs
app.get('/api/server-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  res.json({
    hostname: os.hostname(),
    port: PORT,
    localIps: ips,
  });
});

// ----------------------------------------------------
// Serve Built Frontend Static Files (SPA)
// ----------------------------------------------------
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ----------------------------------------------------
// Start Server and Print Access URLs
// ----------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  const localIps: string[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        localIps.push(net.address);
      }
    }
  }

  console.log('====================================================');
  console.log('🚀 出勤管理系統伺服器已成功啟動！');
  console.log('----------------------------------------------------');
  console.log(`💻 本機連線網址: http://localhost:${PORT}`);
  console.log('');
  console.log('📱 區域網路內其他裝置（手機/平板/其他電腦）請使用以下網址連線：');
  if (localIps.length > 0) {
    localIps.forEach((ip) => {
      console.log(`   👉 http://${ip}:${PORT}`);
    });
  } else {
    console.log(`   👉 http://<您的電腦區網IP>:${PORT}`);
  }
  console.log('====================================================');
});
