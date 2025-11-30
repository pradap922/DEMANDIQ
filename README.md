# DEMANDIQ
Built an offline ML-based forecasting system (Flask + Prophet + XGBoost) that predicts weekly product demand and generates stock replenishment plans.
🧠 DEMANDIQ — Retail Sales Forecasting & Stock Planning

A full offline forecasting system that predicts weekly demand for each Store + Department, calculates required stock, and recommends order quantity based on safety percentage.

This project is built using:

Flask (Backend API + UI)

Prophet Forecasting Model

XGBoost Regression

Custom offline chart engine (No CDN / No Internet required)

🔥 Why DEMANDIQ?

Retail stores often guess inventory without data → overstock or stockout.

➡️ DEMANDIQ replaces guesswork with real time-series forecasting.

It provides:

✔ Past weekly sales trend
✔ Future demand prediction
✔ Safety stock calculation
✔ Required stock per week
✔ Suggested Purchase Quantity
✔ Visual charts + Table breakdown

🌐 Screens

Admin Login Page

Dashboard

Two Charts:

Past Weekly Sales

Forecast + Required Stock

Stock planning table

📦 Features
🟦 Forecasting Models

Prophet — fast & reliable

XGBoost — advanced ML model

➡️ LSTM removed to ensure full offline compatibility in college lab environments.

📊 Chart Engine (Offline)

No CDN, no internet — real canvas rendering:

Dots

Hover highlights

Multiple datasets (forecast + required stock)

📁 Project Folder Structure
DEMANDIQ/
│── app.py
│── forecast_service.py
│── ml_models.py
│── data_loader.py
│── features.py
│── models/               # Auto created for ML files
│── static/
│   ├── styles.css
│   ├── script.js
│   └── js/
│       └── chart.js      # Offline chart engine
│── templates/
│   ├── index.html        # Dashboard
│   └── login.html        # Admin Login
│── walmart.csv           # Dataset
│── README.md

⚙️ Installation & Setup
1️⃣ Install Dependencies
pip install flask prophet xgboost scikit-learn pandas numpy joblib


📌 Note:

TensorFlow is not required (LSTM removed)

2️⃣ Place Dataset

Put Walmart dataset in project root:

/walmart.csv


Dataset columns:

Store,Dept,Date,Weekly_Sales

3️⃣ Run Application
python app.py


Defaults:

http://127.0.0.1:5000

🚀 Usage
Step 1: Login

Default credentials (you can change):

username:- admin , password:- 1234

Step 2: Select Inputs

Store ID

Department ID

Past weeks (history)

Future weeks (forecast)

Current stock

Safety %

Click Run

🧠 Forecast Outputs
From API:

Future dates

Predicted demand (yhat)

Safety stock

Required stock

Order quantity

UI:

Interactive chart

Week-by-week stock table

First reorder quantity

📦 Tech Stack
Layer	Technology
Backend	Flask
ML	Prophet, XGBoost
Data	Pandas
Saving Models	joblib
Frontend	HTML + CSS + JS
Charts	Custom offline Canvas
🛡️ Offline Guarantee

No CDN
No Google fonts
No external libraries

✔ Works on exam lab machines
✔ Works without internet
✔ Pure local storage

🔐 Admin Login

Simple authentication

Server-side session

Secure redirect to dashboard

🌱 Future Improvements

Add LSTM when GPU/TF allowed

Export CSV report

Multi-store comparison

Inventory cost optimization

Deep learning forecasting
