import random
import json
from collections import Counter

# --- Mocking the Survey Data Structure (since we can't import TS directly) ---
# This mirrors the structure in client/src/lib/surveyData.ts
ROLES = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"]

# Simplified representation of the 12 questions and their weighted options
# In a real scenario, we'd parse the TS file, but for this script, we'll hardcode the logic to match.
QUESTIONS = [
    {"id": 1, "options": [{"role": "Spark", "weight": 9}, {"role": "Filter", "weight": 8}, {"role": "Amplifier", "weight": 8}, {"role": "Ground", "weight": 9}, {"role": "Conductor", "weight": 7}]},
    {"id": 2, "options": [{"role": "Spark", "weight": 8}, {"role": "Filter", "weight": 9}, {"role": "Amplifier", "weight": 8}, {"role": "Ground", "weight": 8}, {"role": "Conductor", "weight": 10}]},
    {"id": 3, "options": [{"role": "Spark", "weight": 9}, {"role": "Filter", "weight": 8}, {"role": "Amplifier", "weight": 8}, {"role": "Ground", "weight": 9}, {"role": "Conductor", "weight": 8}]},
    {"id": 4, "options": [{"role": "Spark", "weight": 8}, {"role": "Filter", "weight": 9}, {"role": "Amplifier", "weight": 9}, {"role": "Ground", "weight": 8}, {"role": "Conductor", "weight": 8}]},
    {"id": 5, "options": [{"role": "Spark", "weight": 8}, {"role": "Filter", "weight": 8}, {"role": "Amplifier", "weight": 9}, {"role": "Ground", "weight": 9}, {"role": "Conductor", "weight": 8}]},
    {"id": 6, "options": [{"role": "Spark", "weight": 9}, {"role": "Filter", "weight": 8}, {"role": "Amplifier", "weight": 7}, {"role": "Ground", "weight": 8}, {"role": "Conductor", "weight": 7}]},
    {"id": 7, "options": [{"role": "Spark", "weight": 9}, {"role": "Filter", "weight": 9}, {"role": "Amplifier", "weight": 9}, {"role": "Ground", "weight": 9}, {"role": "Conductor", "weight": 9}]},
    {"id": 8, "options": [{"role": "Spark", "weight": 9}, {"role": "Filter", "weight": 9}, {"role": "Amplifier", "weight": 8}, {"role": "Ground", "weight": 9}, {"role": "Conductor", "weight": 7}]},
    {"id": 9, "options": [{"role": "Spark", "weight": 8}, {"role": "Filter", "weight": 9}, {"role": "Amplifier", "weight": 9}, {"role": "Ground", "weight": 9}, {"role": "Conductor", "weight": 9}]},
    {"id": 10, "options": [{"role": "Spark", "weight": 9}, {"role": "Filter", "weight": 9}, {"role": "Amplifier", "weight": 9}, {"role": "Ground", "weight": 9}, {"role": "Conductor", "weight": 9}]},
    {"id": 11, "options": [{"role": "Spark", "weight": 8}, {"role": "Filter", "weight": 9}, {"role": "Amplifier", "weight": 8}, {"role": "Ground", "weight": 9}, {"role": "Conductor", "weight": 10}]},
    {"id": 12, "options": [{"role": "Spark", "weight": 10}, {"role": "Filter", "weight": 10}, {"role": "Amplifier", "weight": 10}, {"role": "Ground", "weight": 10}, {"role": "Conductor", "weight": 10}]}
]

def calculate_role_scores(answers):
    scores = {role: 0 for role in ROLES}
    for q_idx, option_idx in enumerate(answers):
        selected_option = QUESTIONS[q_idx]["options"][option_idx]
        scores[selected_option["role"]] += selected_option["weight"]
    return scores

def get_dominant_role(scores):
    return max(scores, key=scores.get)

# --- Test 1: Monte Carlo Simulation (Randomness Check) ---
def run_monte_carlo(iterations=10000):
    print(f"--- Running Monte Carlo Simulation ({iterations} iterations) ---")
    results = []
    for _ in range(iterations):
        # Simulate random answers (0-4 for each of the 12 questions)
        random_answers = [random.randint(0, 4) for _ in range(12)]
        scores = calculate_role_scores(random_answers)
        dominant = get_dominant_role(scores)
        results.append(dominant)
    
    counts = Counter(results)
    total = len(results)
    print("\nDistribution of Roles (Random Inputs):")
    for role in ROLES:
        percentage = (counts[role] / total) * 100
        print(f"{role}: {percentage:.2f}%")
    
    # Check for bias (ideal is ~20% each)
    max_bias = max(counts.values()) / total
    if max_bias > 0.3:
        print("\n[WARNING] Significant bias detected! One role is over-represented > 30%.")
    else:
        print("\n[SUCCESS] Distribution is relatively balanced (no role > 30%).")

# --- Test 2: Synthetic Persona Validation (Construct Validity) ---
def run_persona_validation():
    print("\n--- Running Synthetic Persona Validation ---")
    
    # Define "Perfect" Personas (bots that always pick their role's answer)
    personas = {
        "Spark Bot": "Spark", 
                        # Wait, we need to map indices correctly.
                        # In the TS file, options are ordered, but let's assume standard order for simplicity or check logic.
                        # Actually, let's make the bot smarter: it picks the option with the target role.
        "Amplifier Bot": "Amplifier",
        "Filter Bot": "Filter",
        "Ground Bot": "Ground",
        "Conductor Bot": "Conductor"
    }

    for bot_name, target_role in personas.items():
        # Generate answers where the bot picks the target role 90% of the time, 10% random (noise)
        answers = []
        for q in QUESTIONS:
            if random.random() < 0.9:
                # Pick the option that matches the target role
                # Find index of option with target role
                target_indices = [i for i, opt in enumerate(q["options"]) if opt["role"] == target_role]
                if target_indices:
                    answers.append(target_indices[0])
                else:
                    answers.append(random.randint(0, 4)) # Fallback
            else:
                answers.append(random.randint(0, 4)) # Noise
        
        scores = calculate_role_scores(answers)
        dominant = get_dominant_role(scores)
        
        match_status = "PASS" if dominant == target_role else "FAIL"
        print(f"{bot_name}: Target={target_role}, Result={dominant} -> {match_status}")

if __name__ == "__main__":
    run_monte_carlo()
    run_persona_validation()
