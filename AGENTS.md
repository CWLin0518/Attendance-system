# AGENTS.md - 專案開發與 AI Agent 協同規範手冊

> 本文件為 **出勤管理與專案看板系統 (Attendance & Project Kanban System)** 的核心架構與開發指引。完整分章規格文件請查閱 [docs/spec/README.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/spec/README.md)。所有參與維護、擴充或重構之工程師與 AI Agent 均應遵循本文檔所規範之架構原則、業務邏輯、型別定義與程式碼風格。

---

## 1. 專案願景與核心功能

本專案為一套結合 **企業出勤打卡、彈性排班統計、請假管理** 與 **敏捷專案看板 (Kanban Board)** 的現代化全端 Web 應用系統。

### 核心功能模組
1. **員工出勤打卡系統 (Employee Attendance)**
   - 即時時間顯示、智慧上班打卡 / 下班打卡狀態機控制。
   - 當月出勤工時統計（應出勤天數/時數 vs 實際出勤天數/時數、工時盈虧計算）。
   - 請假申請與當月出勤明細流水表。
2. **管理後台與彈性排班 (Admin Management & Roster Overrides)**
   - 全體員工今日出勤總覽儀表板（今日打卡、請假、異常/缺勤即時彙整）。
   - 員工自訂排班行事曆（可覆蓋個別日期為排休、需出勤、自訂起訖工時與備註）。
   - 員工資料庫 CRUD（新增/刪除員工，並自動級聯清理關聯出勤/請假/排班紀錄）。
   - 請假單審查與註銷管理。
3. **專案任務看板 (Project Kanban Board)**
   - 四欄式敏捷狀態流轉：待處理 (`todo`)、進行中 (`in_progress`)、審查中 (`review`)、已完成 (`done`)。
   - 任務卡片屬性：標題、描述、優先級（緊急/高/中/低）、到期日（含逾期警示）、指派同仁（連動員工資料庫）、自訂標籤、預估工時。
   - 多維度篩選與搜尋（關鍵字、指派成員、優先級、標籤過濾）。
4. **多裝置區域網路連線與資料持久化 (LAN Multi-Device & JSON DB)**
   - 後端內建區域網路 IP 自動偵測，支援同一 Wi-Fi/區網內手機、平板掃碼或輸入 IP 即時打卡。
   - 輕量化 JSON 本地資料持久化 (`data/db.json`)，無須額外安裝龐大資料庫即可開箱即用。

---

## 2. 技術棧 (Technology Stack)

| 領域 | 技術 / 套件 | 說明 |
| :--- | :--- | :--- |
| **前端框架** | React 19 (`react`, `react-dom`) | 現代化組件與 Hook 狀態管理 |
| **程式語言** | TypeScript 5.8 | 全端嚴格型別定義與靜態檢查 |
| **建置工具** | Vite 6 | 極速熱重載開發伺服器與生產打包 |
| **樣式系統** | Tailwind CSS v4 (`@tailwindcss/vite`) | 現代原子化 CSS 與語義化自訂設計變數 |
| **動畫系統** | Motion (`motion/react` v12) | 流暢視圖切換與微互動過場效果 |
| **圖示庫** | Lucide React (`lucide-react`) | 現代化簡約線性圖示 |
| **後端伺服器** | Node.js + Express 4 (`tsx` 執行引擎) | RESTful API 路由與 SPA 靜態檔案託管 |
| **資料儲存** | JSON 本地檔案持久化 (`data/db.json`) | 自動備份、重設種子資料與原子讀寫 |

---

## 3. 系統架構與目錄結構

