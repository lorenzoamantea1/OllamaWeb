from flask import Blueprint, request, Response, jsonify
import json
import requests
from .utils import convert_markdown
import re, time

chat_blueprint = Blueprint("chat", __name__)

API_URL = "http://localhost:11434/api/chat"

@chat_blueprint.route("/chat", methods=["POST"])
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

        for msg in raw_messages:
            messages.append({
                "role": msg["role"],
                "content": msg["raw"] if "raw" in msg else msg["content"]
            })
            
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid messages JSON: {e}"}), 400

    def stream():
        full_thinking_text = ""
        full_text = ""
        last_chunk = None
        thinking = False
        last_thinking_len = 0
        last_text_len = 0

        start_time = time.time()
        think_start = None
        total_think_time = 0

        try:
            with requests.post(API_URL, json={"model": model, "messages": messages}, stream=True) as resp:
                resp.raise_for_status()

                for chunk in resp.iter_lines():
                    if not chunk:
                        continue

                    last_chunk = chunk
                    try:
                        data = json.loads(chunk.decode("utf-8"))
                    except json.JSONDecodeError:
                        continue

                    message_data = data.get("message", {})
                    text = message_data.get("content", "")
                    thinking_piece = message_data.get("thinking", "")

                    if thinking_piece:
                        if not thinking:
                            full_thinking_text += "<think>"
                            thinking = True
                            think_start = time.time()
                        full_thinking_text += thinking_piece

                        new_thinking = full_thinking_text[last_thinking_len:]
                        last_thinking_len = len(full_thinking_text)
                        if new_thinking:
                            yield new_thinking
                    else:
                        if thinking:
                            full_thinking_text += "</think>"
                            total_think_time += time.time() - think_start
                            think_start = None
                            thinking = False
                            last_thinking_len = len(full_thinking_text)

                        full_text += text
                        new_text = full_text[last_text_len:]
                        last_text_len = len(full_text)
                        if new_text:
                            yield new_text

                    if data.get("done", False):
                        if thinking: 
                            full_thinking_text += "</think>"
                            total_think_time += time.time() - think_start
                            thinking = False
                            last_thinking_len = len(full_thinking_text)

                        end_time = time.time()
                        total_time = end_time - start_time

                        meta = {
                            "done_reason": data.get("done_reason"),
                            "total_time_sec": total_time,
                            "total_think_time_sec": total_think_time,
                            "model": data.get("model"),
                        }
                        print(meta)
                        yield full_text+f"\n<!--END-->\n" + convert_markdown(full_thinking_text + full_text)
                        yield f"\n<script>window.chatMeta = {json.dumps(meta)};</script>"
                        break

        except Exception as e:
            chunk_str = last_chunk.decode() if last_chunk else "No chunk received"
            yield (
                "\n<!--END-->\n"
                f"<h1>Internal Server Streaming Error</h1>"
                f"<h2>Last Chunk:</h2><pre>{chunk_str}</pre>"
                f"<h2>Error:</h2><pre>{str(e)}</pre>"
            )

    return Response(stream(), mimetype="text/html")