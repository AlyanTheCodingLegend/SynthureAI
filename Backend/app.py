from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/process_song_id', methods=['POST'])
def create_song():
    data = request.get_json()
    song_id = data.get("song_id")
    return jsonify({"song_id": song_id}), 200

if __name__ == '__main__':
    app.run(debug=True)
