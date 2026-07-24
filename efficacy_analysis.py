"""
Deep Calibration Efficacy Analysis
Monte Carlo simulation comparing Likert vs Forced-Rank scoring methods.
Outputs JSON data for the site's efficacy report page.
"""
import json
import random
import math
import statistics
from collections import defaultdict

random.seed(42)
N = 10000  # synthetic respondents
ROLES = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"]

# --- Likert Simulation ---
# 12 questions, each with 5 options (one per role), weights 7-10
# Social desirability bias: people inflate scores on "attractive" roles
DESIRABILITY_BIAS = {"Spark": 0.25, "Amplifier": 0.15, "Conductor": 0.20, "Filter": -0.10, "Ground": -0.05}

def simulate_likert(true_profile):
    """Simulate a Likert-style assessment with social desirability bias."""
    scores = {r: 0 for r in ROLES}
    for q in range(12):
        # Each question: pick the role closest to true profile, but bias it
        probs = []
        for r in ROLES:
            base = true_profile[r]
            bias = DESIRABILITY_BIAS[r]
            p = max(0.01, base + bias + random.gauss(0, 0.1))
            probs.append(p)
        total = sum(probs)
        probs = [p / total for p in probs]
        # Weighted random choice
        chosen_idx = random.choices(range(5), weights=probs, k=1)[0]
        weight = random.choice([7, 8, 9, 10])
        scores[ROLES[chosen_idx]] += weight
    # Normalize to percentages
    total = sum(scores.values())
    return {r: round(scores[r] / total * 100, 1) for r in ROLES}

def simulate_forced_rank(true_profile):
    """Simulate forced-ranking with much less bias (can't inflate all)."""
    scores = {r: 0 for r in ROLES}
    rank_points = [4, 3, 2, 1]
    for s in range(15):
        # Pick 4 roles for this set (some sets have 4 of 5)
        set_roles = random.sample(ROLES, 4)
        # Rank based on true profile with small noise, minimal bias
        role_scores = []
        for r in set_roles:
            noise = random.gauss(0, 0.05)  # much less noise than Likert
            bias = DESIRABILITY_BIAS[r] * 0.15  # bias reduced by 85%
            role_scores.append((r, true_profile[r] + noise + bias))
        role_scores.sort(key=lambda x: -x[1])
        for rank, (role, _) in enumerate(role_scores):
            scores[role] += rank_points[rank]
    total = sum(scores.values())
    return {r: round(scores[r] / total * 100, 1) for r in ROLES}

def generate_true_profile():
    """Generate a true profile with one dominant role."""
    dominant = random.choice(ROLES)
    profile = {}
    remaining = 1.0
    for r in ROLES:
        if r == dominant:
            profile[r] = random.uniform(0.30, 0.45)
        else:
            profile[r] = random.uniform(0.05, 0.20)
    total = sum(profile.values())
    return {r: v / total for r, v in profile.items()}, dominant

# --- Run Simulations ---
likert_results = []
forced_results = []
true_dominants = []
likert_correct = 0
forced_correct = 0

likert_spreads = []
forced_spreads = []

likert_entropies = []
forced_entropies = []

def entropy(pcts):
    """Shannon entropy of a distribution — higher = less differentiated."""
    probs = [p / 100 for p in pcts.values() if p > 0]
    return -sum(p * math.log2(p) for p in probs)

for i in range(N):
    true_profile, true_dom = generate_true_profile()
    true_dominants.append(true_dom)
    
    likert = simulate_likert(true_profile)
    forced = simulate_forced_rank(true_profile)
    
    likert_results.append(likert)
    forced_results.append(forced)
    
    # Correct classification
    likert_dom = max(likert, key=likert.get)
    forced_dom = max(forced, key=forced.get)
    if likert_dom == true_dom:
        likert_correct += 1
    if forced_dom == true_dom:
        forced_correct += 1
    
    # Score spread (max - min)
    likert_spreads.append(max(likert.values()) - min(likert.values()))
    forced_spreads.append(max(forced.values()) - min(forced.values()))
    
    # Entropy
    likert_entropies.append(entropy(likert))
    forced_entropies.append(entropy(forced))

# --- Test-Retest Reliability ---
# Simulate same person taking the test twice
retest_likert_corrs = []
retest_forced_corrs = []

for i in range(2000):
    true_profile, _ = generate_true_profile()
    l1 = simulate_likert(true_profile)
    l2 = simulate_likert(true_profile)
    f1 = simulate_forced_rank(true_profile)
    f2 = simulate_forced_rank(true_profile)
    
    # Pearson correlation between test and retest
    def pearson(a, b):
        vals_a = [a[r] for r in ROLES]
        vals_b = [b[r] for r in ROLES]
        mean_a = sum(vals_a) / 5
        mean_b = sum(vals_b) / 5
        num = sum((va - mean_a) * (vb - mean_b) for va, vb in zip(vals_a, vals_b))
        den_a = math.sqrt(sum((v - mean_a) ** 2 for v in vals_a))
        den_b = math.sqrt(sum((v - mean_b) ** 2 for v in vals_b))
        if den_a == 0 or den_b == 0:
            return 0
        return num / (den_a * den_b)
    
    retest_likert_corrs.append(pearson(l1, l2))
    retest_forced_corrs.append(pearson(f1, f2))

# --- Faking Resistance ---
# Simulate someone trying to look like a Spark (most "attractive" role)
fake_likert_spark = 0
fake_forced_spark = 0

