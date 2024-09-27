import os
import subprocess
import tempfile
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

app = FastAPI()

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
client = MongoClient("mongodb+srv://admin:HAPj7dKeeZfSTyi3@cluster0.qtlcckk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client['code_playground']
codes_collection = db['codes']

class CodeSubmission(BaseModel):
    code: str
    language: str

@app.post("/api/save-code")
async def save_code(submission: CodeSubmission):
    # Save the code to MongoDB
    result = codes_collection.update_one(
        {"language": submission.language},  # Filter by language
        {"$set": submission.model_dump()},  # Update the document with the new code
        upsert=True  # Insert a new document if none matches the filter
    )
    
    if result.upserted_id:
        return {"message": "Code Submitted", "id": str(result.upserted_id)}
    else:
        return {"message": "Code Updated"}

@app.get("/api/last-code/{language}")
async def get_last_code(language:str):
    # Retrieve the last submitted code
    last_code = codes_collection.find_one({"language":language})
    if last_code:
        return {"code": last_code['code'], "language":language}
    raise HTTPException(status_code=404, detail="No code found")

