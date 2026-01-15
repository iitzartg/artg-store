# How to Run the ArtG Store E-commerce Project

## Prerequisites

- **Python 3.8+** (for Django backend)
- **Node.js 18+** (for React frontend)
- **MongoDB 6.0+** (database server)
- **Virtual environment** (Python venv)

## Quick Start Guide

### Step 1: Backend Setup (Django)

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Activate virtual environment:**

   ```bash
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1

   # Windows CMD
   venv\Scripts\activate.bat

   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies (if not already installed):**

   ```bash
   pip install -r requirements.txt
   ```

4. **Start MongoDB (if not running):**

   ```bash
   # Option 1: Local MongoDB installation
   mongod

   # Option 2: Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   ```

5. **Configure MongoDB connection (optional):**
   Create or update `backend/.env` file:

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

6. **Run database migrations (if needed):**

   ```bash
   python manage.py migrate
   ```

7. **Seed database with initial data (if database is empty):**

   ```bash
   python manage.py seed_data
   ```

8. **Start the Django server:**

   ```bash
   python manage.py runserver
   ```

   The backend API will be available at: **http://localhost:8000**

### Step 2: Frontend Setup (React)

1. **Open a new terminal window** (keep backend running)

2. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

3. **Install dependencies (if not already installed):**

   ```bash
   npm install
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The frontend will be available at: **http://localhost:5173**

## Access the Application

- **Frontend (Website):** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Django Admin Panel:** http://localhost:8000/admin
- **API Health Check:** http://localhost:8000/api/health/

## Running Both Servers

You need **two terminal windows** running simultaneously:

### Terminal 1 - Backend:

```bash
cd "D:\IMSET e-commerce website project\backend"
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

### Terminal 2 - Frontend:

```bash
cd "D:\IMSET e-commerce website project\frontend"
npm run dev
```

## Database Information

- **Database Type:** MongoDB
- **Database Name:** `artgstore`
- **Default Connection:** `localhost:27017`
- **Products:** 52 products with TND prices already created (after seeding)

## Common Commands

### Backend Commands:

```bash
# Run migrations
python manage.py migrate

# Create superuser (for admin access)
python manage.py createsuperuser

# Seed database with initial data
python manage.py seed_data

# Check products count
python manage.py shell -c "from products.models import Product; print(Product.objects.count())"
```

### Frontend Commands:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Backend Issues:

1. **Port 8000 already in use:**

   ```bash
   python manage.py runserver 8001
   ```

   Then update frontend API base URL if needed.

2. **Database errors:**

   ```bash
   # Make sure MongoDB is running
   # For local MongoDB: mongod
   # For Docker: docker-compose up db

   # Run migrations
   python manage.py migrate

   # Seed database with initial data
   python manage.py seed_data
   ```

3. **Module not found errors:**
   ```bash
   # Make sure virtual environment is activated
   pip install -r requirements.txt
   ```

### Frontend Issues:

1. **Port 5173 already in use:**

   - Vite will automatically use the next available port
   - Check the terminal output for the actual port

2. **API connection errors:**

   - Make sure backend is running on port 8000
   - Check `frontend/src/utils/api.ts` for correct base URL

3. **Dependencies not installed:**
   ```bash
   npm install
   ```

## Project Structure

```
IMSET e-commerce website project/
├── backend/              # Django backend
│   ├── manage.py
│   ├── .env              # Environment variables (MongoDB config)
│   └── venv/             # Python virtual environment
│
└── frontend/             # React frontend
    ├── package.json
    ├── src/
    └── node_modules/
```

## Environment Variables

The backend uses a `.env` file (already created) with:

- `ENCRYPTION_KEY` - For encrypting digital keys
- `SECRET_KEY` - Django secret key
- `DEBUG=True` - Development mode

## Default Data

The project comes with:

- **52 products** (20 games + 32 gift cards)
- All prices in **TND (Tunisian Dinar)**
- **1,030 digital keys** for games
- Products are active and ready to display

## Next Steps

1. Visit http://localhost:5173 to see the website
2. Browse products on the Products page
3. Create an account to make purchases
4. Access admin panel at http://localhost:8000/admin (create superuser first)

---

**Note:** Both servers must be running simultaneously for the application to work properly!
