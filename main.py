from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

from evaluators.round1 import score_key
from evaluators.round2 import evaluate as score_ak
from evaluators.round3 import score_round3 as score_kit

r1_res = score_key(
    "submissions/round1.png"
)
r1 = r1_res["score"] if isinstance(r1_res, dict) else r1_res

r2 = score_ak(
    "submissions/round2.png"
)

r3_res = score_kit(
    "submissions/round3.png",
    "ocean"
)
r3 = r3_res["score"] if isinstance(r3_res, dict) else r3_res

final_score = (
    r1 * 0.3
    + r2 * 0.3
    + r3 * 0.4
)

print("Round1:", r1)
print("Round2:", r2)
print("Round3:", r3)
print("FINAL:", final_score)