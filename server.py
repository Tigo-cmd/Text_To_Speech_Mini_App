from flask import Flask, request, jsonify, send_file
from groq import Groq
from flask_cors import CORS
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

# Create Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Flask app setup
app = Flask(__name__)
CORS(app)

# Output directory
OUTPUT_DIR = Path(app.root_path) / "tts_outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

# Store tasks in-memory for demo
tasks: dict[str, Path] = {}

@app.route("/api/tts", methods=["POST"])
def tts():
    try:
        data = request.get_json(force=True)

        # Extract fields
        text = data.get("text", "").strip()
        voice = data.get("voice", "Fritz-PlayAI")

        if not text:
            return jsonify({"message": "Missing required 'text' field."}), 400

        # Validate voice
        SUPPORTED_VOICES = [
            "Arista-PlayAI", "Atlas-PlayAI", "Basil-PlayAI", "Briggs-PlayAI",
            "Calum-PlayAI", "Celeste-PlayAI", "Cheyenne-PlayAI", "Chip-PlayAI",
            "Cillian-PlayAI", "Deedee-PlayAI", "Fritz-PlayAI", "Gail-PlayAI",
            "Indigo-PlayAI", "Mamaw-PlayAI", "Mason-PlayAI", "Mikail-PlayAI",
            "Mitch-PlayAI", "Quinn-PlayAI", "Thunder-PlayAI", "Aaliyah-PlayAI"
        ]
        if voice not in SUPPORTED_VOICES:
            return jsonify({"message": f"Unsupported voice '{voice}'"}), 400

        # Generate unique task ID and output path
        task_id = uuid.uuid4().hex
        out_path = OUTPUT_DIR / f"{task_id}.wav"

        # Generate speech and stream to file
        response = client.audio.speech.create(
            model="playai-tts",
            voice=voice,
            input=text,
            response_format="wav"
        )
        response.write_to_file(out_path)

        tasks[task_id] = out_path
        return jsonify({"taskId": task_id}), 200

    except Exception as e:
        # Handle terms acceptance error
        if getattr(e, 'code', '') == 'model_terms_required' or 'model_terms_required' in str(e):
            return jsonify({
                "message": "Please accept the playai-tts terms at https://console.groq.com/playground?model=playai-tts"
            }), 400

        import traceback; traceback.print_exc()
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route("/api/tts/<task_id>", methods=["GET"])
def get_audio(task_id):
    path = tasks.get(task_id)
    if not path or not path.exists():
        return "", 202  # still processing
    return send_file(path, mimetype="audio/wav")

@app.route("/api/tts/voices", methods=["GET"])
def list_voices():
    voices = [
        "Arista-PlayAI", "Atlas-PlayAI", "Basil-PlayAI", "Briggs-PlayAI", "Calum-PlayAI",
        "Celeste-PlayAI", "Cheyenne-PlayAI", "Chip-PlayAI", "Cillian-PlayAI", "Deedee-PlayAI",
        "Fritz-PlayAI", "Gail-PlayAI", "Indigo-PlayAI", "Mamaw-PlayAI", "Mason-PlayAI",
        "Mikail-PlayAI", "Mitch-PlayAI", "Quinn-PlayAI", "Thunder-PlayAI", "Aaliyah-PlayAI"
    ]
    return jsonify([
        {"id": v, "name": v, "language": "en-US", "gender": "neutral"}
        for v in voices
    ])

if __name__ == "__main__":
    app.run(port=3000, debug=True)
