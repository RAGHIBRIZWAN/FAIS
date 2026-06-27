# evaluators/round3.py
import re
import os
import json
import time
from PIL import Image
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL   = "gemini-3.1-flash-lite"

# ─────────────────────────────────────────────────────────────────────────────
# 10 items per terrain. Contestant crafts ANY 5 of them.
# Each correctly identified item = 20 points  →  max 100.
# ─────────────────────────────────────────────────────────────────────────────

PROMPT_OCEAN = """\
You are an expert visual evaluator for a survival-gear design challenge.

TERRAIN: OCEAN

--- STEP 1: UNDERSTAND THE TASK ---
The contestant was asked to craft a physical or drawn scene that contains EXACTLY 5 items
chosen from the following 10 official ocean-terrain items:

   1. boat          – any watercraft (rowboat, sailboat, canoe, kayak, raft, ship)
   2. paddle        – a flat-bladed oar or canoe paddle
   3. life jacket   – personal flotation device / life vest (inflatable or foam)
   4. anchor        – a metal anchor (hook-and-shank, mushroom, or fluke style)
   5. fishing rod   – a rod or pole with a visible fishing line or reel
   6. snorkel       – a diving mask with breathing tube, or just the snorkel tube
   7. lighthouse    – a tall tower structure with a beacon/light at the top
   8. flare gun     – a pistol-shaped device used to fire signal flares
   9. rope          – a coiled or straight rope / mooring line
  10. compass       – a magnetic compass rose or digital compass display

--- STEP 2: INSPECT THE IMAGE ---
Carefully examine every part of the image. Accept any clear representation:
drawn, painted, sculpted, printed, or a real physical object.

--- STEP 3: CLASSIFY EACH ITEM ---
For each of the 10 items, decide: is it CLEARLY and UNAMBIGUOUSLY present?
- Mark TRUE only if the item's key defining features are unmistakably recognizable.
- Do NOT mark TRUE for vague, ambiguous, or partially hidden shapes.
- Each item is judged independently.

Specific guidance:
- boat: hull shape in/on water context counts; toy boats and drawings count.
- paddle: must show the flat blade; a plain stick does NOT count.
- life jacket: must show the vest/jacket shape with straps or buoyancy panels.
- anchor: must show the characteristic shank + ring or flukes shape.
- fishing rod: a long thin rod; fishing line or reel strongly confirms it.
- snorkel: L-shaped or J-shaped tube, possibly with a mask attached.
- lighthouse: distinctive tall cylinder/tower with light housing at top.
- flare gun: pistol body with wide barrel; must look like a gun, not just a stick.
- rope: coiled rope, knotted rope, or clearly rope-textured line.
- compass: circular dial with directional markings (N/S/E/W) or needle.

--- STEP 4: REASONING ---
Write a brief analysis listing all 10 items.
For each item state: visible (yes/no) and the reason why.

--- OUTPUT FORMAT ---
After the reasoning, return ONLY valid JSON with exactly these keys (no markdown, no extra text):
{
  "reasoning": "<your analysis>",
  "boat": <true/false>,
  "paddle": <true/false>,
  "life_jacket": <true/false>,
  "anchor": <true/false>,
  "fishing_rod": <true/false>,
  "snorkel": <true/false>,
  "lighthouse": <true/false>,
  "flare_gun": <true/false>,
  "rope": <true/false>,
  "compass": <true/false>
}
"""

