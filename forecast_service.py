from typing import Tuple, List
import pandas as pd

from data_loader import load_raw_data
from features import make_weekly_series
from ml_models import prophet_forecast, xgb_forecast


def get_store_dept_options() -> Tuple[List[int], List[int]]:
    df = load_raw_data()
    stores = sorted(df["Store"].unique().tolist())
    depts = sorted(df["Dept"].unique().tolist())
    return stores, depts


def get_history(store: int, dept: int, weeks: int) -> pd.DataFrame:
    df = load_raw_data()
    weekly = make_weekly_series(df, store, dept).sort_values("ds").dropna()
    return weekly.tail(weeks)[["ds", "y"]]


def get_summary(store: int, dept: int) -> dict:
    df = load_raw_data()
    weekly = make_weekly_series(df, store, dept).sort_values("ds").dropna()
    return {
        "min_date": weekly["ds"].min().strftime("%Y-%m-%d"),
        "max_date": weekly["ds"].max().strftime("%Y-%m-%d"),
        "total_weeks": int(weekly.shape[0]),
        "total_sales": float(weekly["y"].sum()),
        "avg_weekly_sales": float(weekly["y"].mean()),
    }


def get_forecast(store: int, dept: int, weeks: int, model_name: str) -> pd.DataFrame:
    model = model_name.lower()

    if model == "prophet":
        return prophet_forecast(store, dept, weeks)
    if model == "xgb":
        return xgb_forecast(store, dept, weeks)

    raise ValueError(f"Unknown model: {model_name}")
