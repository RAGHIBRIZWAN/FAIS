# evaluators/round1.py
import re
import os
import json
import time
from PIL import Image
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL   = "gemini-3.1-flash-lite"

PROMPT = """\
You are an expert visual evaluator for a key-design challenge.

--- STEP 1: ORIENT THE KEY ---
The image may show the key at any angle (horizontal, vertical, diagonal, upside-down, mirrored).
First, mentally reorient the key so that:
  - The BOW (the ring/hole you grip) is on the LEFT side.
  - The BLADE (the flat toothed shaft) extends to the RIGHT.
  - The THREE TEETH point DOWNWARD from the blade.
Do all your analysis in this normalized orientation.
IGNORE the BOW/ring completely — do not count shapes on it.

--- STEP 2: IDENTIFY THE THREE TEETH ---
The blade has exactly three short parallel teeth extending downward (in the normalized view).
Order them LEFT, CENTER, RIGHT based on their position along the blade from bow-end to tip-end.
Each tooth is a small rod/peg. Each tooth may have a geometric shape attached to it.

--- STEP 3: CLASSIFY EACH TOOTH'S SHAPE ---
For each tooth, identify what geometric shape is present:
- triangle: a 3-sided pointed/pyramidal shape
- circle: a round disc, sphere, cylinder cap, or ring/torus shape
- square: a cube, box, block, or square/rectangular prism

"left_is_triangle" = true  → the LEFT tooth has a triangle shape
"center_is_circle" = true  → the CENTER tooth has a circle/round shape
"right_is_square"  = true  → the RIGHT tooth has a square/block shape

--- STEP 4: CHECK IF SHAPE IS AT THE TIP ---
For each tooth, the TIP is the FREE END — the end FURTHEST from the blade.
The ROOT is the end connected to the blade.

The structure of each tooth is: [BLADE] -- [rod/stem] -- [SHAPE] -- [open space]
There is always a cylindrical rod/stem between the blade and the shape. This stem is on the ROOT side.
The shape sits at the far (TIP) end of the stem.

"X_shape_at_tip" = true IF:
  - The shape is at the terminal end of the tooth.
  - The shape is the outermost element — open space begins right after the shape.
  - The connecting rod/stem is between the blade and the shape (ROOT side). This is EXPECTED and does NOT make it false.
  - Examples that ARE at tip: a disc at the end of a rod, a cube at the end of a rod, a triangle at the end of a rod.

"X_shape_at_tip" = false IF:
  - There is visible bare rod/stem extending PAST the shape on the TIP side (away from blade).
  - The shape sits midway along the rod, with bare rod continuing beyond it toward the free end.
  - The key question is: does bare rod protrude PAST the shape toward open space?

CRITICAL: The rod/stem you see between the blade and the shape is on the ROOT side — it does NOT make the shape "not at tip".
Only rod BEYOND the shape (between the shape and open space) means the shape is not at the tip.

--- STEP 5: COMPARE TOOTH LENGTHS ---
Measure each tooth's PHYSICAL LENGTH = distance from blade attachment point to the tooth's tip.
The tip of the tooth is its absolute farthest end (the free end of the rod), NOT the shape's position.

"left_taller_than_center"  = true ONLY IF the LEFT tooth's physical length > CENTER tooth's physical length
"right_taller_than_center" = true ONLY IF the RIGHT tooth's physical length > CENTER tooth's physical length

If two teeth appear equal in length, the result is false.
Do NOT be misled by the position of shapes along the rod — compare the full rod lengths from root to tip.

--- OUTPUT FORMAT ---
First write your reasoning (required), then output the JSON.
In your reasoning:
  1. Describe which direction the key is oriented and how you normalized it.
  2. List each tooth (LEFT, CENTER, RIGHT) and what shape it has.
  3. For each tooth, state whether the shape is at the tip or not, and why.
  4. Compare the physical lengths of the three teeth.

After the reasoning, return ONLY valid JSON with exactly these keys (no extra text or markdown):
{
  "reasoning": "<your chain-of-thought analysis here>",
  "left_is_triangle": <true/false>,
  "center_is_circle": <true/false>,
  "right_is_square": <true/false>,
  "left_shape_at_tip": <true/false>,
  "center_shape_at_tip": <true/false>,
  "right_shape_at_tip": <true/false>,
  "left_taller_than_center": <true/false>,
  "right_taller_than_center": <true/false>
}
"""


def score_key(image_path):
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(MODEL)
    image = Image.open(image_path)

    while True:
        try:
            response = model.generate_content([image, PROMPT])
            raw = response.text.strip()

            # Strip markdown code fences if the model wraps in ```json ... ```
            raw = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()

            # Extract JSON object from the response (handles leading/trailing text)
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)
            if not json_match:
                raise ValueError("No JSON object found in response")
            
            data = json.loads(json_match.group())

            # Print reasoning if present
            reasoning = data.get("reasoning", "")
            if reasoning:
                print(f"Reasoning:\n{reasoning}\n")

            print("Model JSON:", json.dumps({k: v for k, v in data.items() if k != "reasoning"}, indent=2))

            # --- Score computed fully in Python ---
            score = 100

            if not data.get("left_is_triangle",         False): score -= 20
            if not data.get("center_is_circle",          False): score -= 20
            if not data.get("right_is_square",           False): score -= 20
            if not data.get("left_shape_at_tip",         False): score -= 10
            if not data.get("right_shape_at_tip",        False): score -= 10
            if not data.get("center_shape_at_tip",       False): score -= 10
            if not data.get("left_taller_than_center",   False): score -= 10
            if not data.get("right_taller_than_center",  False): score -= 10

            return max(0, round(score, 2))

        except ResourceExhausted:
            print("\n[Rate Limit] Waiting 15 seconds...\n")
            time.sleep(15)

        except (json.JSONDecodeError, ValueError, Exception) as e:
            print(f"Error parsing model response: {e}")
            try:
                print(f"Raw response:\n{response.text}")
            except NameError:
                pass
            break

    return 0.0


if __name__ == "__main__":
    score = score_key("submissions/key.png")
    print(f"\nFinal Verified Score: {score}")
