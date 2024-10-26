from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
import torch
from transformers import BertTokenizer
import random
import logging
import re

logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

class TextData(BaseModel):
    content: str

# Global variables to store data
original_data = ""
preprocessed_data = ""
augmented_data = ""

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global original_data
    content = await file.read()
    original_data = content.decode("utf-8")
    logging.info(f"File uploaded: {file.filename}, content length: {len(original_data)}")
    return JSONResponse(content={
        "message": "File uploaded successfully", 
        "sample": original_data[:100], 
        "full_content": original_data,
        "word_count": get_word_count(original_data),
        })

@app.post("/preprocess")
async def preprocess():
    global original_data, preprocessed_data
    if not original_data:
        raise HTTPException(status_code=400, detail="No data uploaded")
    
    tokens = tokenizer.tokenize(original_data)
    preprocessed_data = " ".join(tokens)
    logging.info(f"Data preprocessed, length: {len(preprocessed_data)}")
    return JSONResponse(content={
        "sample": preprocessed_data[:100], 
        "full_content": preprocessed_data,
        "token_count": len(preprocessed_data.split(' ')),
        })

@app.post("/augment")
async def augment():
    global preprocessed_data, augmented_data
    if not preprocessed_data:
        raise HTTPException(status_code=400, detail="Data not preprocessed")
    
    tokens = preprocessed_data.split()
    for i in range(len(tokens)):
        if random.random() < 0.1:
            j = random.randint(0, len(tokens) - 1)
            tokens[i], tokens[j] = tokens[j], tokens[i]
    
    augmented_data = " ".join(tokens)
    logging.info(f"Data augmented, length: {len(augmented_data)}")
    return JSONResponse(content={
        "sample": augmented_data[:100], 
        "full_content": augmented_data,
        "token_count": len(augmented_data.split(' ')),
        })


def get_word_count(text):
    """
    remove all newlines, tabs, and carriage return & replace multiple whitespace with a single blank
    """
    cleaned_text = re.sub(r'[\n\t\r]', ' ', text).strip()
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
    word_count = len(cleaned_text.split(' '))
    return word_count

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)