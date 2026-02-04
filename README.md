# 🚀 Cloud-Ready Manager

A modern, production-ready full-stack application showcasing a complete CRUD system with React, TypeScript, Next.js, Node.js, Express, and PostgreSQL.

![Stack](https://img.shields.io/badge/Stack-Full--Stack-blue)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

## 📋 Overview

Cloud-Ready Manager is a comprehensive full-stack application that demonstrates modern web development practices with a focus on:
- Clean architecture and code organization
- Type safety with TypeScript
- Responsive UI with Tailwind CSS
- Smooth animations with Framer Motion
- Container orchestration with Docker
- Production-ready features (validation, rate limiting, error handling)

## 🎯 Features

### Backend API
- ✅ RESTful API with Express.js
- ✅ PostgreSQL database with connection pooling
- ✅ Input validation with express-validator
- ✅ Rate limiting and security headers
- ✅ Comprehensive error handling
- ✅ Health check endpoint
- ✅ Docker containerization
- ✅ Database seeding script

### Frontend Application
- ✅ Next.js 14 with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Framer Motion animations
- ✅ Zustand state management
- ✅ Toast notifications
- ✅ Search and filter functionality
- ✅ Responsive design
- ✅ Custom hooks and utilities

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14, React 18
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.3, CSS Modules
- **Animation:** Framer Motion 10
- **State Management:** Zustand 4
- **HTTP Client:** Axios 1.6

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 4.18
- **Database:** PostgreSQL 15
- **Validation:** express-validator 7
- **Security:** Helmet, CORS, Rate Limiting
- **Compression:** Gzip compression

### DevOps
- **Containerization:** Docker, Docker Compose
- **Image:** Node 18 Alpine
- **Database:** PostgreSQL 15 Alpine

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- PostgreSQL 15 (or use Docker)
- Docker & Docker Compose (optional)

### Option 1: Docker (Recommended)

```bash
# Start all services
cd backend-api
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Option 2: Local Development

#### Backend Setup
```bash
cd backend-api
npm install

# Configure PostgreSQL connection in src/config/database.js
# Create database and run schema: src/config/init-db.sql

npm run dev  # Starts on http://localhost:3000
```

#### Frontend Setup
```bash
cd frontend-app
npm install
npm run dev  # Starts on http://localhost:3001
```

## 📦 Available Scripts

### Backend
```bash
npm start           # Start production server
npm run dev         # Start development server with nodemon
npm run seed        # Populate database with sample data
npm run docker:up   # Start Docker containers
npm run docker:down # Stop Docker containers
npm run docker:logs # View API logs
npm run db:connect  # Connect to PostgreSQL
```

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
```

## 🗂️ Project Structure

```
├── backend-api/
│   ├── src/
│   │   ├── config/          # Database and configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── server.js        # Application entry point
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── examples.js          # API usage examples
│   └── seed.js              # Database seeding
│
└── frontend-app/
    ├── app/                 # Next.js app directory
    │   ├── users/           # Users page
    │   ├── products/        # Products page
    │   └── layout.tsx       # Root layout
    ├── components/          # React components
    ├── store/               # Zustand store
    ├── lib/                 # Utilities and API client
    ├── hooks/               # Custom React hooks
    └── tailwind.config.ts   # Tailwind configuration
```

## 🔌 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Health
- `GET /health` - Health check endpoint

## 🧪 Testing

Import the [Postman collection](backend-api/postman_collection.json) to test all API endpoints.

## 🔒 Security Features

- Input validation on all endpoints
- Rate limiting (100 requests/15 minutes)
- Security headers with Helmet
- CORS configuration
- SQL injection prevention with parameterized queries

## 📝 License

Feel free to use this project for learning and portfolio purposes.

## 👤 Author

**Rahul Joshi**
- GitHub: [@Rahuljoshi07](https://github.com/Rahuljoshi07)

## 🙏 Acknowledgments

Built with modern web technologies and best practices for educational and portfolio purposes.

---

⭐ Star this repository if you find it helpful!
