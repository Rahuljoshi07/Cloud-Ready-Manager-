# 🚀 Full Stack Application Setup Guide

Complete setup instructions for the Backend API + Frontend React App.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm
- **Docker Desktop** (for containerized setup)
- **PostgreSQL 15+** (if running locally without Docker)
- **Git** (optional, for version control)

## 🎯 Quick Start (Recommended - Using Docker)

### Step 1: Start Backend with Docker

```powershell
# Navigate to backend directory
cd "c:\Users\Lenovo\OneDrive\Desktop\Collage wla\backend-api"

# Start PostgreSQL + API services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs (optional)
docker-compose logs -f api
```

**Backend will be available at:** `http://localhost:3000`

### Step 2: Install Frontend Dependencies

```powershell
# Open a new terminal and navigate to frontend
cd "c:\Users\Lenovo\OneDrive\Desktop\Collage wla\frontend-app"

# Install dependencies
npm install
```

### Step 3: Start Frontend Development Server

```powershell
# Still in frontend-app directory
npm run dev
```

**Frontend will be available at:** `http://localhost:3001` (or `http://localhost:3000` if port 3000 is free)

### Step 4: Access the Application

Open your browser and go to:
- **Frontend:** `http://localhost:3001`
- **Backend API:** `http://localhost:3000`
- **API Documentation:** `http://localhost:3000/`
- **Health Check:** `http://localhost:3000/health`

---

## 🔧 Alternative Setup (Without Docker)

If you prefer to run services locally without Docker:

### Backend Setup

```powershell
# 1. Navigate to backend
cd "c:\Users\Lenovo\OneDrive\Desktop\Collage wla\backend-api"

# 2. Install dependencies
npm install

# 3. Set up PostgreSQL database
# - Install PostgreSQL from https://www.postgresql.org/download/
# - Create database:
psql -U postgres
CREATE DATABASE api_db;
\q

# 4. Initialize database schema
psql -U postgres -d api_db -f src/config/init-db.sql

# 5. Configure environment (optional)
# Copy .env.example to .env and adjust if needed
copy .env.example .env

# 6. Start the server
npm run dev
```

### Frontend Setup

```powershell
# 1. Navigate to frontend
cd "c:\Users\Lenovo\OneDrive\Desktop\Collage wla\frontend-app"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

---

## 🧪 Testing the Application

### 1. Using Postman

```powershell
# Import the Postman collection
# File: backend-api/postman_collection.json
```

1. Open Postman
2. Click **Import**
3. Select `postman_collection.json` from backend-api folder
4. Test all endpoints

### 2. Using the Frontend UI

1. Navigate to `http://localhost:3001`
2. Click **View Users** or **View Products**
3. Try creating, viewing, and deleting items
4. Use the search functionality

### 3. Using curl

```powershell
# Get all users
curl http://localhost:3000/api/users

# Create a new user
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"age\":25}"

# Get all products
curl http://localhost:3000/api/products
```

---

## 📦 Project Structure

```
Collage wla/
├── backend-api/              # Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Validation & rate limiting
│   │   └── server.js        # Main application
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
└── frontend-app/             # React + Next.js + TypeScript
    ├── app/                 # Next.js pages
    ├── components/          # React components
    ├── store/               # Zustand state management
    ├── lib/                 # API client
    └── package.json
```

---

## 🔍 Troubleshooting

### Backend Issues

**Port 3000 already in use:**
```powershell
# Change PORT in .env file
PORT=3001
```

**Database connection failed:**
```powershell
# Check if PostgreSQL is running
docker-compose ps

# Restart services
docker-compose down
docker-compose up -d
```

**Can't connect to database:**
```powershell
# Check database logs
docker-compose logs postgres

# Access PostgreSQL directly
docker exec -it api_postgres psql -U postgres -d api_db
```

### Frontend Issues

**Port conflict:**
- Next.js will automatically use the next available port
- Check terminal output for the actual port

**API connection failed:**
- Ensure backend is running on `http://localhost:3000`
- Check `.env.local` file in frontend-app
- Verify `NEXT_PUBLIC_API_URL=http://localhost:3000/api`

**Module not found errors:**
```powershell
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

---

## 🛠️ Development Commands

### Backend

```powershell
npm run dev      # Start with auto-reload (nodemon)
npm start        # Start production server
docker-compose up -d        # Start with Docker
docker-compose down         # Stop Docker services
docker-compose logs -f api  # View logs
```

### Frontend

```powershell
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## 🎨 Features Overview

### Backend Features
✅ RESTful API with Express.js
✅ PostgreSQL database with connection pooling
✅ Input validation with express-validator
✅ Rate limiting (100 requests/15 min)
✅ Security headers with Helmet
✅ CORS enabled
✅ Request logging
✅ Error handling middleware
✅ Health check endpoint
✅ Docker containerization

### Frontend Features
✅ React 18 with TypeScript
✅ Next.js 14 (App Router)
✅ Tailwind CSS styling
✅ Framer Motion animations
✅ Zustand state management
✅ Toast notifications
✅ Search/filter functionality
✅ Responsive design
✅ Loading states
✅ Error handling
✅ Form validation

---

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | / | API documentation |
| GET | /api/users | Get all users |
| GET | /api/users/:id | Get user by ID |
| POST | /api/users | Create user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |
| GET | /api/products | Get all products |
| GET | /api/products/:id | Get product by ID |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

---

## 🔐 Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation on all endpoints
- Rate limiting to prevent abuse
- SQL injection protection (parameterized queries)
- Environment variables for sensitive data

---

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 🚀 Production Deployment

### Backend
```powershell
npm run build
npm start
# Or use Docker:
docker build -t backend-api .
docker run -p 3000:3000 backend-api
```

### Frontend
```powershell
npm run build
npm start
# Or deploy to Vercel:
vercel
```

---

## 📝 License

ISC

---

## 💡 Tips

1. **Always start backend before frontend**
2. **Use Docker for easiest setup**
3. **Check health endpoint if issues occur**
4. **View browser console for frontend errors**
5. **Check terminal logs for backend errors**
6. **Test with Postman collection first**

---

## 🆘 Need Help?

- Check [Backend README](backend-api/README.md)
- Check [Frontend README](frontend-app/README.md)
- Review API documentation at `http://localhost:3000/`
- Test endpoints with Postman collection

---

**Happy Coding! 🎉**
