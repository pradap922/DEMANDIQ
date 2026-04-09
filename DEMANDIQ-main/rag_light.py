import json

with open("knowledge/demandiq_knowledge.json", "r") as f:
    KNOWLEDGE = json.load(f)


def rag_answer(question):

    q = question.lower()

    # synonym matching
    if "who" in q and ("developed" in q or "created" in q or "made" in q):
        return KNOWLEDGE.get("founder")

    if "department" in q:
        return KNOWLEDGE.get("department")

    if "project" in q:
        return KNOWLEDGE.get("project")

    # normal keyword search
    for key, value in KNOWLEDGE.items():
        if key in q:
            return value

    return (
        "I can explain DemandIQ forecasting, models, and stock planning. "
        "Try asking about forecast, Prophet, XGBoost, or safety stock."
    )