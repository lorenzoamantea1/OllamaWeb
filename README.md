# OllamaWeb

OllamaWeb is a lightweight web interface to interact with **[Ollama](https://ollama.com/)**, built with Python for the backend and simple HTML/CSS/JavaScript for the frontend.

## 🚀 Features
- Clean web interface to chat with Ollama models  
- Python backend to handle requests  

## 🛠 Requirements
- Python 3.9+
- [Ollama](https://ollama.com/) installed and running
- Python libraries (listed in `requirements.txt`)

## ⚙️ Installation
Install ollama and pull model
```bash
# On linux
curl -fsSL https://ollama.com/install.sh | sh 
sudo systemd enable -now ollama
ollama pull <model>
```
Clone the repository and install the dependencies:
```bash
git clone https://github.com/lorenzoamantea1/OllamaWeb.git
cd OllamaWeb
pip install -r requirements.txt
```

## ▶️ Usage
Start the Python server:

```bash
python main.py
```
By default, the app will be available at http://127.0.0.1:5000/
