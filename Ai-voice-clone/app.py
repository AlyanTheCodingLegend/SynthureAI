import os
import io
import tempfile
import shutil
import uvicorn
import requests
import uuid
import random
import json
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Body
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from enum import Enum
from typing import Optional, List
from huggingface_hub import hf_hub_download
import subprocess
import base64
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from supabase import create_client, Client
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Voice Transformation API",
    description="API for transforming vocal audio using different artist voice models",
    version="1.0.0"
)

# Supabase configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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
        "config_filename": "config.json",
        "image_url": "https://example.com/images/drake.jpg"
    },
    ModelName.weeknd: {
        "repo_id": "Entreprenerdly/weeknd-so-vits-svc",
        "model_filename": "G_riri_220.pth",
        "config_filename": "config.json",
        "image_url": "https://example.com/images/weeknd.jpg"
    },
    ModelName.kanye: {
        "repo_id": "Entreprenerdly/kanye-so-vits-svc",
        "model_filename": "G_199200.pth",
        "config_filename": "config.json",
        "image_url": "https://example.com/images/kanye.jpg"
    },
    ModelName.michael_jackson: {
        "repo_id": "Entreprenerdly/michaeljackson-so-vits-svc",
        "model_filename": "G_83000.pth",
        "config_filename": "config.json",
        "image_url": "https://example.com/images/michael_jackson.jpg"
    },
    ModelName.rihanna: {
        "repo_id": "Entreprenerdly/rihanna-so-vits-svc",
        "model_filename": "G_200000.pth",
        "config_filename": "config.json",
        "image_url": "https://example.com/images/rihanna.jpg"
    },
    ModelName.juice: {
        "repo_id": "Entreprenerdly/juice-so-vits-svc",
        "model_filename": "G_163200.pth",
        "config_filename": "config.json",
        "image_url": "https://example.com/images/juice.jpg"
    }
}

