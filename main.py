from evaluators.round1 import score_key
from evaluators.round2 import evaluate as score_ak
from evaluators.round3 import evaluate as score_kit

r1 = score_key(
    "submissions/round1.png"
)

r2 = score_ak(
    "submissions/round2.png"
)

r3 = score_kit(
    "submissions/round3.png",
    "ocean"
)

final_score = (
    r1 * 0.3
    + r2 * 0.3
    + r3 * 0.4
)

print("Round1:", r1)
print("Round2:", r2)
print("Round3:", r3)
print("FINAL:", final_score)