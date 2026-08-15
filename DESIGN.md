# DESIGN.md - 視覺設計系統與 UI/UX 規範手冊

> 本文件定義 **出勤管理與專案看板系統** 的視覺設計語言、色票系統、排版層級、組件解構規範與動效指引。旨在維持全系統在桌面端與行動裝置上的美學一致性、舒適度與專業體驗。

---

## 1. 設計哲學 (Design Philosophy)

本系統採用 **莫蘭迪大地自然極簡風格 (Morandi Earth-Tone Warm Minimalism)** 作為核心視覺基調：

1. **視覺減壓與自然舒適 (Ergonomic Calm)**：
   - 告別傳統後台高對比的冷硬灰白與刺眼飽和色，採用低飽和度、溫暖質感的亞麻色、鼠尾草綠與陶土磚紅，營造安靜、放鬆且專注的工作氛圍。
2. **資訊層次清晰 (Information Architecture)**：
   - 透過細緻的邊框線條 (`#E5E0D8`)、柔和背景卡片 (`#FAFAF7`) 與微陰影 (`shadow-sm`)，創造清晰而不繁雜的視圖分層。
3. **直覺反饋與微互動 (Subtle Micro-interactions)**：
   - 搭配 Motion 平滑過場動畫，打卡按鈕、看板卡片移動與狀態切換均具備即時的視覺反饋。

---

## 2. 色彩系統 (Color Palette & Tokens)

### 2.1 核心品牌與背景色 (Core Tokens)

