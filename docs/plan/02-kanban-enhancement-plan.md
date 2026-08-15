# 02 - 專案看板進階功能增強計畫 (Kanban Enhancement Plan)

## 1. 痛點分析與目標
目前看板透過卡片上的左右箭頭按鈕切換狀態，雖能滿足基礎流轉，但對於多任務協作場景，使用者期望具備更直覺的視覺化拖曳、任務內部分解（子待辦事項）與時間進度統計。

---

## 2. 核心功能規劃

### 2.1 視覺化拖曳流轉 (Drag & Drop Interface)
- **技術方案**：引入 `@dnd-kit/core` 與 `@dnd-kit/sortable`，或基於 Motion 的 `motion.div drag` 手勢控制。
- **支援特性**：
  - 同一欄位內卡片上下優先順序排序。
  - 跨欄位拖曳自動更新 `task.status`，並觸發後端 `PUT /api/kanban/tasks/:id` 樂觀更新。
  - 拖曳過程具備柔和半透明陰影與傾斜動效。

### 2.2 任務卡片子清單 (Checklist / Subtasks)
- **資料結構擴充**：
```typescript
export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

// 擴充 KanbanTask
export interface KanbanTask {
  // ...現有欄位
  checklist?: SubTask[];
}
```
- **UI 呈現**：
  - 卡片預覽顯示進度條（如 `3/5 60%`）。
  - 編輯彈窗內可動態新增/勾選/刪除子任務。

### 2.3 任務備註與活動紀錄 (Comments & Activity Log)
- 支援指派成員在任務卡片內留下工作備忘或進度回報，保留時間戳記與發言同仁名稱。

### 2.4 工時燃盡與統計圖表 (Burndown Chart)
- 在看板頂部新增「統計檢視」按鈕，展開折線圖呈現：
  - 總預估工時 vs 實際完成工時。
  - 各同仁當前承接任務數量與負載水位。
