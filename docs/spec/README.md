# 出勤管理與專案看板系統 — 規格文件庫 (Specifications)

> 本目錄彙整 **出勤管理與專案看板系統 (Attendance & Project Kanban System)** 之全系統規格文件。所有章節依據功能領域模組化拆分，提供工程團隊、產品經理與 AI Agent 作為開發、擴充、測試與維護之最高基準。

---

## 規格章節導覽 (Table of Contents)

| 章節編號 | 文件名稱 | 核心內容說明 | 適用對象 |
| :---: | :--- | :--- | :--- |
| **01** | [01-system-overview.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/spec/01-system-overview.md) | **系統全景與架構規格**<br>專案願景、技術棧選型、系統架構拓撲、區域網路 (LAN) 多裝置連線與啟動流程 | 全端工程師、DevOps |
| **02** | [02-data-models.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/spec/02-data-models.md) | **資料模型與資料庫綱要規格**<br>員工、打卡紀錄、請假、彈性排班覆蓋、看板任務之 TypeScript 介面與 `data/db.json` 結構 | 前端/後端工程師 |
| **03** | [03-business-rules.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/spec/03-business-rules.md) | **核心商業邏輯與工時演算法**<br>午休 1 小時自動扣除機制、排班覆蓋最高優先級、動態累計至今日之應出勤工時算法 | 演算法/業務邏輯開發 |
| **04** | [04-api-reference.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/spec/04-api-reference.md) | **後端 RESTful API 規格手冊**<br>所有 HTTP 端點、URL 路由、請求參數 (Request Body/Query)、回傳狀態碼與範例 JSON | API 串接與測試 |
| **05** | [05-kanban-module.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/spec/05-kanban-module.md) | **敏捷專案任務看板模組規格**<br>四欄式狀態流轉、任務卡片解構、員工名冊指派連動、到期逾期判定與多維度篩選 | 產品/看板功能開發 |
| **06** | [06-ui-ux-design.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/spec/06-ui-ux-design.md) | **視覺設計系統與 UI/UX 規範**<br>莫蘭迪大地色票 (Morandi Warm Earth)、排版階層、組件解構、微互動動效與響應式斷點 | UI/UX 設計師、前端開發 |

---

## 規格維護原則
1. **單一事實來源 (Single Source of Truth)**：任何功能變更或欄位擴充，必須同步更新此處對應的規格章節。
2. **型別一致性**：代碼中的 [types.ts](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/src/types.ts) 與後端驗證必須嚴格符合 [02-data-models.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/spec/02-data-models.md)。
3. **演算法集中化**：所有工時運算必須以 [03-business-rules.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/spec/03-business-rules.md) 規範之純函式實作，嚴禁在視圖層散落獨立公式。

---

## 相關規劃章節
- 未來版本迭代與產品功能規劃請參閱 [docs/plan/README.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/plan/README.md)。

