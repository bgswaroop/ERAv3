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
import shutil
import os
import uuid
from PIL import Image
import numpy as np
import torchvision.transforms as transforms

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
image_file_path = ""

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

@app.on_event("startup")
async def startup_event():
    clear_uploads()

@app.on_event("shutdown")
async def shutdown_event():
    clear_uploads()

def clear_uploads():
    upload_dir = "static/uploads"
    if os.path.exists(upload_dir):
        for filename in os.listdir(upload_dir):
            file_path = os.path.join(upload_dir, filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
                    logging.info(f"Deleted file: {file_path}")
            except Exception as e:
                logging.error(f"Error deleting file {file_path}: {e}")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    clear_uploads()
    return templates.TemplateResponse("text.html", {"request": request})

@app.get("/text", response_class=HTMLResponse)
async def text_processing(request: Request):
    clear_uploads()
    return templates.TemplateResponse("text.html", {"request": request})

@app.get("/image", response_class=HTMLResponse)
async def image_processing(request: Request):
    clear_uploads()
    return templates.TemplateResponse("image.html", {"request": request})

@app.get("/audio", response_class=HTMLResponse)
async def audio_processing(request: Request):
    clear_uploads()
    return templates.TemplateResponse("audio.html", {"request": request})

@app.get("/3d", response_class=HTMLResponse)
async def three_d_processing(request: Request):
    clear_uploads()
    return templates.TemplateResponse("3d.html", {"request": request})

@app.post("/text/upload")
async def upload_text_file(file: UploadFile = File(...)):
    global original_data
    content = await file.read()
    original_data = content.decode("utf-8")
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "w") as buffer:
        buffer.write(original_data)
    
    logging.info(f"Text file uploaded: {file.filename}, saved to: {file_path}")
    return JSONResponse(content={
        "message": "File uploaded successfully", 
        "sample": original_data[:100], 
        "full_content": original_data,
        "word_count": get_word_count(original_data),
    })

@app.post("/text/preprocess")
async def preprocess_text():
    global original_data, preprocessed_data
    if not original_data:
        raise HTTPException(status_code=400, detail="No text data uploaded")
    
    tokens = tokenizer.tokenize(original_data)
    preprocessed_data = " ".join(tokens)
    logging.info(f"Text data preprocessed, length: {len(preprocessed_data)}")
    return JSONResponse(content={
        "sample": preprocessed_data[:100], 
        "full_content": preprocessed_data,
        "token_count": len(preprocessed_data.split()),
        "word_count": get_word_count(preprocessed_data),
    })

@app.post("/text/augment")
async def augment_text():
    global preprocessed_data, augmented_data
    if not preprocessed_data:
        raise HTTPException(status_code=400, detail="Text data not preprocessed")
    
    tokens = preprocessed_data.split()
    for i in range(len(tokens)):
        if random.random() < 0.1:
            j = random.randint(0, len(tokens) - 1)
            tokens[i], tokens[j] = tokens[j], tokens[i]
    
    augmented_data = " ".join(tokens)
    logging.info(f"Text data augmented, length: {len(augmented_data)}")
    return JSONResponse(content={
        "sample": augmented_data[:100], 
        "full_content": augmented_data,
        "token_count": len(augmented_data.split()),
        "word_count": get_word_count(augmented_data),
    })

def get_word_count(text):
    """
    Remove all newlines, tabs, and carriage returns & replace multiple whitespace with a single blank
    """
    cleaned_text = re.sub(r'[\n\t\r]', ' ', text).strip()
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
    word_count = len(cleaned_text.split())
    return word_count

@app.post("/image/upload")
async def upload_image_file(file: UploadFile = File(...)):
    global image_file_path
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    image_file_path = file_path
    logging.info(f"Image file uploaded: {file.filename}, saved to: {file_path}")
    return JSONResponse(content={
        "message": "File uploaded successfully", 
        "file_url": f"/static/uploads/{unique_filename}"
    })

@app.post("/image/preprocess")
async def preprocess_image():
    global image_file_path
    if not image_file_path:
        raise HTTPException(status_code=400, detail="No image uploaded")
    
    image = Image.open(image_file_path)
    preprocess = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    image_tensor = preprocess(image)
    image_np = image_tensor.numpy().transpose(1, 2, 0)
    image_np = (image_np - image_np.min()) / (image_np.max() - image_np.min()) * 255
    image_np = image_np.astype(np.uint8)
    preprocessed_image = Image.fromarray(image_np)
    preprocessed_image_path = save_image(preprocessed_image, "preprocessed")
    
    return JSONResponse(content={
        "full_content": f"/static/uploads/{preprocessed_image_path}",
        "message": "Subtracted mean and divided by standard deviation. Rescaled for visualization."
    })

@app.post("/image/augment")
async def augment_image():
    global image_file_path
    if not image_file_path:
        raise HTTPException(status_code=400, detail="No image uploaded")
    
    image = Image.open(image_file_path)
    augment = transforms.Compose([
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(30),
        transforms.ToTensor()
    ])
    image_tensor = augment(image)
    image_np = image_tensor.numpy().transpose(1, 2, 0)
    image_np = (image_np - image_np.min()) / (image_np.max() - image_np.min()) * 255
    image_np = image_np.astype(np.uint8)
    augmented_image = Image.fromarray(image_np)
    augmented_image_path = save_image(augmented_image, "augmented")
    
    return JSONResponse(content={
        "full_content": f"/static/uploads/{augmented_image_path}",
        "message": "Applied random transformations (horizontal flip and rotate). Rescaled for visualization."
    })

def save_image(image, prefix):
    upload_dir = "static/uploads"
    unique_filename = f"{prefix}_{uuid.uuid4()}.png"
    file_path = os.path.join(upload_dir, unique_filename)
    image.save(file_path)
    logging.info(f"Image saved: {file_path}")
    return unique_filename

@app.post("/audio/upload")
async def upload_audio_file(file: UploadFile = File(...)):
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    logging.info(f"Audio file uploaded: {file.filename}, saved to: {file_path}")
    return JSONResponse(content={
        "message": "File uploaded successfully", 
        "file_url": f"/static/uploads/{unique_filename}"
    })

@app.post("/3d/upload")
async def upload_3d_file(file: UploadFile = File(...)):
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    logging.info(f"3D file uploaded: {file.filename}, saved to: {file_path}")
    return JSONResponse(content={
        "message": "File uploaded successfully", 
        "file_url": f"/static/uploads/{unique_filename}"
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)