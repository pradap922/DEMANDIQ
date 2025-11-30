from pathlib import Path
import pandas as pd

DATA_PATH = Path("data") / "walmart_sales.csv"

_df_cache = None


def load_raw_data() -> pd.DataFrame:
    global _df_cache
    if _df_cache is not None:
        return _df_cache

    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()

    required_cols = {"Store", "Dept", "Date", "Weekly_Sales"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")

    df["Date"] = pd.to_datetime(df["Date"])
    df["Store"] = df["Store"].astype(int)
    df["Dept"] = df["Dept"].astype(int)
    df["Weekly_Sales"] = df["Weekly_Sales"].astype(float)

    _df_cache = df
    return df
