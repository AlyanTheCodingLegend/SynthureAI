# SynthureAI
Group Members:
1. Muhammad Abdullah Waqar : 458785
2. Alyan Ahmed Memon : 469355
3. Aakash :471368

An innovative application that uses AI to transform songs into the voices of popular artists, create playlists, and enable real-time collaborative music sessions.

## Features

- **AI Voice Transformation**: Convert any song to sound like it's sung by Rihanna, Drake, The Weeknd, Kanye West, Juice WRLD, or Michael Jackson using advanced SoVITS AI models
-  **Supbase**: Used supabase for the project due to its flexibility and ease of use.
- **Web Scraping**: Automatically search and download songs from YouTube using BeautifulSoup and Selenium
- **Local File Support**: Upload and transform your own MP3 files
- **Playlist Management**: Organize your transformed songs into custom playlists
- **User Profiles**: Personalize your experience with custom profile pictures
- **Collaborative Jamming**: Join real-time music sessions with other users via WebSockets

## Prerequisites

- Python 3.10.x
- Node.js and npm
- Modern web browser

## Installation

The project consists of three main components that need to be set up separately:

### 1. AI Voice Transformation and YT Scraper server in FastAPI

```bash
# Navigate to the AI engine directory from the project root
cd ./Ai-voice-clone/

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Websocket Server Backend

```bash
# Navigate to the backend directory from the project root
cd ./Backend/

# Install Node.js dependencies
npm install

# Start the backend server
npm run start
```

### 3. NextJS Frontend in ReactJS + Backend with DB queries

```bash
# Navigate to the frontend directory from the project root
cd ./frontend-next/

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```
