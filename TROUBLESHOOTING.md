# Troubleshooting Guide - Products Not Showing

## Quick Diagnostic Steps

### Step 1: Verify Backend is Running

1. **Check if Django server is running:**
   ```bash
   # In backend directory
   python manage.py runserver
   ```

2. **Test the API directly:**
   - Open browser: http://localhost:8000/api/products/
   - You should see JSON data with products
   - If you see an error, the backend is not running correctly

### Step 2: Verify Frontend is Running

1. **Check if Vite dev server is running:**
   ```bash
   # In frontend directory
   npm run dev
   ```

2. **Open the website:**
   - Go to: http://localhost:5173
   - You should see the homepage

### Step 3: Check Browser Console

1. **Open Developer Tools:**
   - Press `F12` or `Ctrl+Shift+I`
   - Go to **Console** tab

2. **Look for errors:**
   - Red error messages indicate problems
   - Common errors:
     - `Failed to fetch` - Backend not running or CORS issue
     - `404 Not Found` - Wrong API endpoint
     - `Network Error` - Connection problem

### Step 4: Check Network Requests

1. **Open Developer Tools:**
   - Go to **Network** tab
   - Refresh the page (F5)

2. **Look for API requests:**
   - Find request to `/api/products` or `/api/products/featured/all`
   - Check the **Status** column:
     - `200` = Success ✅
     - `404` = Not Found ❌
     - `500` = Server Error ❌
     - `CORS error` = CORS issue ❌

3. **Click on the request and check:**
   - **Response** tab - Should show JSON with products
   - **Headers** tab - Check if request went to correct URL

### Step 5: Verify Database Has Products

```bash
cd backend
.\venv\Scripts\Activate.ps1
python manage.py shell -c "from products.models import Product; print('Products:', Product.objects.count())"
```

Should show: `Products: 52` (or more)

## Common Issues and Solutions

### Issue 1: "Failed to fetch" or Network Error

**Cause:** Backend server not running or wrong URL

**Solution:**
1. Make sure backend is running on port 8000
2. Check `frontend/vite.config.ts` - proxy should point to `http://localhost:8000`
3. Restart both servers

### Issue 2: CORS Error

**Cause:** CORS not configured correctly

**Solution:**
1. Check `backend/imset_ecommerce/settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       'http://localhost:5173',
   ]
   ```
2. Restart Django server

### Issue 3: 404 Not Found

**Cause:** Wrong API endpoint URL

**Solution:**
1. Check API endpoints in `backend/products/urls.py`
2. Verify frontend is calling correct URLs:
   - Products list: `/api/products/`
   - Featured: `/api/products/featured/all/`

### Issue 4: Empty Products Array / No Products Shown

**Cause:** No products in database, products are inactive, or API response format issue

**Solution:**
1. **Check if products exist:**
   ```bash
   cd backend
   .\venv\Scripts\Activate.ps1
   python manage.py shell -c "from products.models import Product; print('Total:', Product.objects.count()); print('Active:', Product.objects.filter(is_active=True).count())"
   ```

2. **If 0 products, seed the database:**
   ```bash
   cd backend
   .\venv\Scripts\Activate.ps1
   python manage.py seed_data
   ```

3. **If products exist but are inactive:**
   - Access Django admin: http://localhost:8000/admin
   - Go to Products section
   - Edit products and set `is_active` to `True`

4. **Check API response:**
   - Open browser console (F12)
   - Look for "Products API response" log
   - Verify the response has `data.products` array
   - Check for any errors in console

5. **Verify backend is running:**
   - Backend should be running on http://localhost:8000
   - Test API directly: http://localhost:8000/api/products/
   - Should return JSON with `success: true` and `data.products` array

6. **Check serializer fixes:**
   - The `_id` field should now be properly returned
   - If you see "Product missing ID" warnings, the serializer fix should resolve this

### Issue 5: Products Show But Page is Blank

**Cause:** Frontend rendering issue or JavaScript error

**Solution:**
1. Check browser console for JavaScript errors
2. Verify React components are rendering
3. Check if `ProductCard` component exists and works

### Issue 6: Price Shows as String Instead of Number

**Cause:** Serializer returning price as string

**Solution:** Already fixed in `backend/products/serializers.py` - restart Django server

## Manual API Testing

### Test Products Endpoint:
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:8000/api/products/" -UseBasicParsing

# Or open in browser:
http://localhost:8000/api/products/
```

### Test Featured Products:
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:8000/api/products/featured/all/" -UseBasicParsing

# Or open in browser:
http://localhost:8000/api/products/featured/all/
```

## Reset Everything

If nothing works, try a complete reset:

```bash
# 1. Stop both servers (Ctrl+C)

# 2. Backend - Reset database
cd backend
.\venv\Scripts\Activate.ps1
del db.sqlite3
python manage.py migrate
python manage.py seed_data

# 3. Start backend
python manage.py runserver

# 4. New terminal - Start frontend
cd frontend
npm run dev
```

## Still Not Working?

1. **Check server logs:**
   - Backend: Look at terminal where `runserver` is running
   - Frontend: Look at terminal where `npm run dev` is running

2. **Check file paths:**
   - Make sure you're in the correct directories
   - Verify files exist

3. **Check ports:**
   - Backend: Port 8000
   - Frontend: Port 5173
   - Make sure nothing else is using these ports

4. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` or `Ctrl+F5`

5. **Try different browser:**
   - Sometimes browser extensions cause issues

## Expected Behavior

When everything works correctly:

1. **Homepage (http://localhost:5173):**
   - Shows hero section
   - Shows "Featured Products" section with product cards
   - Products have images, titles, prices in TND

2. **Products Page (http://localhost:5173/products):**
   - Shows grid of all products
   - Filters work
   - Pagination works

3. **API (http://localhost:8000/api/products/):**
   - Returns JSON with structure:
   ```json
   {
     "success": true,
     "data": {
       "products": [...],
       "pagination": {...}
     }
   }
   ```

## Get Help

If you're still stuck:
1. Check browser console for specific error messages
2. Check backend terminal for Django errors
3. Check frontend terminal for Vite errors
4. Share the error messages for help


