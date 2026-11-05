# Dealership Review Platform

A Django and React application for finding car dealerships, filtering listings by state, reading customer reviews, registering and signing in, and posting reviews with sentiment labels. A small Express/MongoDB service stores dealer and review data; Django has a local JSON/SQLite fallback for development and automated checks.

## Features

- Dealer directory with state filters and dealer detail pages
- User registration, login, and logout
- Reviews with car and purchase details
- Car catalog for review submission
- Review sentiment analysis
- Django admin models for car makes, models, and submitted reviews
- GitHub Actions checks for Django, React, and the Node data API

## Local development

1. Install Python 3.11+, Node.js 18+, and npm.
2. Start Django:

   ```sh
   cd server
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 8000
   ```

3. In another terminal start the React development server:

   ```sh
   cd server/frontend
   npm install
   npm start
   ```

   Open `http://localhost:3000`. The React development server proxies `/djangoapp` requests to Django on port 8000. The directory and review API use the included JSON data when MongoDB is not running.

4. To run the full MongoDB and sentiment services instead, start the stack from `server/`:

   ```sh
   docker compose up --build
   ```

   Then open `http://localhost:8000`. Before deploying publicly, set `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, and `DJANGO_CSRF_TRUSTED_ORIGINS` in the deployment environment.

## Useful commands

- `python manage.py check` — validate Django configuration
- `python manage.py test djangoapp` — run API and authentication tests
- `npm run build` — build the React app for Django/WhiteNoise static serving
- `node --check server/database/app.js` — validate Node API syntax

## API routes

The Django API is under `/djangoapp/`: `login`, `logout`, `register`, `get_dealers`, `get_dealers/<state>`, `dealer/<id>`, `reviews/dealer/<id>`, `get_cars`, `analyze_review`, and `add_review`.
