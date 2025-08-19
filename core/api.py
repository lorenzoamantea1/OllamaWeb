import requests

API_URL = "http://localhost:11434/api/"

models = []

req = requests.get(API_URL+"tags")
print(req.json()["models"])