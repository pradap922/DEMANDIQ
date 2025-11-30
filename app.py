from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS

from forecast_service import get_store_dept_options, get_history, get_summary, get_forecast

app = Flask(__name__)
app.secret_key = "DEMANDIQ_2025"
CORS(app)


# ==========================
# LOGIN ROUTES
# ==========================

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        u = request.form.get("username")
        p = request.form.get("password")

        # 🔐 Hard-coded admin credentials
        if u == "admin" and p == "1234":
            session["user"] = u
            return redirect(url_for("dashboard"))

        return render_template("login.html", error="Invalid login credentials")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


# ==========================
# DASHBOARD UI
# ==========================
@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect("/")
    return render_template("dashboard.html")


# ==========================
# API — OPTIONS
# ==========================
@app.route("/api/options")
def api_options():
    try:
        stores, depts = get_store_dept_options()
        return jsonify({"ok": True, "stores": stores, "depts": depts})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 400


# ==========================
# API — SUMMARY
# ==========================
@app.route("/api/summary")
def api_summary():
    try:
        store = int(request.args.get("store"))
        dept = int(request.args.get("dept"))
        summary = get_summary(store, dept)
        return jsonify({"ok": True, "summary": summary})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 400


# ==========================
# API — HISTORY
# ==========================
@app.route("/api/history")
def api_history():
    try:
        store = int(request.args.get("store"))
        dept = int(request.args.get("dept"))
        weeks = int(request.args.get("weeks", 52))
        df = get_history(store, dept, weeks)

        return jsonify({
            "ok": True,
            "ds": df["ds"].dt.strftime("%Y-%m-%d").tolist(),
            "y": df["y"].tolist(),
        })
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 400


# ==========================
# API — FORECAST
# ==========================
@app.route("/api/forecast")
def api_forecast():
    try:
        store = int(request.args.get("store"))
        dept = int(request.args.get("dept"))
        weeks = int(request.args.get("weeks", 12))
        model = request.args.get("model", "prophet")
        current_stock = float(request.args.get("stock", 0.0))
        safety_percent = float(request.args.get("safety", 0.1))  # decimal

        df = get_forecast(store, dept, weeks, model)

        df["safety_stock"] = df["yhat"] * safety_percent
        df["required_stock"] = df["yhat"] + df["safety_stock"]
        df["order_qty"] = df["required_stock"] - current_stock

        return jsonify({
            "ok": True,
            "model": model,
            "ds": df["ds"].dt.strftime("%Y-%m-%d").tolist(),
            "yhat": df["yhat"].tolist(),
            "safety_stock": df["safety_stock"].tolist(),
            "required_stock": df["required_stock"].tolist(),
            "order_qty": df["order_qty"].tolist(),
        })
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5001)
