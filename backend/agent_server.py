from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
import os
from recommendation_engine import load_cards, filter_cards
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Serve images from local directory
image_dir = os.path.abspath("images")
if not os.path.exists(image_dir):
    os.makedirs(image_dir)
app.mount("/images", StaticFiles(directory=image_dir), name="images")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory conversation tracking
conversation_state = {}

@app.post("/ask")
async def ask(request: Request):
    data = await request.json()
    session_id = data.get("session_id", str(uuid4()))
    message = data.get("message", "").strip().lower()

    state = conversation_state.get(session_id, {
        "step": 0,
        "income": "",
        "spending": "",
        "perks": "",
        "credit_score": ""
    })

    step = state["step"]
    response = ""

    if message == "restart":
        state = {"step": 0, "income": "", "spending": "", "perks": "", "credit_score": ""}
        response = "Hi again! What's your monthly income?"
    elif step == 0:
        state["income"] = message
        state["step"] = 1
        response = "Got it. What are your spending habits? (fuel, travel, dining, groceries)"
    elif step == 1:
        state["spending"] = message
        state["step"] = 2
        response = "Nice. What perks do you prefer? (cashback, lounge access, travel points)"
    elif step == 2:
        state["perks"] = message
        state["step"] = 3
        response = "Understood. What's your credit score? Or type 'unknown'."
    elif step == 3:
        state["credit_score"] = message
        state["step"] = 4

        recommend_payload = {
            "income": state["income"],
            "spending": state["spending"],
            "perks": state["perks"],
            "credit_score": state["credit_score"]
        }

        print("\n✅ Sending to /recommend with:", recommend_payload)

        try:
            cards = load_cards("../data/cards.json")
            top_cards = filter_cards(recommend_payload, cards)

            print("Filtered cards:", top_cards)

            if not top_cards:
                response = "❌ You're currently not eligible for any credit card based on your inputs."
            else:
                response = "🎯 Top Recommended Cards:"
                for card in top_cards[:3]:
                    response += f"\n✅ {card['name']} – {card['estimated_benefit']}"
        except Exception as e:
            print("Error from /recommend logic:", str(e))
            response = f"⚠️ Error while fetching recommendations: {str(e)}"
    else:
        response = "Server Error. (Check backend logs)"

    conversation_state[session_id] = state
    return {"response": response, "session_id": session_id}


@app.post("/recommend")
async def recommend(request: Request):
    data = await request.json()
    user_input = {
        "income": data["income"],
        "spending": data["spending"],
        "perks": data["perks"],
        "credit_score": data["credit_score"]
    }

    print("Running recommendation engine for:", user_input)
    cards = load_cards("../data/cards.json")
    recommendations = filter_cards(user_input, cards)
    return {"recommendations": recommendations}
