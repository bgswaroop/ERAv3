from fastapi import FastAPI, File, UploadFile, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse

app = FastAPI()

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Animal images
animal_images = {
    "cat": "/static/images/cat.jpg",
    "dog": "/static/images/dog.jpg",
    "elephant": "/static/images/elephant.jpg"
}

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/animal/{animal}")
async def get_animal(animal: str):
    if animal in animal_images:
        return JSONResponse({"image_url": animal_images[animal]})
    return JSONResponse({"error": "Animal not found"}, status_code=404)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "file_size": file.size,
        "content_type": file.content_type
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)