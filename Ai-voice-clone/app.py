import os
import io
import tempfile
import shutil
import uvicorn
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from enum import Enum
from typing import Optional
from huggingface_hub import hf_hub_download
import subprocess
import base64
from pathlib import Path
from fastapi.staticfiles import StaticFiles

# Create FastAPI app
app = FastAPI(
    title="Voice Transformation API",
    description="API for transforming vocal audio using different artist voice models",
    version="1.0.0"
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    """Serve the index.html file"""
    return FileResponse("static/index.html")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define available models
class ModelName(str, Enum):
    drake = "drake"
    weeknd = "weeknd"
    kanye = "kanye"
    michael_jackson = "michael_jackson"
    rihanna = "rihanna"
    juice = "juice"

# Model repository mapping
MODEL_REPOS = {
    ModelName.drake: {
        "repo_id": "Entreprenerdly/drake-so-vits-svc",
        "model_filename": "G_106000.pth",
        "config_filename": "config.json"
    },
    ModelName.weeknd: {
        "repo_id": "Entreprenerdly/weeknd-so-vits-svc",
        "model_filename": "G_riri_220.pth",
        "config_filename": "config.json"
    },
    ModelName.kanye: {
        "repo_id": "Entreprenerdly/kanye-so-vits-svc",
        "model_filename": "G_199200.pth",
        "config_filename": "config.json"
    },
    ModelName.michael_jackson: {
        "repo_id": "Entreprenerdly/michaeljackson-so-vits-svc",
        "model_filename": "G_83000.pth",
        "config_filename": "config.json"
    },
    ModelName.rihanna: {
        "repo_id": "Entreprenerdly/rihanna-so-vits-svc",
        "model_filename": "G_200000.pth",
        "config_filename": "config.json"
    },
    ModelName.juice: {
        "repo_id": "Entreprenerdly/juice-so-vits-svc",
        "model_filename": "G_163200.pth",
        "config_filename": "config.json"
    }
}

# Ensure models directory exists
MODELS_DIR = os.path.join(os.getcwd(), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# Create directories for each model
for model in ModelName:
    os.makedirs(os.path.join(MODELS_DIR, model.value), exist_ok=True)

# Create temporary directory for processing
TEMP_DIR = os.path.join(os.getcwd(), "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

def download_model_files(model_name: ModelName):
    """Download model and config files from Hugging Face if not already present"""
    model_info = MODEL_REPOS[model_name]
    model_dir = os.path.join(MODELS_DIR, model_name.value)
    
    config_path = os.path.join(model_dir, "config.json")
    model_path = os.path.join(model_dir, model_info["model_filename"])
    
    # Check if files already exist
    if not os.path.exists(config_path):
        print(f"Downloading config for {model_name.value}...")
        config_file = hf_hub_download(
            repo_id=model_info["repo_id"],
            filename=model_info["config_filename"],
            local_dir=model_dir,
            local_dir_use_symlinks=False
        )
    
    if not os.path.exists(model_path):
        print(f"Downloading model for {model_name.value}...")
        model_file = hf_hub_download(
            repo_id=model_info["repo_id"],
            filename=model_info["model_filename"],
            local_dir=model_dir,
            local_dir_use_symlinks=False
        )
    
    return {
        "config_path": config_path,
        "model_path": model_path
    }

async def process_audio(audio_path: str, model_name: ModelName):
    """Process audio file with the specified model"""
    model_info = MODEL_REPOS[model_name]
    model_dir = os.path.join(MODELS_DIR, model_name.value)
    
    # Ensure model files are downloaded
    paths = download_model_files(model_name)
    
    # Create a random filename for output to avoid conflicts
    output_filename = f"{os.path.splitext(os.path.basename(audio_path))[0]}.out.wav"
    output_path = os.path.join(TEMP_DIR, output_filename)
    
    # Remove output file if it exists
    if os.path.exists(output_path):
        os.remove(output_path)
    
    # Run the SVC inference command
    cmd = [
        "svc", "infer", 
        audio_path,
        "-m", paths["model_path"],
        "-c", paths["config_path"],
        "-o", output_path
    ]
    
    try:
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            check=True
        )
        print(f"Command output: {result.stdout}")
        
        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Failed to generate output file")
            
        return output_path
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e.stderr}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {e.stderr}")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Voice Transformation API",
        "available_models": [model.value for model in ModelName],
        "usage": "POST /transform with audio file and model_name"
    }

@app.get("/models")
async def list_models():
    """List available voice models"""
    return {
        "models": [
            {
                "name": model.value,
                "display_name": model.value.replace("_", " ").title(),
                "description": f"Transform your vocals to sound like {model.value.replace('_', ' ').title()}"
            }
            for model in ModelName
        ]
    }

class TransformResponse(BaseModel):
    success: bool
    model: str
    message: Optional[str] = None
    audio_base64: Optional[str] = None

@app.post("/transform", response_model=TransformResponse)
async def transform_audio(
    file: UploadFile = File(...), 
    model_name: ModelName = Form(...)
):
    """Transform uploaded audio with the specified model"""
    # Save uploaded file temporarily
    temp_audio_path = os.path.join(TEMP_DIR, f"input_{file.filename}")
    
    try:
        # Save uploaded file
        with open(temp_audio_path, "wb") as temp_file:
            content = await file.read()
            temp_file.write(content)
        
        # Process the audio
        output_path = await process_audio(temp_audio_path, model_name)
        
        # Encode the audio to base64 for response
        with open(output_path, "rb") as audio_file:
            audio_data = audio_file.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return TransformResponse(
            success=True,
            model=model_name.value,
            message="Audio successfully transformed",
            audio_base64=audio_base64
        )
        
    except Exception as e:
        return TransformResponse(
            success=False,
            model=model_name.value,
            message=f"Error processing audio: {str(e)}"
        )
    finally:
        # Clean up temporary files
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download a processed audio file"""
    file_path = os.path.join(TEMP_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path, 
        filename=filename, 
        media_type="audio/wav"
    )

@app.on_event("startup")
async def startup_event():
    """Execute on application startup"""
    print("Starting Voice Transformation API")
    # Create necessary directories
    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)

@app.on_event("shutdown")
async def shutdown_event():
    """Execute on application shutdown"""
    print("Shutting down Voice Transformation API")
    # Clean up temporary files
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
        os.makedirs(TEMP_DIR, exist_ok=True)

# For direct execution
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)