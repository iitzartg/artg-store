#!/bin/bash
set -e

echo "Waiting for database..."
if [ "$USE_MONGODB" = "True" ]; then
    if [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ]; then
        # Authenticated connection
        until python -c "from pymongo import MongoClient; client = MongoClient('mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/?authSource=${DB_AUTH_SOURCE:-admin}'); client.admin.command('ping')" 2>/dev/null; do
            echo "MongoDB is unavailable - sleeping"
            sleep 1
        done
    else
        # Non-authenticated connection
        until python -c "from pymongo import MongoClient; client = MongoClient('mongodb://${DB_HOST}:${DB_PORT}/'); client.admin.command('ping')" 2>/dev/null; do
            echo "MongoDB is unavailable - sleeping"
            sleep 1
        done
    fi
    echo "MongoDB is up!"
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

echo "Starting server..."
exec "$@"


