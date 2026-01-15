# IMSET E-commerce Backend (Django)

Django REST Framework backend for the IMSET E-commerce platform.

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 4. Database Setup (MongoDB)

**Start MongoDB:**
```bash
# Option 1: Local MongoDB installation
mongod

# Option 2: Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

**Configure MongoDB in `.env`:**
```env
USE_MONGODB=True
DB_NAME=artgstore
DB_HOST=localhost
DB_PORT=27017
# For authenticated MongoDB:
# DB_USER=admin
# DB_PASSWORD=admin123
# DB_AUTH_SOURCE=admin
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Seed Database

```bash
python manage.py seed_data
```

This creates:
- Admin: `admin@imset.com` / `admin123`
- User: `john@example.com` / `user123`
- Sample products and keys

### 8. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `/api/auth/` - Authentication endpoints
- `/api/products/` - Product endpoints
- `/api/orders/` - Order endpoints
- `/api/payments/` - Payment endpoints
- `/api/admin/` - Admin endpoints
- `/admin/` - Django admin panel

## Generate Encryption Key

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Notes

- The backend uses Django REST Framework for API endpoints
- JWT authentication is handled by `djangorestframework-simplejwt`
- Digital keys are encrypted using Fernet (symmetric encryption)
- Stripe webhooks are handled at `/api/payments/webhook/`


