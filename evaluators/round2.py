import google.generativeai as genai
import os
from PIL import Image
import re
import time
from google.api_core.exceptions import ResourceExhausted

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL   = "gemini-3.1-flash-lite"

PROMPT = (
    "You are an expert image evaluator. Carefully analyze the provided image and assign a score out of 100.\n\n"

    "The final score is the sum of two independent components:\n\n"

    "1. AK-47 Detection (0 or 70 points):\n"
    "- Inspect the ENTIRE image thoroughly.\n"
    "- If an AK-47 rifle (or any clear AK-pattern rifle with banana magazine) is present, award 70 points.\n"
    "- If no AK-47 is visible, award 0 points.\n\n"

    "2. Object Color (0, 20, or 30 points):\n"
    "- If the main object is predominantly GOLD (shiny, metallic gold/yellow), award 30 points.\n"
    "- If the main object is predominantly YELLOW (plain yellow, not metallic gold), award 20 points.\n"
    "- Otherwise award 0 points.\n\n"

    "Final score = AK-47 score + Color score\n\n"

    "Scoring examples:\n"
    "- No AK-47, not yellow/gold → 0\n"
    "- No AK-47, yellow object → 20\n"
    "- No AK-47, gold object → 30\n"
    "- AK-47, not yellow/gold → 70\n"
    "- Yellow AK-47 → 90\n"
    "- Gold AK-47 → 100\n\n"

    "Think carefully, inspect every detail of the image, then respond with ONLY a single integer (e.g. 100)."
)


def evaluate(image_path: str) -> dict:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(MODEL)

    while True:
        try:
            image = Image.open(image_path)
            response = model.generate_content([image, PROMPT])
            raw = response.text.strip()
            print(f"[Round2] Raw Gemini response: {raw}")

            # Extract the first number (supports decimals)
            match = re.search(r'\b(100|\d{1,2}(?:\.\d+)?)\b', raw)
            score = float(match.group(1)) if match else 0.0
            score = min(max(score, 0.0), 100.0)
            print(f"[Round2] Score: {score}")
            return {"score": score}

        except ResourceExhausted:
            print("[Rate Limit] Waiting 15 seconds...")
            time.sleep(15)

        except Exception as e:
            print(f"[Round2] Error evaluating image: {e}")
            return {"score": 0.0}


if __name__ == "__main__":
    result = evaluate("../submissions/round2.png")
    print("Round 2 Score:", result["score"])