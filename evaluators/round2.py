import google.generativeai as genai
import os
from PIL import Image
import re

def evaluate(image_path):
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
    
    # Use gemini-1.5-flash for high quota (1,500 requests/day free) and great vision capabilities
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = (
        "You are an expert image evaluator. Analyze the provided image and assign a score out of 100.\n\n"

        "The final score is the sum of two independent components:\n\n"

        "1. AK-47 Detection (0 or 70 points):\n"
        "- If an AK-47 rifle is present in the image, award 70 points.\n"
        "- If no AK-47 is present, award 0 points.\n"
        "- Only count actual AK-47 rifles, not other firearms or similar-looking objects.\n\n"

        "2. Object Color (0, 20, or 30 points):\n"
        "- If the main object is predominantly GOLD, award 30 points.\n"
        "- If the main object is predominantly YELLOW (but not gold), award 20 points.\n"
        "- If the main object is neither predominantly gold nor predominantly yellow, award 0 points.\n"
        "- Evaluate the color independently of whether an AK-47 is present.\n\n"

        "The final score is:\n"
        "AK-47 score + Color score\n\n"

        "Examples:\n"
        "- No AK-47, not yellow/gold → 0\n"
        "- No AK-47, yellow object → 20\n"
        "- No AK-47, gold object → 30\n"
        "- AK-47, not yellow/gold → 70\n"
        "- Yellow AK-47 → 90\n"
        "- Gold AK-47 → 100\n\n"

        "Think carefully before answering. Return ONLY the final integer score (e.g., 90)."
    )
    
    try:
        image = Image.open(image_path)
        contents = [image, prompt]
        response = model.generate_content(contents)
        
        # Extract the numeric score from the model's response
        match = re.search(r'\b(100|\d{1,2}(?:\.\d+)?)\b', response.text)
        if match:
            return float(match.group(1))
    except Exception as e:
        print(f"Error evaluating image with Gemini: {e}")
        
    return 0.0

if __name__ == "__main__":
    score = evaluate("../submissions/round2.png")
    print("Round 2 Score:", score)