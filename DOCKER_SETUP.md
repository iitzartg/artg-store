# Docker Setup Guide

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (comes with Docker Desktop)

## Quick Start

### 1. Create Environment Files

Create `.env` files in both `backend/` and `frontend/` directories:

**backend/.env:**

```env
SECRET_KEY=your-django-secret-key-here
DEBUG=False
USE_MONGODB=True
DB_NAME=artgstore
DB_USER=admin
DB_PASSWORD=admin123
DB_HOST=db
DB_PORT=27017
DB_AUTH_SOURCE=admin
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@imset-ecommerce.com
FRONTEND_URL=http://localhost
ENCRYPTION_KEY=your-32-byte-hex-encryption-key-here
```

**frontend/.env:**

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 2. Generate Encryption Key

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Build and Start Containers

```bash
docker-compose up --build
```

Or run in detached mode:

```bash
docker-compose up -d --build
```

### 4. Run Migrations and Seed Data

After containers are running:

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Seed database
docker-compose exec backend python manage.py seed_data

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser
```

### 5. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **MongoDB**: localhost:27017

## Docker Commands

### Start containers

```bash
docker-compose up
```

### Start in background

```bash
docker-compose up -d
```

### Stop containers

```bash
docker-compose down
```

### Stop and remove volumes (clears database)

```bash
docker-compose down -v
```

### View logs

```bash
docker-compose logs -f
```

### View logs for specific service

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Execute commands in container

```bash
docker-compose exec backend python manage.py <command>
docker-compose exec backend bash
```

### Rebuild containers

```bash
docker-compose build --no-cache
docker-compose up
```

## Troubleshooting

### Port already in use

If port 80 or 8000 is already in use, modify ports in `docker-compose.yml`:

```yaml
ports:
  - "8080:80" # Change frontend port
  - "8001:8000" # Change backend port
```

### Database connection errors

- Wait for MongoDB to be healthy (check with `docker-compose ps`)
- Verify database credentials in `.env` file
- Check logs: `docker-compose logs db`
- Ensure MongoDB authentication is properly configured

### Static files not loading

Run collectstatic:

```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

### Container won't start

- Check logs: `docker-compose logs <service-name>`
- Verify `.env` files exist and are properly formatted
- Rebuild: `docker-compose build --no-cache`

### Clear everything and start fresh

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

## Production Considerations

For production deployment:

1. **Set strong SECRET_KEY** in `.env`
2. **Use environment variables** instead of `.env` files
3. **Set DEBUG=False**
4. **Use MongoDB** with proper authentication and security
5. **Configure proper CORS** settings
6. **Set up SSL/HTTPS**
7. **Use production-ready web server** (gunicorn/uwsgi) instead of `runserver`
8. **Configure proper static file serving**

## Update Backend Dockerfile for Production

Replace the CMD in `backend/Dockerfile`:

```dockerfile
CMD gunicorn imset_ecommerce.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

And add gunicorn to `requirements.txt`:

```
gunicorn==21.2.0
```

