from flask import Blueprint, request, Response, jsonify, render_template
from .utils import convert_markdown
import requests
import json
import time

chat_blueprint = Blueprint("chat", __name__)

API_URL = "http://localhost:11434/api/"

@chat_blueprint.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@chat_blueprint.route("/api/get-models", methods=["GET"])
def get_models():
    try:
        response = requests.get(API_URL + "tags")
        response.raise_for_status()

        models = response.json().get("models", [])

        return jsonify(models)
    
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@chat_blueprint.route("/api/chat", methods=["POST"])
def chat():
    session_id = request.form.get("conversation_id")
    
    user_message = request.form.get("message")
    messages_json = request.form.get("messages")
    model = request.form.get("model", "llama3.2")

    if not session_id or not user_message or not messages_json:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        messages = []
        raw_messages = json.loads(messages_json)

        raw_messages.pop(0)
        for msg in raw_messages:
            messages.append({
                "role": msg["role"],
                "content": msg["raw"] if "raw" in msg else msg["content"]
            })
            
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid messages JSON: {e}"}), 400

    def stream():
            thinking = False
            total_think_time = 0
            thinking_scheme = "tag"
            full_thinking_text = ""


            full_text = ""
            start_time = time.time()
            total_time_sec = 0
        

\
            with requests.post(API_URL+"chat", json={"model": model, "messages": messages}, stream=True) as resp:
                resp.raise_for_status()

                # Streaming
                for chunk in resp.iter_lines():
                    if not chunk:
                        continue

                    last_chunk = chunk
                    try:
                        data = json.loads(chunk.decode("utf-8"))
                    except json.JSONDecodeError:
                        continue

                    # Text parsing
                    message_data = data.get("message", {})
                    text = message_data.get("content", "")

                    # Think Handling
                    thinking_content = message_data.get("thinking", False)
                    if thinking_content:
                        thinking_scheme = "json"
                        if not thinking:
                            thinking = True
                            full_thinking_text += "<think>"
                        full_thinking_text += thinking_content
                        text = thinking_content

                    elif "<think>" in text:
                        thinking_scheme = "tag"
                        if not thinking:
                            thinking = True
                        full_thinking_text += "<think>"

                    if thinking_scheme == "json" and not thinking_content and thinking:
                        thinking = False
                        total_think_time += time.time() - start_time
                        full_thinking_text += "</think>"

                    if "</think>" in text and thinking:
                        thinking = False
                        total_think_time += time.time() - start_time
                        full_thinking_text += "</think>"

                    if thinking and thinking_scheme == "tag" and text not in ["<think>", "</think>"]:
                        full_thinking_text += text

                    # Streaming text
                    yield text
                    if not thinking:
                        full_text += text

                    # End 
                    if data.get("done", False):

                        meta = {
                            "done_reason": data.get("done_reason"),
                            "total_time_sec": total_time_sec,
                            "total_think_time_sec": total_think_time,
                            "model": data.get("model"),
                        }

                        yield full_text+f"\n<!--END-->\n" + convert_markdown(full_thinking_text, full_text)
                        yield f"\n<script>window.chatMeta = {json.dumps(meta)};</script>"
                        break


    return Response(stream(), mimetype="text/html")