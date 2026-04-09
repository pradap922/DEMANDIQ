import pandas as pd


def make_weekly_series(df: pd.DataFrame, store: int, dept: int) -> pd.DataFrame:
    """
    Filter dataset for Store+Dept and return weekly series:
      ds (date), y (weekly sales)
    """
    sub = df[(df["Store"] == store) & (df["Dept"] == dept)].copy()
    if sub.empty:
        raise ValueError(f"No data for Store={store}, Dept={dept}")

    sub = sub[["Date", "Weekly_Sales"]]
    sub.rename(columns={"Date": "ds", "Weekly_Sales": "y"}, inplace=True)

    sub["ds"] = pd.to_datetime(sub["ds"])
    sub["y"] = sub["y"].astype(float)

    weekly = sub.groupby("ds", as_index=False)["y"].sum()
    weekly = weekly.sort_values("ds").reset_index(drop=True)

    return weekly
