# 04 - 後端 RESTful API 規格手冊 (API Reference)

> 伺服器預設埠號：`http://localhost:3000` (或區網 IP:3000)  
> 資料格式：JSON (`Content-Type: application/json`)

---

## 1. 系統全域資料與連線資訊

### 1.1 取得全系統資料
- **Endpoint**: `GET /api/data`
- **說明**: 取得全系統所有員工、打卡明細、請假單、排班覆蓋與看板任務。
- **Response**:
```json
{
  "success": true,
  "employees": [...],
  "attendanceLogs": [...],
  "leaveRequests": [...],
  "scheduleOverrides": [...],
  "kanbanTasks": [...],
  "serverTime": "2026-08-15T16:35:10.000Z"
}
```

### 1.2 取得伺服器主機與區域網路 IP
- **Endpoint**: `GET /api/server-info`
- **說明**: 取得本機 Hostname 與所有對外可用之 IPv4 區域網路 IP。
- **Response**:
```json
{
  "hostname": "MY-PC",
  "port": 3000,
  "localIps": ["192.168.1.105"]
}
```

### 1.3 重設資料庫為初始種子資料
- **Endpoint**: `POST /api/reset`
- **說明**: 清除 `data/db.json` 並還原為 `initialData.ts` 預設值。

---

## 2. 出勤打卡模組

### 2.1 上班簽到
- **Endpoint**: `POST /api/clock-in`
- **Request Body**:
```json
{
  "employeeId": "EMP-001"
}
```
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "【上班打卡成功】林家緯 已於 09:02:15 簽到！",
  "log": {
    "id": 1718000000000,
    "employee_id": "EMP-001",
    "date": "2026-08-15",
    "in_time": "09:02:15",
    "out_time": null
  }
}
```

### 2.2 下班簽退
- **Endpoint**: `POST /api/clock-out`
- **Request Body**:
```json
{
  "employeeId": "EMP-001"
}
```
- **Success Response (200)**:
```json
{
  "success": true,
  "message": "【下班打卡成功】林家緯 已於 18:05:30 簽退，當月工時已即時更新！",
  "log": { ... }
}
```

---

## 3. 請假與排班管理模組

### 3.1 申請請假
- **Endpoint**: `POST /api/leave`
- **Request Body**:
```json
{
  "employee_id": "EMP-001",
  "date": "2026-08-20",
  "type": "特休",
  "reason": "返鄉探親"
}
```

### 3.2 取消請假單
- **Endpoint**: `DELETE /api/leave/:id`
- **Path Parameter**: `id` (請假單 ID)

### 3.3 設定個別日期排班覆蓋
- **Endpoint**: `POST /api/schedule-override`
- **Request Body**:
```json
{
  "employee_id": "EMP-001",
  "date": "2026-08-22",
  "is_workday": true,
  "start_time": "10:00",
  "end_time": "17:00",
  "note": "專案假日值班"
}
```

### 3.4 清除排班覆蓋 (恢復預設排班)
- **Endpoint**: `DELETE /api/schedule-override?employee_id=EMP-001&date=2026-08-22`

---

## 4. 員工名冊管理模組

### 4.1 新增員工
- **Endpoint**: `POST /api/employees`
- **Request Body**:
```json
{
  "name": "陳小美",
  "department": "產品設計部",
  "title": "UI/UX 設計師"
}
```

### 4.2 刪除員工 (級聯清理)
- **Endpoint**: `DELETE /api/employees/:id`
- **Path Parameter**: `id` (員工編號，例如 `EMP-005`)

---

## 5. 專案看板任務模組

### 5.1 取得看板任務清單
- **Endpoint**: `GET /api/kanban/tasks`

### 5.2 建立看板任務
- **Endpoint**: `POST /api/kanban/tasks`
- **Request Body**:
```json
{
  "title": "完成區網手機打卡測試",
  "description": "測試 iPhone 與 Android 裝置於同區網下的操作流暢度",
  "status": "todo",
  "priority": "high",
  "assigneeId": "EMP-001",
  "dueDate": "2026-08-20",
  "tags": ["QA", "Mobile"],
  "estimatedHours": 4
}
```

### 5.3 更新看板任務 (狀態流轉/內容修改)
- **Endpoint**: `PUT /api/kanban/tasks/:id`
- **Request Body**: `Partial<KanbanTask>` (例如 `{ "status": "in_progress" }`)

### 5.4 刪除看板任務
- **Endpoint**: `DELETE /api/kanban/tasks/:id`
- **Path Parameter**: `id` (任務 ID，例如 `TASK-1234`)
