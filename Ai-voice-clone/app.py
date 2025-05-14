import os
import shutil
import uvicorn
import requests
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from enum import Enum
from typing import Optional
from huggingface_hub import hf_hub_download
import subprocess
import base64
from fastapi.staticfiles import StaticFiles
from supabase import create_client, Client
from datetime import datetime
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from pytubefix import YouTube
from pytubefix.cli import on_progress
import re
import time
import spleeter
from spleeter.separator import Separator
import contextlib
import librosa
import soundfile as sf
from pydub import AudioSegment
import numpy as np
import asyncio
import traceback
from functools import wraps

load_dotenv()

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--enable-unsafe-swiftshader")

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

# Create directory for separated audio components
SEPARATED_DIR = os.path.join(TEMP_DIR, "separated")
os.makedirs(SEPARATED_DIR, exist_ok=True)

# Initialize Spleeter separator
SEPARATOR = Separator('spleeter:2stems')

class SongTransformRequest(BaseModel):
    song_url: str
    username: str
    artist: ModelName

def async_transaction(func):
    """Decorator for handling transaction management in async functions"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            # Start transaction context
            print(f"Starting transaction for {func.__name__}")
            result = await func(*args, **kwargs)
            print(f"Transaction successful for {func.__name__}")
            return result
        except Exception as e:
            print(f"Transaction failed for {func.__name__}: {str(e)}")
            print(traceback.format_exc())
            # Cleanup any resources if needed
            raise e
    return wrapper

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

async def separate_vocals_and_background(audio_path: str) -> dict:
    """Separate vocals and background music using Spleeter"""
    try:
        # Generate a unique ID for this separation
        separation_id = uuid.uuid4().hex
        output_dir = os.path.join(SEPARATED_DIR, separation_id)
        os.makedirs(output_dir, exist_ok=True)
        
        # Separate audio
        SEPARATOR.separate_to_file(audio_path, output_dir)
        
        # Get the base filename
        base_filename = os.path.splitext(os.path.basename(audio_path))[0]
        
        # Get paths to separated files
        vocals_path = os.path.join(output_dir, base_filename, "vocals.wav")
        accompaniment_path = os.path.join(output_dir, base_filename, "accompaniment.wav")
        
        # Check if files exist
        if not os.path.exists(vocals_path) or not os.path.exists(accompaniment_path):
            raise HTTPException(status_code=500, detail="Failed to separate audio components")
        
        return {
            "vocals_path": vocals_path,
            "accompaniment_path": accompaniment_path,
            "separation_id": separation_id
        }
    except Exception as e:
        print(f"Error separating audio: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to separate audio: {str(e)}")

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

async def merge_vocals_with_background(transformed_vocals_path: str, background_path: str) -> str:
    """Merge transformed vocals with original background music"""
    try:
        # Generate output filename
        output_filename = f"merged_{uuid.uuid4().hex}.wav"
        output_path = os.path.join(TEMP_DIR, output_filename)
        
        # Load audio files
        vocals, vocals_sr = librosa.load(transformed_vocals_path, sr=None)
        background, bg_sr = librosa.load(background_path, sr=None)
        
        # Ensure same sample rate
        if vocals_sr != bg_sr:
            background = librosa.resample(background, orig_sr=bg_sr, target_sr=vocals_sr)
        
        # Ensure same length
        if len(vocals) > len(background):
            # Pad background with zeros
            background = np.pad(background, (0, len(vocals) - len(background)))
        elif len(background) > len(vocals):
            # Trim background to match vocals length
            background = background[:len(vocals)]
        
        # Mix vocals with background (adjust volume levels as needed)
        vocals_volume = 1.0  # Adjust as needed
        bg_volume = 0.5      # Adjust as needed
        mixed = (vocals * vocals_volume) + (background * bg_volume)
        
        # Normalize to prevent clipping
        max_val = np.max(np.abs(mixed))
        if max_val > 1.0:
            mixed = mixed / max_val * 0.95
        
        # Write to file
        sf.write(output_path, mixed, vocals_sr)
        
        return output_path
    except Exception as e:
        print(f"Error merging audio: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to merge audio: {str(e)}")

@async_transaction
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

@async_transaction
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
@async_transaction
async def transform_audio_file(
    file: UploadFile = File(...), 
    model_name: ModelName = Form(...),
    username: str = Form(...),
    separate_bg: bool = Form(True)
):
    """Transform uploaded audio file with the specified model"""
    # Save uploaded file temporarily
    temp_audio_path = os.path.join(TEMP_DIR, f"input_{uuid.uuid4().hex}_{file.filename}")
    
    # Keep track of temporary files to clean up
    temp_files = [temp_audio_path]
    
    try:
        # Save uploaded file
        with open(temp_audio_path, "wb") as temp_file:
            content = await file.read()
            temp_file.write(content)
        
        if separate_bg:
            # Separate vocals and background
            separated = await separate_vocals_and_background(temp_audio_path)
            vocals_path = separated["vocals_path"]
            background_path = separated["accompaniment_path"]
            temp_files.extend([vocals_path, background_path])
            
            # Process the vocals
            transformed_vocals_path = await process_audio(vocals_path, model_name)
            temp_files.append(transformed_vocals_path)
            
            # Merge transformed vocals with background
            output_path = await merge_vocals_with_background(transformed_vocals_path, background_path)
            temp_files.append(output_path)
        else:
            # Process the whole audio without separation
            output_path = await process_audio(temp_audio_path, model_name)
            temp_files.append(output_path)
        
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
        for temp_file in temp_files:
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception as e:
                    print(f"Error removing temp file {temp_file}: {e}")

@app.post("/transform-from-url")
@async_transaction
async def transform_from_url(request: SongTransformRequest):
    """Download song from URL, transform it with the specified model, and store it in the database"""
    # Keep track of temporary files to clean up
    temp_files = []
    
    try:
        # Download song from URL
        temp_audio_path = await download_song_from_url(request.song_url)
        temp_files.append(temp_audio_path)
        
        # Separate vocals and background
        separated = await separate_vocals_and_background(temp_audio_path)
        vocals_path = separated["vocals_path"]
        background_path = separated["accompaniment_path"]
        temp_files.extend([vocals_path, background_path])
        
        # Process the vocals
        transformed_vocals_path = await process_audio(vocals_path, request.artist)
        temp_files.append(transformed_vocals_path)
        
        # Merge transformed vocals with background
        output_path = await merge_vocals_with_background(transformed_vocals_path, background_path)
        temp_files.append(output_path)
        
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
        for temp_file in temp_files:
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception as e:
                    print(f"Error removing temp file {temp_file}: {e}")

class SearchResponse(BaseModel):
    thumbnail_url: str
    path: str
    file_name: str
    song_name: str

@app.get("/search", response_model=SearchResponse)
@async_transaction
async def search_youtube(url: Optional[str] = Query(None)):
    if not url:
        raise HTTPException(status_code=400, detail="No url provided")
    
    driver = None
    try:
        driver = webdriver.Chrome(options=chrome_options)
        # Setup headless Chrome browser
        driver.get(url)
        
        # Wait for search results to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "contents"))
        )
        
        # Give a little extra time for JavaScript to render
        time.sleep(2)
        
        # Get the page source after JavaScript has rendered the content
        page_source = driver.page_source
        
        # Parse with BeautifulSoup
        soup = BeautifulSoup(page_source, 'html.parser')
        
        # Find the first video result
        video_elements = soup.select("ytd-video-renderer, ytd-rich-item-renderer")
        
        if not video_elements:
            driver.quit()
            raise HTTPException(status_code=404, detail="No videos found")
        
        first_video = video_elements[0]
        
        # Get video link
        video_link_element = first_video.select_one("a#video-title, a#thumbnail")
        if not video_link_element:
            driver.quit()
            raise HTTPException(status_code=500, detail="Could not extract video link")
        
        video_id = None
        if video_link_element.has_attr('href'):
            href = video_link_element['href']
            if href.startswith('/watch?v='):
                video_id = href.split('v=')[1].split('&')[0]
            else:
                # Try to find video ID elsewhere
                video_link_elements = first_video.select("a")
                for element in video_link_elements:
                    if element.has_attr('href') and '/watch?v=' in element['href']:
                        video_id = element['href'].split('v=')[1].split('&')[0]
                        break
        
        if not video_id:
            driver.quit()
            raise HTTPException(status_code=500, detail="Could not extract video ID")
            
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        
        # Get thumbnail image
        thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        
        if driver:
            driver.quit()

        destination = os.path.join(os.getcwd(), 'temp')

        yt = YouTube(video_url, on_progress_callback=on_progress)
        cleaned_title = re.sub(r'[^\w\s]', '', yt.title).replace(" ", "_")

        ys = yt.streams.get_audio_only()
        ys.download(output_path=destination, filename=f"{cleaned_title}.mp3")
        
        # Return the result
        result = {
            "thumbnail_url": thumbnail_url,
            "path": os.path.join(destination, f"{cleaned_title}.mp3"),
            "file_name": f"{cleaned_title}.mp3",
            "song_name": yt.title,
        }
        
        return result
        
    except Exception as e:
        if driver:
            driver.quit()
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    """Execute on application startup"""
    print("Starting Voice Transformation API with Supabase integration")
    # Create necessary directories
    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(SEPARATED_DIR, exist_ok=True)
    
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
        os.makedirs(SEPARATED_DIR, exist_ok=True)

# For direct execution
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)