# Replace placeholder image URLs with actual images
# These are just examples, replace with actual URLs as needed
ARTIST_IMAGES = {
    "drake": "https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9",
    "weeknd": "https://i.scdn.co/image/ab6761610000e5eb8e89e1f7bf47835c6c6c733f",
    "kanye": "https://i.scdn.co/image/ab6761610000e5eb867008652397ef6f18736a51",
    "michael_jackson": "https://i.scdn.co/image/ab6761610000e5ebb45f44a8668d479e6b2ffa6d",
    "rihanna": "https://i.scdn.co/image/ab6761610000e5eb99e4fca7c0b7cb166d915789",
    "juice": "https://i.scdn.co/image/ab6761610000e5eba00b11c129b27a88fc72f36b"
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

class SongTransformRequest(BaseModel):
    song_url: str
    username: str
    artist: ModelName

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

async def download_song_from_url(song_url: str) -> str:
    """Download song from URL to temporary directory"""
    try:
        response = requests.get(song_url, stream=True)
        response.raise_for_status()
        
        # Extract filename from URL or generate a random one if not possible
        filename = f"temp_song_{uuid.uuid4().hex}.mp3"
        file_path = os.path.join(TEMP_DIR, filename)
        
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        return file_path
    except Exception as e:
        print(f"Error downloading song: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to download song: {str(e)}")

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

async def upload_to_supabase(file_path: str, artist: str) -> str:
    """Upload transformed audio to Supabase storage and return the URL"""
    try:
        # Generate a unique file name
        file_name = f"{uuid.uuid4().hex}.wav"
        bucket_path = f"songs/{file_name}"
        
        # Read file content
        with open(file_path, "rb") as f:
            file_content = f.read()
        
        # Upload to Supabase storage
        storage_response = supabase.storage.from_("songs").upload(
            path=file_name,
            file=file_content,
            file_options={"content-type": "audio/wav"}
        )
        
        # Generate public URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/songs/{file_name}"
        return public_url
    except Exception as e:
        print(f"Error uploading to Supabase: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload to Supabase: {str(e)}")

async def store_song_info_in_db(
    artist_name: str,
    image_path: str,
    song_name: str,
    song_path: str,
    username: str
):
    """Store song information in the Supabase database"""
    try:
        # Prepare data for insertion
        song_data = {
            "artist_name": artist_name,
            "image_path": image_path,
            "is_AI_gen": True,
            "song_name": song_name,
            "song_path": song_path,
            "uploaded_by": username,
            "is_YT_fetched": False,
            "created_at": datetime.now().isoformat()
        }
        
        # Insert data into the database
        response = supabase.table("song_information").insert(song_data).execute()
        
        # Check for errors
        if hasattr(response, 'error') and response.error:
            print(f"DB insertion error: {response.error}")
            raise HTTPException(status_code=500, detail=f"Database insertion failed: {response.error}")
        
        return response.data
    except Exception as e:
        print(f"Error storing data in DB: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to store song information: {str(e)}")

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
    song_details: Optional[dict] = None

@app.post("/transform", response_model=TransformResponse)
async def transform_audio_file(
    file: UploadFile = File(...), 
    model_name: ModelName = Form(...),
    username: str = Form(...)
):
    """Transform uploaded audio file with the specified model"""
    # Save uploaded file temporarily
    temp_audio_path = os.path.join(TEMP_DIR, f"input_{file.filename}")
    
    try:
        # Save uploaded file
        with open(temp_audio_path, "wb") as temp_file:
            content = await file.read()
            temp_file.write(content)
        
        # Process the audio
        output_path = await process_audio(temp_audio_path, model_name)
        
        # Upload to Supabase storage
        song_path = await upload_to_supabase(output_path, model_name.value)
        
        # Generate song name
        original_name = os.path.splitext(file.filename)[0]
        song_name = f"{original_name} ({model_name.value.replace('_', ' ').title()} AI Version)"
        
        # Get artist image
        image_path = ARTIST_IMAGES.get(model_name.value, "https://example.com/default.jpg")
        
        # Store in database
        db_response = await store_song_info_in_db(
            artist_name=model_name.value.replace('_', ' ').title(),
            image_path=image_path,
            song_name=song_name,
            song_path=song_path,
            username=username
        )
        
        # Encode the audio to base64 for response
        with open(output_path, "rb") as audio_file:
            audio_data = audio_file.read()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return TransformResponse(
            success=True,
            model=model_name.value,
            message="Audio successfully transformed and stored",
            audio_base64=audio_base64,
            song_details={
                "artist_name": model_name.value.replace('_', ' ').title(),
                "song_name": song_name,
                "song_path": song_path
            }
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

@app.post("/transform-from-url")
async def transform_from_url(request: SongTransformRequest):
    """Download song from URL, transform it with the specified model, and store it in the database"""
    try:
        # Download song from URL
        temp_audio_path = await download_song_from_url(request.song_url)
        
        # Process the audio
        output_path = await process_audio(temp_audio_path, request.artist)
        
        # Upload transformed song to Supabase storage
        song_path = await upload_to_supabase(output_path, request.artist.value)
        
        # Generate song name
        # Extract song name from URL or use a generic name
        original_name = os.path.splitext(os.path.basename(request.song_url.split('?')[0]))[0]
        if not original_name or original_name == "":
            original_name = f"Song_{uuid.uuid4().hex[:6]}"
        
        song_name = f"{original_name} ({request.artist.value.replace('_', ' ').title()} AI Version)"
        
        # Get artist image
        image_path = ARTIST_IMAGES.get(request.artist.value, "https://example.com/default.jpg")
        
        # Store in database
        db_response = await store_song_info_in_db(
            artist_name=request.artist.value.replace('_', ' ').title(),
            image_path=image_path,
            song_name=song_name,
            song_path=song_path,
            username=request.username
        )
        
        return {
            "success": True,
            "message": "Song transformed and stored successfully",
            "song_details": {
                "artist_name": request.artist.value.replace('_', ' ').title(),
                "song_name": song_name,
                "song_path": song_path,
                "username": request.username
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Error processing song: {str(e)}"
        }
    finally:
        # Clean up temporary files
        if os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except:
                pass
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except:
                pass

@app.on_event("startup")
async def startup_event():
    """Execute on application startup"""
    print("Starting Voice Transformation API with Supabase integration")
    # Create necessary directories
    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # Test Supabase connection
    try:
        supabase_info = supabase.table("song_information").select("id").limit(1).execute()
        print("Supabase connection successful")
    except Exception as e:
        print(f"Warning: Supabase connection failed: {e}")

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