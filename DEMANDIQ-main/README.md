# 🛒 DEMANDIQ — Retail Sales Forecasting & Stock Planning

Built an offline ML-based forecasting system (Flask + Prophet + XGBoost) that predicts weekly product demand and generates stock replenishment plans. 

A full offline forecasting system that predicts weekly demand for each Store + Department, calculates required stock, and recommends order quantity based on safety percentage.

---

## 🔥 Why DEMANDIQ?

Retail stores often guess inventory without data, leading to overstock or stockouts.
**DEMANDIQ replaces guesswork with real time-series forecasting.**

**It provides:**
- ✔ Past weekly sales trend analysis
- ✔ Future demand prediction
- ✔ Safety stock calculation
- ✔ Required stock per week
- ✔ Suggested Purchase Quantity
- ✔ Visual charts & tabular breakdowns

---

## 🏗️ System Architecture & Technologies

- **Backend / API**: Flask (Python)
- **Machine Learning**: Meta Prophet & XGBoost
- **Data Handling**: Pandas & NumPy (No heavy SQL dependency, works from CSVs)
- **Frontend / Dashboard**: HTML5, Vanilla CSS, JS with a **custom offline canvas rendering engine** (No CDN needed).
- **Model Storage**: joblib
- **Guaranteed Offline**: Perfect for strictly-controlled offline lab environments (no external dependencies, fonts, or CDNs allowed).

---

## 📦 Core Features

### 🟦 Forecasting Models
- **Prophet** — Fast and reliable meta-model for time series.
- **XGBoost** — Advanced gradient boosting ML model capturing non-linear trends.

### 📊 Custom Offline Chart Engine
- Real canvas rendering without Chart.js or the internet.
- Interactive dots, hover highlights, and multiple datasets plotted simultaneously (forecast + required stock).

### 🤖 Lightweight RAG-Powered AI Assistant
- Assitant setup capable of querying internal knowledge base and generating smart contextual replies.

---

## 🗃️ Conceptual ER Diagram & Schema

While DEMANDIQ runs primarily on local CSV processing (via Pandas) instead of a traditional DB like MySQL, the logical relationship flows mapped out in our pipeline are:

* **USER**: Username (PK), Password, Role (Admin)
* **STORE**: Store_ID (PK)
* **DEPARTMENT**: Dept_ID (PK), Store_ID (FK)
* **SALES_HISTORY**: Record_ID (PK), Store_ID (FK), Dept_ID (FK), Date, Weekly_Sales, IsHoliday
* **FORECAST_PROJECTION**: Projection_ID (PK), Store_ID (FK), Dept_ID (FK), Date, Predicted_Sales, Safety_Stock, Order_Quantity

**Relationships:**
- 1 `STORE` -> Many `DEPARTMENT`s
- 1 `DEPARTMENT` -> Many `SALES_HISTORY` records
- 1 `DEPARTMENT` -> Many `FORECAST_PROJECTION` records

---

## 🔄 Data Flow Diagram (DFD)

**Level 0 (Context Diagram)**
```text
[ Admin User ] <=====(Dashboard UI / Charts / API)=====> [ DEMANDIQ SYSTEM ]
```
- **Flow In**: Login Credentials, Store/Dept selections, Forecast duration (weeks).
- **Flow Out**: Auth Status, Sales History, Forecast Metrics, Order Quantities, AI insights.

**Level 1 (Process Breakdown)**
1. **Authentication**: `[User]` -> submits credentials -> (Session Manager).
2. **Data Loader**: Reads raw `walmart.csv`, cleans data, generates aggregated views.
3. **Forecasting Engine**: Runs Prophet/XGBoost over cleaned data -> computes Safety Stock & Orders -> outputs JSON to UI.
4. **RAG Assistant**: Processes user queries against local docs -> outputs AI replies to Dashboard.

---

## 📁 Project Folder Structure

```text
DEMANDIQ/
│── app.py                 # Main Flask server entry point
│── forecast_service.py    # Pipeline logic for predictions
│── ml_models.py           # Prophet & XGBoost wrapper functions
│── data_loader.py         # CSV loading and basic filtering
│── features.py            # Feature engineering for XGBoost
│── models/                # Auto-created directory for serialized ML jobs
│── static/
│   ├── styles.css         # UI Styling
│   ├── script.js          # Client-side Logic
│   └── js/
│       └── chart.js       # Offline custom chart engine
│── templates/
│   ├── index.html         # Main app dashboard
│   └── login.html         # Admin authentication
│── walmart.csv            # Original Dataset (Dataset needs to be placed here)
│── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Install Dependencies
```bash
pip install flask prophet xgboost scikit-learn pandas numpy joblib
```
*(Note: TensorFlow is not required since the LSTM model was intentionally omitted.)*

### 2️⃣ Place Dataset
Put the `walmart.csv` dataset in the project root directory.

Dataset columns format required: `Store,Dept,Date,Weekly_Sales`

### 3️⃣ Run Application
```bash
python app.py
```
**Access via browser:** `http://127.0.0.1:5000`

---


## 🚀 Usage Guide

1. **Login**: 
   - Default credentials are **Username**: `admin`, **Password**: `1234`
   - Secure server-side session redirects to the dashboard.
2. **Select Inputs**: Choose Store ID, Department ID, Past Weeks history constraint, Future Weeks to forecast, Current Stock, and Safety Stock Percentage.
3. **Generate Plan**: Click **Run**.
4. **Outcomes provided**:
   - Interactive timeline charts for past history + future required metrics.
   - Week-by-week granular stock breakdown table.
   - Recommended initial reorder quantity.

---

## 🌱 Future Improvements

- Reintroduce **LSTM** for advanced deep learning forecasting when GPU/TF execution is explicitly allowed.
- Downloadable **CSV Export** for generated pipeline reports.
- **Multi-store comparative view** to check cross-chain inventory behavior.
- Add real **SQL/NoSQL database** architecture for persistent scaling.
- Implement more robust **Inventory cost optimization**.
