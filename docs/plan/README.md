# 出勤管理與專案看板系統 — 開發計畫庫 (Development Plans)

> 本目錄彙整 **出勤管理與專案看板系統 (Attendance & Project Kanban System)** 之未來迭代規劃、功能增強計畫與架構演進路線圖。供開發團隊、專案負責人與 AI Agent 依循進行下一階段之衝刺開發。

---

## 計畫章節導覽 (Table of Contents)

| 章節編號 | 計畫文件名稱 | 核心規劃範疇 | 預計目標版本 |
| :---: | :--- | :--- | :---: |
| **01** | [01-roadmap.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/plan/01-roadmap.md) | **全期產品發展路線圖 (Product Roadmap)**<br>從 V1.0 現行版本至 V2.0 企業級系統之三階段演進藍圖與里程碑指標 | `v1.0` ~ `v2.0` |
| **02** | [02-kanban-enhancement-plan.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/plan/02-kanban-enhancement-plan.md) | **專案看板進階功能增強計畫**<br>視覺化拖曳流轉 (DnD)、任務子待辦清單 (Checklist)、留言評論與工時燃盡分析圖表 | `v1.1` ~ `v1.2` |
| **03** | [03-attendance-export-plan.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/plan/03-attendance-export-plan.md) | **出勤報表匯出與進階請假審批計畫**<br>當月工時 Excel/CSV 匯出、特休/事假額度管理、請假多階審批工作流與補打卡機制 | `v1.2` ~ `v1.3` |
| **04** | [04-security-and-auth-plan.md](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/plan/04-security-and-auth-plan.md) | **帳號認證與多角色權限 (RBAC) 升級計畫**<br>JWT 登入認證、管理員/部門主管/員工多角色隔離、密碼雜湊防護與操作稽核紀錄 | `v1.5` ~ `v2.0` |

---

## 規劃與執行原則
1. **漸進增強 (Progressive Enhancement)**：所有新計畫必須基於現有 `data/db.json` 與 React 19 架構平滑相容，避免破壞現行出勤打卡與看板核心功能。
2. **規格先行 (Spec-First Approach)**：在實作任何計畫項目前，應先更新 [docs/spec/](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/docs/spec/README.md) 對應的資料模型或 API 規格章節。
3. **驗證與品質保證**：每次計畫落地需確保全系統通過 `npm run lint` 與 `npm run build`，並確保區網多裝置相容性。