PROMPT_MOUNTAIN = """\
You are an expert visual evaluator for a survival-gear design challenge.

TERRAIN: MOUNTAIN

--- STEP 1: UNDERSTAND THE TASK ---
The contestant was asked to craft a physical or drawn scene that contains EXACTLY 5 items
chosen from the following 10 official mountain-terrain items:

   1. rope          – a climbing rope (coiled, looped, or in use)
   2. ice axe       – a T-shaped tool with a pick and adze head (ice pick)
   3. backpack      – a rucksack or hiking/climbing pack worn on the back
   4. helmet        – a hard-shell climbing, bike, or safety helmet
   5. carabiner     – a metal oval or D-shaped snap-link used in climbing
   6. tent          – any camping tent (dome, ridge, or bivy style)
   7. boots         – sturdy hiking or mountaineering boots (ankle height or taller)
   8. map           – a folded paper map, topographic chart, or trail map
   9. flashlight    – a handheld torch or head-mounted headlamp
  10. first aid kit – a red-cross box, medical pouch, or labelled first-aid bag

--- STEP 2: INSPECT THE IMAGE ---
Carefully examine every part of the image. Accept any clear representation:
drawn, painted, sculpted, printed, or a real physical object.

--- STEP 3: CLASSIFY EACH ITEM ---
For each of the 10 items, decide: is it CLEARLY and UNAMBIGUOUSLY present?
- Mark TRUE only if the item's key defining features are unmistakably recognizable.
- Do NOT mark TRUE for vague, ambiguous, or partially hidden shapes.
- Each item is judged independently.

Specific guidance:
- rope: must look like rope/cord — twisted or braided texture, not a plain stick.
- ice axe: T or L shaped metal head on a handle; the pick (spike) must be visible.
- backpack: bag with shoulder straps; a plain bag without straps does NOT count.
- helmet: hard rounded shell with no brim (or minimal brim); distinct from a hat.
- carabiner: small metal loop/oval with a gate/latch — very distinct D or oval shape.
- tent: sloped or peaked fabric shelter with visible poles or pegs.
- boots: tall, sturdy footwear reaching at least to the ankle.
- map: rectangular sheet with visible lines, grid, or geographic markings.
- flashlight: cylindrical tube with a light-emitting end; headlamps also count.
- first aid kit: box or pouch with a clear red cross symbol OR labelled "first aid".

--- STEP 4: REASONING ---
Write a brief analysis listing all 10 items.
For each item state: visible (yes/no) and the reason why.

--- OUTPUT FORMAT ---
After the reasoning, return ONLY valid JSON with exactly these keys (no markdown, no extra text):
{
  "reasoning": "<your analysis>",
  "rope": <true/false>,
  "ice_axe": <true/false>,
  "backpack": <true/false>,
  "helmet": <true/false>,
  "carabiner": <true/false>,
  "tent": <true/false>,
  "boots": <true/false>,
  "map": <true/false>,
  "flashlight": <true/false>,
  "first_aid_kit": <true/false>
}
"""

PROMPT_DESERT = """\
You are an expert visual evaluator for a survival-gear design challenge.

TERRAIN: DESERT

--- STEP 1: UNDERSTAND THE TASK ---
The contestant was asked to craft a physical or drawn scene that contains EXACTLY 5 items
chosen from the following 10 official desert-terrain items:

   1. water bottle  – water bottle, canteen, hydration bladder, or flask
   2. compass       – a magnetic compass or digital compass
   3. tent          – a tent, tarp shelter, or shade canopy
   4. sunscreen     – a bottle or tube of sunscreen / sunblock / SPF lotion
   5. goggles       – sand/dust goggles or protective eyewear
   6. camel         – a one-humped (dromedary) or two-humped (Bactrian) camel
   7. map           – a map, navigation chart, or treasure map
   8. hat           – a wide-brimmed sun hat, Bedouin head covering, or sun cap
   9. knife         – a survival knife, Swiss Army knife, or multi-tool knife
  10. flare         – a signal flare, emergency flare gun, or smoke signal device

--- STEP 2: INSPECT THE IMAGE ---
Carefully examine every part of the image. Accept any clear representation:
drawn, painted, sculpted, printed, or a real physical object.

--- STEP 3: CLASSIFY EACH ITEM ---
For each of the 10 items, decide: is it CLEARLY and UNAMBIGUOUSLY present?
- Mark TRUE only if the item's key defining features are unmistakably recognizable.
- Do NOT mark TRUE for vague, ambiguous, or partially hidden shapes.
- Each item is judged independently.

Specific guidance:
- water bottle: a clearly bottle-shaped container; canteens and flasks count.
- compass: must show directional markings (N/S/E/W) or a needle.
- tent: sloped or peaked fabric shelter; a plain square box does NOT count.
- sunscreen: must be a tube or bottle with a pump/cap; label or SPF text confirms it.
- goggles: wrap-around protective eyewear with a strap; NOT plain glasses.
- camel: animal with one or two humps — unmistakable silhouette.
- map: rectangular sheet with visible lines, geographic details, or route markings.
- hat: wide brim all around or a head cloth/turban style; a baseball cap counts.
- knife: visible blade with a handle; a plain stick does NOT count.
- flare: cylindrical handheld device or pistol that emits bright light/smoke.

--- STEP 4: REASONING ---
Write a brief analysis listing all 10 items.
For each item state: visible (yes/no) and the reason why.

--- OUTPUT FORMAT ---
After the reasoning, return ONLY valid JSON with exactly these keys (no markdown, no extra text):
{
  "reasoning": "<your analysis>",
  "water_bottle": <true/false>,
  "compass": <true/false>,
  "tent": <true/false>,
  "sunscreen": <true/false>,
  "goggles": <true/false>,
  "camel": <true/false>,
  "map": <true/false>,
  "hat": <true/false>,
  "knife": <true/false>,
  "flare": <true/false>
}
"""

