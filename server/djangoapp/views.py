import json
import logging
from datetime import date
from pathlib import Path

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import CustomerReview
from .restapis import analyze_review_sentiments, get_request, post_review

logger = logging.getLogger(__name__)
User = get_user_model()
DATA_DIR = Path(__file__).resolve().parents[1] / "database" / "data"


def _payload(request):
    if request.content_type == "application/json":
        try:
            return json.loads(request.body or b"{}")
        except (json.JSONDecodeError, UnicodeDecodeError):
            return None
    return request.POST.dict()


def _seed_records(filename, key):
    try:
        with (DATA_DIR / filename).open(encoding="utf-8") as source:
            return json.load(source).get(key, [])
    except (OSError, json.JSONDecodeError):
        logger.exception("Could not read capstone data file %s", filename)
        return []


def _service_error():
    return JsonResponse({"status": 503, "error": "Dealership service is unavailable"}, status=503)


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = _payload(request)
    if not data:
        return JsonResponse({"error": "A valid JSON body is required"}, status=400)
    username = data.get("userName") or data.get("username")
    password = data.get("password")
    if not username or not password:
        return JsonResponse({"error": "Username and password are required"}, status=400)
    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"userName": username, "error": "Invalid credentials"}, status=401)
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


def logout_user(request):
    logout(request)
    return JsonResponse({"status": "Logged out"})


@csrf_exempt
def registration(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = _payload(request)
    if not data:
        return JsonResponse({"error": "A valid JSON body is required"}, status=400)
    username = (data.get("userName") or data.get("username") or "").strip()
    password = data.get("password") or ""
    first_name = (data.get("firstName") or data.get("first_name") or "").strip()
    last_name = (data.get("lastName") or data.get("last_name") or "").strip()
    email = (data.get("email") or "").strip()
    if not username or not password or not first_name or not last_name or not email:
        return JsonResponse({"error": "Username, first name, last name, email, and password are required"}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "That username is already registered"}, status=409)
    user = User.objects.create_user(username=username, password=password, first_name=first_name, last_name=last_name, email=email)
    return JsonResponse({"userName": user.username, "status": "Registered"}, status=201)


def get_dealerships(request):
    dealers = get_request("fetchDealers")
    if dealers is None:
        dealers = _seed_records("dealerships.json", "dealerships")
    return JsonResponse({"status": 200, "dealers": dealers})


def get_dealerships_by_state(request, state):
    if state.lower() == "all":
        return get_dealerships(request)
    dealers = get_request(f"fetchDealers/{state}")
    if dealers is None:
        dealers = [d for d in _seed_records("dealerships.json", "dealerships") if d.get("state", "").casefold() == state.casefold()]
    return JsonResponse({"status": 200, "dealers": dealers})


def get_dealer_details(request, dealer_id):
    dealer = get_request(f"fetchDealer/{dealer_id}")
    if dealer is None:
        dealer = [d for d in _seed_records("dealerships.json", "dealerships") if int(d.get("id", -1)) == dealer_id]
    if isinstance(dealer, dict):
        dealer = [dealer] if dealer else []
    if not dealer:
        return JsonResponse({"status": 404, "error": "Dealer not found"}, status=404)
    return JsonResponse({"status": 200, "dealer": dealer})


def get_dealer_reviews(request, dealer_id):
    reviews = get_request(f"fetchReviews/dealer/{dealer_id}")
    if reviews is None:
        reviews = [r for r in _seed_records("reviews.json", "reviews") if int(r.get("dealership", -1)) == dealer_id]
    for item in CustomerReview.objects.filter(dealership=dealer_id):
        reviews.append({
            "id": item.pk, "name": item.name, "dealership": item.dealership, "review": item.review,
            "purchase": item.purchase, "purchase_date": item.purchase_date.isoformat(),
            "car_make": item.car_make, "car_model": item.car_model, "car_year": item.car_year,
            "sentiment": item.sentiment,
        })
    for review in reviews:
        review.setdefault("sentiment", analyze_review_sentiments(review.get("review", "")))
    return JsonResponse({"status": 200, "reviews": reviews})


def get_cars(request):
    rows = _seed_records("car_records.json", "cars")
    models = [{"CarMake": row["make"], "CarModel": row["model"], "CarYear": row["year"], "CarType": row["bodyType"]} for row in rows]
    return JsonResponse({"status": 200, "CarModels": models})


@csrf_exempt
def analyze_review(request):
    data = _payload(request) if request.method == "POST" else request.GET
    text = (data.get("review") or data.get("text") or "").strip()
    if not text:
        return JsonResponse({"error": "Review text is required"}, status=400)
    return JsonResponse({"status": 200, "sentiment": analyze_review_sentiments(text)})


@csrf_exempt
def add_review(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Login required"}, status=401)
    data = _payload(request)
    required = ("dealership", "review", "purchase_date", "car_make", "car_model", "car_year")
    if not data or any(not str(data.get(field, "")).strip() for field in required):
        return JsonResponse({"error": "All review fields are required"}, status=400)
    try:
        dealership_id = int(data["dealership"])
        car_year = int(data["car_year"])
        if car_year < 2015 or car_year > 2023:
            raise ValueError
        purchase_date = date.fromisoformat(data["purchase_date"])
    except (TypeError, ValueError):
        return JsonResponse({"error": "Enter a valid dealership, purchase date, and car year (2015–2023)"}, status=400)
    review_text = str(data["review"]).strip()
    name = data.get("name") or request.user.get_full_name() or request.user.username
    sentiment = analyze_review_sentiments(review_text)
    review_data = {
        "name": name, "dealership": dealership_id, "review": review_text,
        "purchase": bool(data.get("purchase", True)), "purchase_date": purchase_date.isoformat(),
        "car_make": str(data["car_make"]).strip(), "car_model": str(data["car_model"]).strip(), "car_year": car_year,
    }
    saved = post_review(review_data)
    if saved is None:
        saved = CustomerReview.objects.create(
            **{**review_data, "purchase_date": purchase_date, "sentiment": sentiment}
        )
        saved = {
            "id": saved.pk, **review_data, "sentiment": sentiment,
        }
    else:
        saved["sentiment"] = sentiment
    return JsonResponse({"status": 200, "review": saved})
