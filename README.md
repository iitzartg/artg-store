# IMSET E-commerce Platform

A modern, full-stack e-commerce web application for selling video games and digital gift cards. Built with Django REST Framework (Python) backend and React (TypeScript) frontend, using MongoDB, Tailwind CSS, and Stripe integration.

## 🚀 Features

### Core Features
- **Product Catalog**: Browse games and gift cards with advanced filtering
- **Shopping Cart**: Persistent cart with localStorage and backend sync
- **Secure Checkout**: Stripe payment integration for digital goods
- **Digital Key Management**: Encrypted storage and secure delivery of digital keys
- **User Authentication**: JWT-based auth with refresh token rotation
- **Order Management**: Complete order tracking and history
- **Admin Dashboard**: Full admin panel for product, key, and order management
- **Email Notifications**: Automated email delivery of purchased keys
- **Promo Codes**: Discount system with flexible rules
- **Dark Mode UI**: Gaming-inspired dark theme with neon accents

### Security Features
- Encrypted digital key storage (AES-256-GCM)
- One-time key visibility
- JWT authentication with refresh tokens
- Rate limiting
- Input validation
- Helmet security headers
- Role-based access control (Admin/User)

## 📋 Prerequisites

- Python 3.8+ (for Django backend)
- Node.js 18+ (for React frontend)
- MongoDB 6.0+ (database server)
- Stripe account (for payments)
- Email service credentials (Gmail, SendGrid, etc.)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd "IMSET e-commerce website project"
```

### 2. Backend Setup (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:

```env
SECRET_KEY=your-django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

USE_MONGODB=True
DB_NAME=artgstore
DB_USER=admin
DB_PASSWORD=admin123
DB_HOST=localhost
DB_PORT=27017
DB_AUTH_SOURCE=admin

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@imset-ecommerce.com

FRONTEND_URL=http://localhost:5173

ENCRYPTION_KEY=your-32-byte-hex-encryption-key-here
```

**Generate Encryption Key:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Start MongoDB:**
```bash
# Option 1: Local MongoDB
mongod

# Option 2: Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

**Setup Database:**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Seed Database

```bash
cd backend
python manage.py seed_data
```

This will create:
- Admin user: `admin@imset.com` / `admin123`
- Regular user: `john@example.com` / `user123`
- Sample products and digital keys
- Sample promo codes

## 🚀 Running the Application

### Development Mode

**Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### Production Build

**Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
# Use gunicorn or uwsgi for production
gunicorn imset_ecommerce.wsgi:application --bind 0.0.0.0:8000
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
.
├── backend/
│   ├── accounts/        # User authentication app
│   ├── products/       # Products app
│   ├── orders/         # Orders and digital keys app
│   ├── payments/       # Payment processing app
│   ├── admin_panel/    # Admin API endpoints
│   ├── utils/          # Utility functions
│   ├── management/     # Django management commands
│   ├── imset_ecommerce/ # Django project settings
│   └── manage.py       # Django management script
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Zustand stores
│   │   ├── utils/       # Utility functions
│   │   └── types/        # TypeScript types
│   └── public/          # Static assets
│
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured/all` - Get featured products

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/:id/keys` - Get digital keys for order

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `POST /api/payments/verify` - Verify payment

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/keys` - Add digital keys
- `GET /api/admin/orders` - Get all orders
- `POST /api/admin/promo-codes` - Create promo code

## 🎨 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router
- Stripe.js
- React Hot Toast

### Backend
- Python 3.8+
- Django 4.2
- Django REST Framework
- MongoDB (using djongo)
- JWT (djangorestframework-simplejwt)
- Stripe
- Django Email Backend
- Cryptography (Fernet)
- Django CORS Headers

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Encryption Key**: Use a strong, randomly generated 32-byte hex key
3. **JWT Secrets**: Use strong, unique secrets for production
4. **Stripe Webhooks**: Verify webhook signatures in production
5. **Rate Limiting**: Adjust limits based on your needs
6. **CORS**: Configure CORS properly for production
7. **HTTPS**: Always use HTTPS in production

## 📧 Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

For other providers, adjust `EMAIL_HOST` and `EMAIL_PORT` accordingly.

## 🐳 Docker Support

Docker configuration can be added for easy deployment. The application is structured to be Docker-friendly.

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on the repository.

---

Built with ❤️ using Django and React


