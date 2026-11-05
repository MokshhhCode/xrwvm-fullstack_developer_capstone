import os
from pathlib import Path
from urllib.parse import quote

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))
backend_url = os.getenv("backend_url", "http://localhost:3030").rstrip("/")
sentiment_analyzer_url = os.getenv("sentiment_analyzer_url", "http://localhost:5050/").rstrip("/") + "/"
local_data_mode = os.getenv("LOCAL_DATA_MODE", "0") == "1"

def get_request(endpoint, **kwargs):
    if local_data_mode:
        return None
    try:
        response = requests.get(f"{backend_url}/{endpoint.lstrip('/')}", params=kwargs, timeout=(1.5, 3))
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError):
        return None

def analyze_review_sentiments(text):
    if not local_data_mode:
        try:
            response = requests.get(f"{sentiment_analyzer_url}analyze/{quote(text, safe='')}", timeout=(1.5, 3))
            response.raise_for_status()
            return response.json().get("sentiment", "neutral")
        except (requests.RequestException, ValueError):
            pass
    words = set(text.lower().split())
    positive = {"fantastic", "great", "good", "excellent", "amazing", "friendly", "helpful", "love", "wonderful"}
    negative = {"bad", "terrible", "awful", "rude", "poor", "horrible", "worst"}
    score = len(words & positive) - len(words & negative)
    return "positive" if score > 0 else "negative" if score < 0 else "neutral"

def post_review(data_dict):
    if local_data_mode:
        return None
    try:
        response = requests.post(f"{backend_url}/insert_review", json=data_dict, timeout=(1.5, 3))
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError):
        return None
