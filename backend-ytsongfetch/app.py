from flask import Flask, request, jsonify, send_file
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import requests
import tempfile
import time
from pytubefix import YouTube
import os
from pytubefix.cli import on_progress
import re

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--enable-unsafe-swiftshader")

driver = webdriver.Chrome(options=chrome_options)

app = Flask(__name__)

@app.route('/search', methods=['GET'])
def search_youtube():
    url = request.args.get('url', '')

    if not url:
        return jsonify({"error": "No url provided"}), 400
    
    print(url)
    
    # Encode the search string for YouTube
    try:
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
        # YouTube structure can change, so may need adjustment
        video_elements = soup.select("ytd-video-renderer, ytd-rich-item-renderer")
        
        if not video_elements:
            driver.quit()
            return jsonify({"error": "No videos found"}), 404
        
        first_video = video_elements[0]
        
        # Get video link
        video_link_element = first_video.select_one("a#video-title, a#thumbnail")
        if not video_link_element:
            driver.quit()
            return jsonify({"error": "Could not extract video link"}), 500
        
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
                return jsonify({"error": "Could not extract video ID"}), 500
            
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            
            # Get thumbnail image
            thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
            
            driver.quit()

            destination = os.path.join(os.getcwd(), 'songs')

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
            
            return jsonify(result)
        
    except Exception as e:
        if 'driver' in locals():
            driver.quit()
        return jsonify({"error": str(e)}), 500

@app.route('/thumbnail/<video_id>', methods=['GET'])
def get_thumbnail(video_id):
    """Route to return the actual image file"""
    try:
        # Download the thumbnail image
        thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        response = requests.get(thumbnail_url, stream=True)
        
        if response.status_code != 200:
            return jsonify({"error": "Could not download thumbnail"}), 500
        
        # Create a temporary file for the image
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        temp_filename = temp_file.name
        
        # Write the image to the temporary file
        with open(temp_filename, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        
        # Return the file
        return send_file(temp_filename, mimetype='image/jpeg')
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)