for i in range(2000):
    # True profile: actually a Ground
    true_profile = {"Spark": 0.10, "Amplifier": 0.15, "Filter": 0.20, "Ground": 0.40, "Conductor": 0.15}
    
    # Faking on Likert: inflate Spark answers heavily
    scores = {r: 0 for r in ROLES}
    for q in range(12):
        # Faker picks Spark 60% of the time
        if random.random() < 0.60:
            scores["Spark"] += random.choice([8, 9, 10])
        else:
            r = random.choice(ROLES)
            scores[r] += random.choice([7, 8])
    total = sum(scores.values())
    likert_fake = {r: round(scores[r] / total * 100, 1) for r in ROLES}
    if max(likert_fake, key=likert_fake.get) == "Spark":
        fake_likert_spark += 1
    
    # Faking on forced-rank: try to always rank Spark first
    scores = {r: 0 for r in ROLES}
    rank_points = [4, 3, 2, 1]
    for s in range(15):
        set_roles = random.sample(ROLES, 4)
        # Faker puts Spark first if available, but still has to rank others
        if "Spark" in set_roles:
            remaining = [r for r in set_roles if r != "Spark"]
            random.shuffle(remaining)
            ordered = ["Spark"] + remaining
        else:
            random.shuffle(set_roles)
            ordered = set_roles
        for rank, role in enumerate(ordered):
            scores[role] += rank_points[rank]
    total = sum(scores.values())
    forced_fake = {r: round(scores[r] / total * 100, 1) for r in ROLES}
    if max(forced_fake, key=forced_fake.get) == "Spark":
        fake_forced_spark += 1

# --- Compile Results ---
results = {
    "simulation": {
        "n_respondents": N,
        "n_retest": 2000,
        "n_faking": 2000,
        "seed": 42
    },
    "classification_accuracy": {
        "likert": round(likert_correct / N * 100, 1),
        "forced_rank": round(forced_correct / N * 100, 1),
        "improvement": round((forced_correct - likert_correct) / N * 100, 1)
    },
    "differentiation": {
        "likert_avg_spread": round(statistics.mean(likert_spreads), 1),
        "forced_avg_spread": round(statistics.mean(forced_spreads), 1),
        "likert_median_spread": round(statistics.median(likert_spreads), 1),
        "forced_median_spread": round(statistics.median(forced_spreads), 1)
    },
    "entropy": {
        "likert_avg": round(statistics.mean(likert_entropies), 3),
        "forced_avg": round(statistics.mean(forced_entropies), 3),
        "max_entropy": round(math.log2(5), 3),
        "description": "Lower entropy = sharper differentiation. Max entropy (2.322) = all roles equal."
    },
    "test_retest_reliability": {
        "likert_avg_r": round(statistics.mean(retest_likert_corrs), 3),
        "forced_avg_r": round(statistics.mean(retest_forced_corrs), 3),
        "likert_median_r": round(statistics.median(retest_likert_corrs), 3),
        "forced_median_r": round(statistics.median(retest_forced_corrs), 3)
    },
    "faking_resistance": {
        "likert_fake_success_rate": round(fake_likert_spark / 2000 * 100, 1),
        "forced_fake_success_rate": round(fake_forced_spark / 2000 * 100, 1),
        "description": "Percentage of fakers who successfully appeared as Spark (their target role)"
    },
    "role_distribution": {
        "likert": defaultdict(int),
        "forced": defaultdict(int)
    },
    "spread_histogram": {
        "likert": {},
        "forced": {}
    }
}

# Role distribution
for lr, fr in zip(likert_results, forced_results):
    results["role_distribution"]["likert"][max(lr, key=lr.get)] += 1
    results["role_distribution"]["forced"][max(fr, key=fr.get)] += 1

results["role_distribution"]["likert"] = dict(results["role_distribution"]["likert"])
results["role_distribution"]["forced"] = dict(results["role_distribution"]["forced"])

# Spread histogram (buckets of 5)
for spread_list, key in [(likert_spreads, "likert"), (forced_spreads, "forced")]:
    buckets = defaultdict(int)
    for s in spread_list:
        bucket = int(s // 5) * 5
        buckets[f"{bucket}-{bucket+5}"] += 1
    results["spread_histogram"][key] = dict(sorted(buckets.items()))

# Save
with open("/home/ubuntu/greg-berry-innovation/client/src/lib/efficacyData.json", "w") as f:
    json.dump(results, f, indent=2)

print(json.dumps(results, indent=2))
print("\n--- SUMMARY ---")
print(f"Classification Accuracy: Likert {results['classification_accuracy']['likert']}% → Forced-Rank {results['classification_accuracy']['forced_rank']}% (+{results['classification_accuracy']['improvement']}%)")
print(f"Avg Score Spread: Likert {results['differentiation']['likert_avg_spread']}pp → Forced-Rank {results['differentiation']['forced_avg_spread']}pp")
print(f"Avg Entropy: Likert {results['entropy']['likert_avg']} → Forced-Rank {results['entropy']['forced_avg']} (max: {results['entropy']['max_entropy']})")
print(f"Test-Retest r: Likert {results['test_retest_reliability']['likert_avg_r']} → Forced-Rank {results['test_retest_reliability']['forced_avg_r']}")
print(f"Faking Success: Likert {results['faking_resistance']['likert_fake_success_rate']}% → Forced-Rank {results['faking_resistance']['forced_fake_success_rate']}%")
