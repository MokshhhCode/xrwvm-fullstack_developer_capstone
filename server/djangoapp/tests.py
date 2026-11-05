import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import CustomerReview


class CapstoneAPITests(TestCase):
    def setUp(self):
        self.user_data = {
            "username": "driver-test",
            "firstName": "Taylor",
            "lastName": "Driver",
            "email": "taylor@example.test",
            "password": "SafeTestPassword123!",
        }

    def test_register_login_logout(self):
        response = self.client.post(reverse("djangoapp:register"), data=json.dumps(self.user_data), content_type="application/json")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(get_user_model().objects.filter(username="driver-test").exists())

        response = self.client.post(reverse("djangoapp:login"), data=json.dumps({"userName": "driver-test", "password": self.user_data["password"]}), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "Authenticated")

        response = self.client.get(reverse("djangoapp:logout"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "Logged out")

    def test_dealer_directory_and_state_filter_use_local_data_when_service_is_offline(self):
        with patch("djangoapp.views.get_request", return_value=None):
            response = self.client.get(reverse("djangoapp:get_dealers"))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.json()["dealers"]), 50)

            response = self.client.get(reverse("djangoapp:get_dealers_by_state", args=["Kansas"]))
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json()["dealers"])
            self.assertTrue(all(dealer["state"] == "Kansas" for dealer in response.json()["dealers"]))

            response = self.client.get(reverse("djangoapp:dealer_details", args=[1]))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["dealer"][0]["id"], 1)

    def test_car_catalog_and_sentiment_route(self):
        response = self.client.get(reverse("djangoapp:get_cars"))
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json()["CarModels"]), 100)

        with patch("djangoapp.views.analyze_review_sentiments", return_value="positive"):
            response = self.client.post(reverse("djangoapp:analyze_review"), data=json.dumps({"review": "Fantastic services"}), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["sentiment"], "positive")

    def test_reviews_can_be_created_and_retrieved(self):
        user = get_user_model().objects.create_user(username="reviewer", password="SafeTestPassword123!")
        self.client.force_login(user)
        payload = {
            "dealership": 1, "review": "Fantastic services", "purchase": True,
            "purchase_date": "2022-02-01", "car_make": "Honda", "car_model": "Civic", "car_year": 2022,
        }
        with patch("djangoapp.views.post_review", return_value=None), patch("djangoapp.views.analyze_review_sentiments", return_value="positive"):
            response = self.client.post(reverse("djangoapp:add_review"), data=json.dumps(payload), content_type="application/json")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["review"]["sentiment"], "positive")
            response = self.client.get(reverse("djangoapp:dealer_reviews", args=[1]))

        self.assertEqual(response.status_code, 200)
        self.assertTrue(any(item["review"] == "Fantastic services" for item in response.json()["reviews"]))
        self.assertEqual(CustomerReview.objects.count(), 1)

    def test_review_submission_requires_login(self):
        response = self.client.post(reverse("djangoapp:add_review"), data="{}", content_type="application/json")
        self.assertEqual(response.status_code, 401)