# Map each terrain to its prompt and the ordered list of JSON keys
TERRAIN_CONFIG = {
    "ocean": {
        "prompt": PROMPT_OCEAN,
        "keys": ["boat", "paddle", "life_jacket", "anchor", "fishing_rod",
                 "snorkel", "lighthouse", "flare_gun", "rope", "compass"],
        "labels": ["boat", "paddle", "life jacket", "anchor", "fishing rod",
                   "snorkel", "lighthouse", "flare gun", "rope", "compass"],
    },
    "mountain": {
        "prompt": PROMPT_MOUNTAIN,
        "keys": ["rope", "ice_axe", "backpack", "helmet", "carabiner",
                 "tent", "boots", "map", "flashlight", "first_aid_kit"],
        "labels": ["rope", "ice axe", "backpack", "helmet", "carabiner",
                   "tent", "boots", "map", "flashlight", "first aid kit"],
    },
    "desert": {
        "prompt": PROMPT_DESERT,
        "keys": ["water_bottle", "compass", "tent", "sunscreen", "goggles",
                 "camel", "map", "hat", "knife", "flare"],
        "labels": ["water bottle", "compass", "tent", "sunscreen", "goggles",
                   "camel", "map", "hat", "knife", "flare"],
    },
}


def score_round3(image_path: str, terrain: str) -> float:
    terrain = terrain.lower().strip()
    if terrain not in TERRAIN_CONFIG:
        raise ValueError(f"Unknown terrain '{terrain}'. Choose from: {list(TERRAIN_CONFIG)}")

    cfg    = TERRAIN_CONFIG[terrain]
    prompt = cfg["prompt"]
    keys   = cfg["keys"]
    labels = cfg["labels"]

    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(MODEL)
    image = Image.open(image_path)

    while True:
        try:
            response = model.generate_content([image, prompt])
            raw = response.text.strip()

            # Strip markdown code fences if the model wraps in ```json ... ```
            raw = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()

            # Extract JSON object from the response
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)
            if not json_match:
                raise ValueError("No JSON object found in response")

            data = json.loads(json_match.group())

            # Print reasoning if present
            reasoning = data.get("reasoning", "")
            if reasoning:
                print(f"Reasoning:\n{reasoning}\n")

            # Print per-item results
            print(f"Model JSON ({terrain}):")
            result_dict = {k: data.get(k, False) for k in keys}
            print(json.dumps(result_dict, indent=2))

            # ── Score computed fully in Python ────────────────────────────
            # Each of the 10 items is worth 20 points if correctly present.
            # Contestant is expected to craft 5 items → max score = 100.
            # Extra items (>5 found) do NOT give bonus points (capped at 5).
            score = 0
            for key, label in zip(keys, labels):
                if data.get(key, False):
                    score += 20

            # Cap at 100 (5 items × 20)
            score = min(score, 100)

            return float(score)

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
    import sys
    terrain = sys.argv[1] if len(sys.argv) > 1 else "ocean"
    score   = score_round3("submissions/round3.png", terrain)
    print(f"\nFinal Verified Score: {score}")