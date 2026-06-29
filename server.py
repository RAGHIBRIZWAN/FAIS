import os
import shutil
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from evaluators.round1 import score_key
from evaluators.round2 import evaluate as score_ak
from evaluators.round3 import score_round3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("submissions", exist_ok=True)

@app.post("/api/evaluate/round1")
async def evaluate_round1(image: UploadFile = File(...)):
    path = f"submissions/round1_{image.filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    result = score_key(path)
    return result if isinstance(result, dict) else {"score": result, "details": {}}

@app.post("/api/evaluate/round2")
async def evaluate_round2(image: UploadFile = File(...)):
    path = f"submissions/round2_{image.filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    result = score_ak(path)
    return result if isinstance(result, dict) else {"score": result}

@app.post("/api/evaluate/round3")
async def evaluate_round3(terrain: str = Form(...), image: UploadFile = File(...)):
    path = f"submissions/round3_{image.filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    result = score_round3(path, terrain)
    return result if isinstance(result, dict) else {"score": result, "details": {}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