```text
Attendance-system/
├── data/
│   └── db.json                  # JSON 資料庫持久化檔案（自動生成/維護）
├── src/
│   ├── components/              # UI 組件層
│   │   ├── AdminView.tsx        # 管理員後台儀表板與排班行事曆
│   │   ├── EmployeeManageModal.tsx # 員工名冊管理彈窗 (新增/刪除)
│   │   ├── EmployeeView.tsx     # 員工打卡主介面與個人工時月報
│   │   ├── KanbanView.tsx       # 專案任務看板主畫面
│   │   ├── LeaveModal.tsx       # 請假申請彈窗
│   │   ├── Navbar.tsx           # 頂部導航列 (視圖切換、成員選取、區網連線)
│   │   ├── ScheduleOverrideModal.tsx # 個別日期排班自訂彈窗
│   │   ├── SchemaReferenceModal.tsx  # 系統架構與工時計算規格說明彈窗
│   │   ├── ServerInfoModal.tsx  # 區網連線資訊與 IP 提示彈窗
│   │   ├── TaskModal.tsx        # 任務新增/編輯彈窗
│   │   └── ToastContainer.tsx   # 全域吐司通知提示組件
│   ├── context/
│   │   └── AttendanceContext.tsx # 全域狀態管理 (出勤、排班、任務、API 連動)
│   ├── data/
│   │   └── initialData.ts       # 系統預設初始種子資料 (Initial Seeds)
│   ├── utils/
│   │   └── timeCalculations.ts  # 工時計算、午休扣除、排班合併核心純函式
│   ├── App.tsx                  # 應用主入口與視圖動態切換
│   ├── index.css                # Tailwind 核心樣式與全域風格設定
│   ├── main.tsx                 # React DOM 渲染入口
│   └── types.ts                 # 全系統 TypeScript 核心型別定義
├── server.ts                    # Express 後端 API 伺服器與靜態檔託管
├── start-server.bat             # Windows 一鍵啟動腳本 (Build + Run)
├── package.json                 # 依賴套件與執行指令定義
├── tsconfig.json                # TypeScript 編譯配置
├── vite.config.ts               # Vite 打包配置 (含 Tailwind 整合)
├── AGENTS.md                    # 本專案開發與 AI 協同規格
└── DESIGN.md                    # 視覺設計系統與 UI/UX 規範
```

---

## 4. 資料模型與核心型別 (Data Schema)

參見 [types.ts](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/src/types.ts)：

### 1. 員工模型 (`Employee`)
```typescript
export interface Employee {
  id: string;          // 員工編號，例如 "EMP-001"
  name: string;        // 員工姓名
  department?: string; // 所屬部門
  title?: string;      // 職稱
}
```

### 2. 打卡紀錄 (`AttendanceLog`)
```typescript
export interface AttendanceLog {
  id: number;
  employee_id: string;
  date: string;        // 格式 YYYY-MM-DD
  in_time: string | null;  // 格式 HH:mm:ss 或 HH:mm
  out_time: string | null; // 格式 HH:mm:ss 或 HH:mm
}
```

### 3. 請假紀錄 (`LeaveRequest`)
```typescript
export type LeaveType = '事假' | '病假' | '特休' | '公假';

export interface LeaveRequest {
  id: number;
  employee_id: string;
  date: string;        // 格式 YYYY-MM-DD
  type: LeaveType;
  reason?: string;
}
```

### 4. 彈性排班覆蓋 (`ScheduleOverride`)
```typescript
export interface ScheduleOverride {
  id: number;
  employee_id: string;
  date: string;        // 格式 YYYY-MM-DD
  is_workday: boolean; // true: 需出勤, false: 排休
  start_time: string;  // 格式 HH:mm (例如 "09:00")
  end_time: string;    // 格式 HH:mm (例如 "18:00")
  note?: string;       // 備註說明
}
```

### 5. 專案看板任務 (`KanbanTask`)
```typescript
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface KanbanTask {
  id: string;          // 格式 TASK-XXXX
  title: string;       // 任務名稱
  description?: string;// 詳細說明
  status: TaskStatus;  // 任務狀態
  priority: TaskPriority; // 優先級
  assigneeId?: string; // 關聯 Employee.id
  dueDate?: string;    // 到期日 YYYY-MM-DD
  tags?: string[];     // 分類標籤
  estimatedHours?: number; // 預估工時
  createdAt: string;   // ISO 時間字串
  updatedAt: string;   // ISO 時間字串
}
```

---

## 5. 核心商業邏輯與演算法規範

所有工時相關演算法必須集中於 [timeCalculations.ts](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/src/utils/timeCalculations.ts)，嚴禁在組件內撰寫重複或歧異的計算邏輯：

1. **午休自動扣除機制 (`calculateDurationHours`)**
   - 跨度計算：若工時區間（`endTime` - `startTime`）**大於 4 小時**，系統自動扣除 **1 小時** 午休時間。
   - 範例：`09:00 ~ 18:00` 跨度 9 小時 $\rightarrow$ 扣除 1 小時，計為 **8.00 小時**。
