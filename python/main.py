from fastapi import FastAPI
from dotenv import load_dotenv
import numpy as np
import os

load_dotenv()

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}

print("Starting FastAPI server...")