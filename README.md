# ArtG Store

A modern full-stack e-commerce platform for selling video games and digital gift cards. Built with Django REST Framework (Python) and React (TypeScript), using MongoDB, Tailwind CSS, and Stripe integration.

## 🚀 Features

- **Product Catalog** - Browse games and gift cards with filtering
- **Shopping Cart** - Persistent cart with localStorage sync
- **Secure Checkout** - Stripe payment integration
- **Digital Key Management** - Encrypted storage and secure delivery
- **User Authentication** - JWT-based auth with refresh tokens
- **Order Management** - Complete order tracking and history
- **Admin Dashboard** - Full admin panel for product, key, and order management
- **Reviews System** - Product reviews and ratings
- **Promo Codes** - Discount system with flexible rules
- **Dark Mode UI** - Gaming-inspired dark theme

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- MongoDB 6.0+
- Stripe account (for payments)

## 🛠️ Quick Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd "01-IMSET e-commerce website project"
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
USE_MONGODB=True
DB_NAME=artgstore
DB_HOST=localhost
DB_PORT=27017
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ENCRYPTION_KEY=your-32-byte-hex-key
```

**Generate Encryption Key:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Start MongoDB:**
```bash
# Local: mongod
# Docker: docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

**Setup Database:**
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_data
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

## 🚀 Running the Application

**Backend:**
```bash
cd backend
python manage.py runserver
# Runs on http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Default Credentials (after seeding):**
- Admin: `admin@artgstore.com` / `admin123`
- User: `john@example.com` / `user123`

## 📁 Project Structure

```
.
├── backend/          # Django REST API
│   ├── accounts/     # Authentication
│   ├── products/     # Products & Reviews
│   ├── orders/       # Orders & Digital Keys
│   ├── payments/     # Stripe integration
│   └── admin_panel/  # Admin endpoints
│
└── frontend/         # React + TypeScript
    └── src/
        ├── components/
        ├── pages/
        ├── store/
        └── utils/
```

## 🔐 Key API Endpoints

- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Products:** `/api/products`, `/api/products/:id`, `/api/products/featured/all`
- **Orders:** `/api/orders`, `/api/orders/:id/keys`
- **Payments:** `/api/payments/create-intent`, `/api/payments/webhook`
- **Admin:** `/api/admin/products`, `/api/admin/orders`, `/api/admin/stats`

## 🎨 Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Stripe.js

**Backend:** Python 3.8+, Django 4.2, Django REST Framework, MongoDB (djongo), JWT, Stripe, Cryptography

## 📚 Documentation

- **Detailed Setup:** See [HOW_TO_RUN.md](HOW_TO_RUN.md)
- **Docker Setup:** See [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **Troubleshooting:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 🔒 Security Notes

- Never commit `.env` files
- Use strong encryption keys (32-byte hex)
- Configure CORS properly for production
- Always use HTTPS in production
- Verify Stripe webhook signatures

## 📝 License

ISC License

## 🤝 Contributing

Contributions welcome! Please submit a Pull Request.

---

Built with ❤️ using Django and React
