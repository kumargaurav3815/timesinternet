import json

def load_cards(file_path='../data/cards.json'):
    with open(file_path, 'r') as f:
        return json.load(f)

def extract_income_value(income_str):
    income_str = income_str.lower().replace(",", "")
    if "lpa" in income_str:
        try:
            return int(float(income_str.replace("lpa", "").strip()) * 100000)
        except:
            return None
    try:
        return int(income_str)
    except:
        return None

def filter_cards(user_data, cards):
    income = extract_income_value(user_data.get("income", "0"))
    spending = user_data.get("spending", "").lower()
    perks = user_data.get("perks", "").lower()
    score = user_data.get("credit_score", "unknown").lower()

    matched_cards = []

    for card in cards:
        # Check income eligibility
        card_income_required = extract_income_value(card['eligibility'].split(">")[-1].strip())
        if income and income < card_income_required:
            continue

        match_score = 0
        reasons = []

        reward_text = card['rewards'].lower()

        # Check spending match
        if any(spend.strip() in reward_text or reward_text in spend.strip() for spend in spending.split(",")):
            match_score += 2
            reasons.append("Matches your spending habits")

        # Check perk match
        if any(perk.strip() in " ".join(card['perks']).lower() for perk in perks.split(",")):
            match_score += 2
            reasons.append("Includes your preferred benefits")

        # Optional credit score filtering
        if score != "unknown":
            try:
                if int(score) < 600 and card_income_required > 500000:
                    continue
            except:
                pass

        # Simulated value
        estimated_cashback = 1000 + 1000 * match_score

        matched_cards.append({
            "name": card["name"],
            "issuer": card["issuer"],
            "rewards": card["rewards"],
            "perks": card["perks"],
            "apply_link": card["apply_link"],
            "image_url": card.get("image_url", "https://via.placeholder.com/150"),
            "estimated_benefit": f"You could earn ~ ₹{estimated_cashback}/year cashback",
            "key_reasons": reasons,
            "match_score": match_score
        })

    top_matches = sorted(matched_cards, key=lambda x: x["match_score"], reverse=True)[:5]
    return top_matches

# 🔽 Local test runner
if __name__ == "__main__":
    sample_input = {
        "income": "600000",
        "spending": "fuel, groceries",
        "perks": "cashback, lounge",
        "credit_score": "700"
    }

    cards = load_cards("../data/cards.json")
    recommendations = filter_cards(sample_input, cards)

    print("\nRecommended Cards:")
    for rec in recommendations:
        print(f"{rec['name']} | {rec['estimated_benefit']}")
        print(f"Perks: {rec['perks']}")
        print(f"Reasons: {', '.join(rec['key_reasons'])}")
        print(f"Image: {rec['image_url']}")
        print("---")