| 色彩變數名稱 | Hex 代碼 | 預覽色彩 | 應用場景 |
| :--- | :--- | :---: | :--- |
| **Canvas Background** | `#F7F6F2` | ![#F7F6F2](https://via.placeholder.com/15/F7F6F2/000000?text=+) | 全域畫布底色（暖米白/亞麻紙感） |
| **Surface Card** | `#FAFAF7` | ![#FAFAF7](https://via.placeholder.com/15/FAFAF7/000000?text=+) | 次級卡片背景色 |
| **Card Highlight** | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/15/FFFFFF/000000?text=+) | 主卡片底色、輸入框背景、選取中按鈕 |
| **Border Neutral** | `#E5E0D8` | ![#E5E0D8](https://via.placeholder.com/15/E5E0D8/000000?text=+) | 預設邊框線、分割線、卡片輪廓 |
| **Border Accent** | `#DDBEA9` | ![#DDBEA9](https://via.placeholder.com/15/DDBEA9/000000?text=+) | 焦點外框、次要強調邊框 |
| **Primary Brand (Sage)** | `#6B705C` | ![#6B705C](https://via.placeholder.com/15/6B705C/000000?text=+) | 系統主色、主要按鈕、選中狀態、出勤完成標籤 |
| **Secondary Muted** | `#A5A58D` | ![#A5A58D](https://via.placeholder.com/15/A5A58D/000000?text=+) | 次要圖示、次級輔助資訊、未選中狀態 |
| **Dark Neutral (Text)** | `#4A4941` | ![#4A4941](https://via.placeholder.com/15/4A4941/000000?text=+) | 主要標題、正文字體、深色文字強調 |
| **Accent Terracotta** | `#CB997E` | ![#CB997E](https://via.placeholder.com/15/CB997E/000000?text=+) | 暖色強調、請假按鈕、警示引導 |
| **Light Warm Accent** | `#FFE8D6` | ![#FFE8D6](https://via.placeholder.com/15/FFE8D6/000000?text=+) | 暖色徽章背景、高亮提示底色 |

---

### 2.2 狀態語義色彩 (Semantic Status Colors)

| 狀態類型 | 前景色 (Text) | 背景色 (Badge / Pill) | 邊框色 (Border) | 應用場景 |
| :--- | :--- | :--- | :--- | :--- |
| **正常 / 已完成 / 準時出勤** | `#6B705C` (Sage) | `bg-[#6B705C]/10` | `border-[#6B705C]/30` | 上班打卡完成、看板 Done 狀態、工時正結餘 |
| **進行中 / 審查中 / 當前工作中** | `#2563EB` (Ocean Blue) | `bg-blue-50` | `border-blue-200` | 打卡工作中 (簽到未簽退)、看板 In Progress |
| **排休 / 休息日 / 待處理** | `#D97706` (Amber Warm) | `bg-amber-50` | `border-amber-200` | 週末/自訂排休、看板 To Do 狀態 |
| **請假 / 事病特假** | `#C2410C` (Terracotta) | `bg-orange-50` | `border-orange-200` | 員工核准請假狀態 |
| **缺勤 / 異常 / 緊急任務** | `#E11D48` (Rose Red) | `bg-rose-50` | `border-rose-200` | 過去工作日未打卡缺勤、看板 Urgent 優先級 |

---

## 3. 字體排印與層級規範 (Typography System)

### 3.1 字體家族
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
```

### 3.2 階層級別 (Type Hierarchy)

| 層級名稱 | 尺寸 (Tailwind Class) | 字重 (Weight) | 顏色變數 | 應用實例 |
| :--- | :--- | :--- | :--- | :--- |
| **Display / 時鐘** | `text-4xl` ~ `text-5xl` | `font-mono font-extrabold` | `#4A4941` | 首頁實時時間時鐘數字 (`16:35:10`) |
| **Page Title (H1)** | `text-2xl` ~ `text-3xl` | `font-bold` | `#4A4941` | 頁面主標題、儀表板模組大標 |
| **Section Title (H2)**| `text-lg` ~ `text-xl` | `font-semibold` | `#4A4941` | 卡片標題、看板欄位名稱、彈窗標題 |
| **Subsection (H3)** | `text-base` | `font-medium` | `#4A4941` | 任務卡片標題、工時統計數值 |
| **Body (正文)** | `text-sm` (14px) | `font-normal` | `#4A4941` | 表格內容、任務描述、表單文字 |
| **Caption (輔助字)** | `text-xs` (12px) | `font-medium` | `#7F7D74` / `#A5A58D` | 標籤、時間戳記、工時小計、備註提示 |

---

## 4. 核心組件設計規範 (Component Specifications)

### 4.1 頂部導航列 (Navbar)
- **結構**：毛玻璃背景 (`backdrop-blur-md bg-[#F7F6F2]/90`)、底部分割線 (`border-[#E5E0D8]`)。
- **視圖切換器 (Tab Switcher)**：
  - 膠囊型容器 (`bg-[#EBE7DF] p-1 rounded-xl`)。
  - 選中態為白色實心卡片 (`bg-white shadow-sm text-[#4A4941] font-semibold`)。
  - 三種模式切換：`員工出勤`、`管理後台`、`專案看板`。
- **成員快速切換下拉選單**：支援即時切換當前打卡/操作員工身分，右側配有區網連線指示按鈕。

### 4.2 打卡核心儀表板 (Clocking Hub)
- **實時時鐘卡片**：
  - 巨大等寬字型 (`font-mono`) 呈現時分秒。
  - 具備今日日期、星期幾徽章與目前出勤狀態標籤（未簽到 / 工作中 / 今日已結算）。
- **雙主操作按鈕**：
  - **上班打卡按鈕**：莫蘭迪綠色主題 (`bg-[#6B705C] hover:bg-[#585D4B] text-white`)，未打卡時高亮脈動，已打卡後呈現打勾停用狀態。
  - **下班打卡按鈕**：暖沙陶土色主題 (`bg-[#CB997E] hover:bg-[#B7886F] text-white`)，簽到後解鎖點擊，完成後顯示已簽退時間。

### 4.3 工時月報摘要卡 (Monthly Stats Card)
- **3 欄網格佈局**：
  1. **應出勤進度**：應出勤天數 / 應出勤時數（計算至今日）。
  2. **實際已出勤**：累計出勤天數 / 累計工時。
  3. **工時差額結餘 (Balance)**：
     - 正數（加班/盈餘）：綠色徽章 (`+X.XX 小時`)。
     - 負數（欠工時）：紅色徽章 (`-X.XX 小時`)。
     - 平衡：灰棕色徽章 (`0.00 小時`)。

### 4.4 專案任務看板 (Kanban Board)
- **四欄結構**：
  1. 待處理 (To Do)
  2. 進行中 (In Progress)
  3. 審查中 (Review)
  4. 已完成 (Done)
- **任務卡片 (Task Card Anatomy)**：
  - **頂部**：優先級 Badge（`緊急` / `高` / `中` / `低`）與狀態左右快移按鈕。
  - **中部**：任務標題（粗體）與詳細說明節錄（最多 2 行截斷）。
  - **底部屬性列**：
    - 到期日標籤（若已逾期自動套用紅色警示醒目提示）。
    - 指派同仁 Avatar 與姓名（連動系統員工名冊）。
    - 預估工時 (`Xh`) 與自訂分類 Tag 膠囊。
  - **操作微互動**：懸浮時卡片微幅上浮 (`hover:-translate-y-0.5 hover:shadow-md`)。

### 4.5 彈窗系統 (Modals)
- **遮罩層**：半透明黑灰色佐以毛玻璃模糊 (`bg-black/30 backdrop-blur-sm`)。
- **內容容器**：白底暖灰邊框 (`bg-white rounded-2xl border border-[#E5E0D8] shadow-xl`)。
- **動畫**：Motion 縮放淡入淡出 (`scale: 0.95 -> 1.0`, `opacity: 0 -> 1`)。

---

## 5. 多裝置與響應式適配 (Responsive Strategy)

| 視口斷點 (Breakpoint) | 寬度區間 | 版面佈局策略 |
| :--- | :--- | :--- |
| **Mobile (行動裝置)** | `< 768px` (`< md`) | 單欄垂直堆疊、看板支援水平左右滑動、點擊目標加大至最小 44px 高度 |
| **Tablet (平板裝置)** | `768px ~ 1024px` | 兩欄網格、導航欄摺疊選單、彈窗寬度自動填滿 90vw |
| **Desktop (桌面寬螢幕)** | `> 1024px` (`>= lg`) | 四欄並排看板、全展開統計表格、固定置中大版面 (Max width 1400px) |

---

## 6. 動畫與轉場規範 (Motion Guidelines)

1. **頁面視圖切換**：
   ```tsx
   <motion.div
     initial={{ opacity: 0, y: 8 }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: -8 }}
     transition={{ duration: 0.2 }}
   />
   ```
2. **微互動懸浮效果**：
   - 交互按鈕：`transition-all duration-200 active:scale-95`
   - 卡片互動：`transition-shadow hover:shadow-md`
3. **吐司訊息 (Toast)**：
   - 右下角滑入 (`x: 20 -> 0`)，持續 3.5 秒自動淡出消失。
