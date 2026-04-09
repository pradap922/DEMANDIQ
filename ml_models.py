from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from prophet import Prophet
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler

from data_loader import load_raw_data
from features import make_weekly_series

MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)

LOOKBACK = 8

# ---------------------------
# Load weekly timeseries
# ---------------------------
def _weekly(store, dept):
    df = load_raw_data()
    w = make_weekly_series(df, store, dept)
    return w.sort_values("ds").reset_index(drop=True)


# ---------------------------
# PROPHET forecast
# ---------------------------
def prophet_forecast(store, dept, future):
    w = _weekly(store, dept)
    m = Prophet()
    m.fit(w[["ds", "y"]])
    f = m.make_future_dataframe(periods=future, freq="W")
    p = m.predict(f)
    return p.tail(future)[["ds", "yhat"]]


# ---------------------------
# XGBOOST
# ---------------------------
def _xgb_features(w):
    w = w.copy()
    for i in range(1, LOOKBACK + 1):
        w[f"lag_{i}"] = w["y"].shift(i)

    w["week"] = w["ds"].dt.isocalendar().week.astype(int)
    w["month"] = w["ds"].dt.month
    w["year"] = w["ds"].dt.year

    w = w.dropna().reset_index(drop=True)
    cols = [f"lag_{i}" for i in range(1, LOOKBACK + 1)] + ["week", "month", "year"]
    return w, w[cols].values, w["y"].values, cols


def _paths(store, dept):
    m = MODELS_DIR / f"xgb_{store}_{dept}.json"
    s = MODELS_DIR / f"xgb_scaler_{store}_{dept}.pkl"
    return m, s


# ---------------------------
# TRAIN XGB
# ---------------------------
def _train_xgb(store, dept):
    w = _weekly(store, dept)
    w, X, y, cols = _xgb_features(w)

    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)

    model = XGBRegressor(
        n_estimators=400,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
    )
    model.fit(Xs, y)

    model_path, scale_path = _paths(store, dept)
    model.save_model(str(model_path))
    joblib.dump({"scaler": scaler, "cols": cols}, scale_path)

    return model, scaler, cols, w


# ---------------------------
# LOAD XGB
# ---------------------------
def _load_xgb(store, dept):
    model_path, scale_path = _paths(store, dept)

    if not model_path.exists() or not scale_path.exists():
        return None

    model = XGBRegressor()
    model.load_model(str(model_path))

    meta = joblib.load(scale_path)
    scaler = meta["scaler"]
    cols = meta["cols"]

    w = _weekly(store, dept)

    return model, scaler, cols, w


# ---------------------------
# FORECAST
# ---------------------------
def xgb_forecast(store, dept, future):
    result = _load_xgb(store, dept)
    if result is None:
        result = _train_xgb(store, dept)

    model, scaler, cols, w = result

    series = w["y"].tolist()
    last = w["ds"].iloc[-1]

    dates, preds = [], []

    for _ in range(future):
        last = last + pd.Timedelta(weeks=1)

        vals = series[-LOOKBACK:]
        if len(vals) < LOOKBACK:
            vals = [series[0]] * (LOOKBACK - len(vals)) + vals

        row = {f"lag_{i+1}": vals[-(i+1)] for i in range(LOOKBACK)}
        row["week"] = int(last.isocalendar().week)
        row["month"] = last.month
        row["year"] = last.year

        Xnew = scaler.transform([[row[c] for c in cols]])
        yhat = float(model.predict(Xnew)[0])

        preds.append(yhat)
        dates.append(last)
        series.append(yhat)

    return pd.DataFrame({"ds": dates, "yhat": preds})
