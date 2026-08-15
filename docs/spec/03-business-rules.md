# 03 - 核心商業邏輯與工時演算法規格 (Business Rules & Algorithms)

> 本規格詳細定義出勤工時計算、午休扣除規則、排班覆蓋階層與月報工時結算之標準演算法。所有函式實作集中於 [src/utils/timeCalculations.ts](file:///c:/Users/CHIA%20WEI%20LIN/Desktop/出勤系統測試/Attendance-system/src/utils/timeCalculations.ts)。

---

## 1. 午休自動扣除機制 (`calculateDurationHours`)

### 1.1 業務規則
- 任何工作時間區間（無論是預定排班時段或是實際打卡時段），其跨度時長（$\text{Duration} = \text{EndTime} - \text{StartTime}$）：
  - 若 **跨度時長 $> 4.0$ 小時**：系統判定包含午休時間，**自動扣除 1.0 小時**。
  - 若 **跨度時長 $\le 4.0$ 小時**：系統判定為半天班或短時工時，**不扣除午休**（直接按實際分鐘數換算小時）。

### 1.2 計算公式
$$\text{CalculatedHours} = \begin{cases} 
\max(0, \text{RawHours} - 1.0), & \text{if } \text{RawHours} > 4.0 \\
\text{RawHours}, & \text{if } \text{RawHours} \le 4.0 
\end{cases}$$

### 1.3 範例對照表
| 起訖時間區間 | 原始跨度 (Raw Hours) | 午休扣除 (Lunch Break) | 系統計算工時 (Result) | 說明 |
| :--- | :---: | :---: | :---: | :--- |
| `09:00 ~ 18:00` | 9.00 小時 | 扣除 1.00 小時 | **8.00 小時** | 標準全日班 |
| `09:00 ~ 13:00` | 4.00 小時 | 不扣除 (0 小時) | **4.00 小時** | 上午半日班 |
| `13:30 ~ 18:00` | 4.50 小時 | 扣除 1.00 小時 | **3.50 小時** | 下午班跨度超過 4 小時 |
| `09:00 ~ 19:30` | 10.50 小時 | 扣除 1.00 小時 | **9.50 小時** | 加班全日班 |

---

## 2. 日排班與當日狀態判定階層 (`getDaySchedule`)

判定特定員工在特定日期的排班屬性與出勤狀態時，採用以下嚴格之優先級流程：

```mermaid
flowchart TD
    Start([輸入: 員工ID, 日期]) --> CheckOverride{是否存在排班覆蓋<br>ScheduleOverride?}
    CheckOverride -- 是 --> UseOverride[以覆蓋設定為準<br>is_workday, start_time, end_time]
    CheckOverride -- 否 --> UseDefault[預設排班規則<br>週一至週五=工作日(09:00~18:00)<br>週六週日=排休日]
    
    UseOverride --> CheckLeave{當日是否有請假<br>LeaveRequest?}
    UseDefault --> CheckLeave
    
    CheckLeave -- 是 --> StatusLeave[狀態 = 'leave'<br>應出勤時數 = 0<br>免扣工時]
    CheckLeave -- 否 --> CheckWorkday{是否為工作日?}
    
    CheckWorkday -- 否 --> StatusRest[狀態 = 'rest'<br>應出勤時數 = 0]
    CheckWorkday -- 是 --> CalcRequired[應出勤時數 = calculateDurationHours(start, end)]
    
    CalcRequired --> CheckPunch{打卡紀錄狀態}
    CheckPunch -- 簽到+簽退 --> StatusAttended[狀態 = 'attended'<br>計算 actualHours]
    CheckPunch -- 僅簽到 --> StatusWorking[狀態 = 'working'<br>工作中]
    CheckPunch -- 未打卡且日期在今日之前 --> StatusAbsent[狀態 = 'absent'<br>缺勤]
    CheckPunch -- 未打卡且日期為今日或未來 --> StatusFuture[狀態 = 'future_work'<br>待簽到/未來工作日]
```

---

## 3. 當月工時統計結算規則 (`calculateMonthlyStats`)

### 3.1 核心公式
$$\text{BalanceHours} = \text{ActualHours} - \text{RequiredHours}$$
* **$\text{BalanceHours} > 0$**：正結餘，代表本月有超額出勤或加班。
* **$\text{BalanceHours} < 0$**：負結餘，代表本月有遲到、早退或未打卡缺勤。
* **$\text{BalanceHours} = 0$**：全勤且時數恰好相符。

### 3.2 關鍵動態累計規則 (Anti-Deficit Rule)
> **重要設計原則**：
> 當月之「應出勤天數」與「應出勤時數」分母，**僅累計統計至今天（Today）為止的已過工作日**。
> 未來的日期（例如今天是 15 號，16~31 號之工作日）不計入當前的應出勤分母。
> 
> *設計目的*：避免員工在月初（如 8 月 1 日剛上班時）看到高達 -160 小時的不合理負值，確保指標即時且合理地反映截至今日為止的出勤績效。

---

## 4. 打卡防呆與狀態機 (Punch State Machine)

1. **上班打卡 (`/api/clock-in`) 防呆**：
   - 若當日已有核准之請假單 $\rightarrow$ 阻擋打卡並提示已有請假。
   - 若當日已完成上班打卡 $\rightarrow$ 阻擋重複打卡並提示已簽到時間。
2. **下班打卡 (`/api/clock-out`) 防呆**：
   - 若當日尚未進行上班打卡 $\rightarrow$ 阻擋下班打卡並提示需先簽到。
   - 若當日已完成下班打卡 $\rightarrow$ 阻擋重複簽退並提示已簽退時間。
