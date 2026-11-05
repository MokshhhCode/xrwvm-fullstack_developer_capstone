FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DJANGO_DEBUG=0
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . ./
COPY --from=frontend-build /frontend/build ./frontend/build
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD ["gunicorn", "djangoproj.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
