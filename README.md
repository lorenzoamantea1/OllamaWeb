# OllamaWeb


OllamaWeb is a lightweight web application that provides an easy-to-use interface for interacting with **[Ollama](https://ollama.ai/)** AI models. It allows you to run and query AI models locally or remotely, without writing any code, directly from your browser.  
<br>
<img width="1918" height="963" alt="image" src="https://github.com/user-attachments/assets/1ef083a4-f3ec-4d97-93ac-47b345b8acb5" />
<br>
## 🚀 Features
- **Web-based chat interface** – Interact with your Ollama AI models directly from a browser without writing code.  
- **Multi-model support** – Easily switch between different models you have downloaded.  
- **Real-time responses** – Get AI outputs instantly as you type queries.  
- **Python backend** – Extend functionality, integrate custom logic, or handle advanced requests.  
- **Lightweight and modular** – Simple structure for easy customization and further development.  
- **Cross-platform** – Works on Linux, macOS, and Windows (as long as Ollama is installed).


## 🛠 Requirements
- Python 3.9+
- [Ollama](https://ollama.com/) installed and running
- Python libraries (listed in `requirements.txt`)

## ⚙️ Installation
Install ollama (Linux):
```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl enable --now ollama
```
Pull the desired model:
```bash
ollama pull <model>
```
Clone this repository and install Python dependencies:
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
By default, the app will be available at http://127.0.0.1:5000
