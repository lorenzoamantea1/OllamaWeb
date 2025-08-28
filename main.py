from flask import Flask
from core.routes import chat_blueprint

app = Flask(__name__)
app.register_blueprint(chat_blueprint)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)

