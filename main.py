from flask import Flask, render_template
from core.routes import chat_blueprint
import subprocess

subprocess.Popen([
    "cmd", "/c", "start",
    "core/caddy", "reverse-proxy",
    "--from", "aiassistant.ddnsking.com",
    "--to", "localhost:5000"
])

app = Flask(__name__)
app.register_blueprint(chat_blueprint)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