2. **排班優先級判定 (`getDaySchedule`)**
   - **最高優先級**：個別排班覆蓋 (`ScheduleOverride`)。若有設定，完全以覆蓋之 `is_workday` 與自訂起訖時間為準。
   - **預設規則**：週一至週五為工作日 (09:00 ~ 18:00，8小時)；週六與週日為休息日。
   - **請假豁免**：若當日有核准之請假 (`LeaveRequest`)，該日應出勤時數計為 0，且狀態標記為 `leave`。
3. **當月應出勤與工時結算 (`calculateMonthlyStats`)**
   - **動態累計規則**：當月應出勤時數僅累計至 **今天 (Today)** 為止的工作日（未來日期不計入應出勤分母），避免月初產生不合理的大額負時數。
   - **盈虧計算公式**：`balanceHours = actualHours - requiredHours`（正值代表加班時數盈餘，負值代表工時欠缺）。

---

## 6. 後端 RESTful API 規格

後端伺服器運行於 `server.ts`，提供以下端點：

| HTTP Method | API Path | 說明 | Request Body / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/data` | 取得全系統資料（員工、打卡、請假、排班、看板任務） | 無 |
| `POST` | `/api/clock-in` | 上班打卡 | `{ employeeId: string }` |
| `POST` | `/api/clock-out` | 下班打卡 | `{ employeeId: string }` |
| `POST` | `/api/leave` | 申請請假 | `{ employee_id, date, type, reason }` |
| `DELETE`| `/api/leave/:id` | 取消請假 | 無 (URL 帶 ID) |
| `POST` | `/api/schedule-override` | 新增/更新個別日期排班 | `{ employee_id, date, is_workday, start_time, end_time, note }` |
| `DELETE`| `/api/schedule-override` | 清除排班覆蓋 (恢復預設) | `?employee_id=...&date=...` |
| `POST` | `/api/employees` | 新增員工 | `{ name, department, title }` |
| `DELETE`| `/api/employees/:id` | 刪除員工（級聯刪除關聯資料） | 無 (URL 帶 ID) |
| `GET` | `/api/kanban/tasks` | 取得所有看板任務 | 無 |
| `POST` | `/api/kanban/tasks` | 建立新任務 | `{ title, description, status, priority, assigneeId, dueDate, tags, estimatedHours }` |
| `PUT` | `/api/kanban/tasks/:id` | 更新任務內容或狀態 | Task Partial Payload |
| `DELETE`| `/api/kanban/tasks/:id` | 刪除任務 | 無 (URL 帶 ID) |
| `POST` | `/api/reset` | 重設資料庫為初始預設值 | 無 |
| `GET` | `/api/server-info` | 取得伺服器主機名稱與區域網路 IP 清單 | 無 |

---

## 7. 開發與部署操作指令

```bash
# 1. 啟動前端熱重載開發伺服器 (Port 3000)
npm run dev

# 2. 啟動後端 Express API 伺服器 (Port 3000)
npm run server

# 3. 建置前端生產版本
npm run build

# 4. 一鍵生產打包並啟動整合伺服器 (前端 SPA + 後端 API)
npm run start

# 5. 執行 TypeScript 型別檢查
npm run lint

# 6. Windows 環境下一鍵啟動服務（雙擊或執行）
start-server.bat
```

---

## 8. AI Agent 開發守則與協同規範

1. **嚴格保持型別安全**：所有新功能或修改均不得使用 `any`，必須在 [types.ts](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/src/types.ts) 中定義完整介面。
2. **原子化與樂觀更新 (Optimistic UI)**：在 [AttendanceContext.tsx](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/src/context/AttendanceContext.tsx) 中進行資料修改時，優先確保 UI 即時反饋，並同步透過 API 持久化至後端。
3. **保持莫蘭迪暖色系視覺一致性**：嚴格遵循 [DESIGN.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/DESIGN.md) 規範之色階與組件樣式，嚴禁隨意使用未定義之鮮豔刺眼色系。
4. **功能擴充後的驗證流程**：修改程式碼後，必須執行 `npm run build` 與 `npm run lint` 確保無編譯或型別錯誤。
