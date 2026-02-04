# Backend API Project

A RESTful API built with Node.js, Express, and PostgreSQL with Docker support.

## Features

✅ **RESTful API** with Express.js  
✅ **CRUD Operations** for Users and Products  
✅ **PostgreSQL Database** with connection pooling  
✅ **Docker & Docker Compose** for containerization  
✅ **Postman Collection** for API testing  
✅ **Security** with Helmet.js  
✅ **CORS** enabled  
✅ **Request Logging** with Morgan  

## Project Structure

```
backend-api/
├── src/
│   ├── config/
│   │   ├── database.js       # Database connection
│   │   └── init-db.sql       # Database schema
│   ├── controllers/
│   │   ├── userController.js
│   │   └── productController.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── productRoutes.js
│   └── server.js             # Main application
├── .env.example              # Environment variables template
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── postman_collection.json   # Postman API tests
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (or use Docker)
- Docker & Docker Compose (optional)
- Postman (for API testing)

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone and navigate to project**
   ```bash
   cd backend-api
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Check if running**
   ```bash
   docker-compose ps
   ```

4. **View logs**
   ```bash
   docker-compose logs -f api
   ```

The API will be available at `http://localhost:3000`

### Option 2: Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   ```

3. **Set up PostgreSQL database**
   - Install PostgreSQL
   - Create database: `CREATE DATABASE api_db;`
   - Run init script: `psql -U postgres -d api_db -f src/config/init-db.sql`

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

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

## Testing with Postman

1. **Import Collection**
   - Open Postman
   - Click "Import"
   - Select `postman_collection.json`

2. **Test Endpoints**
   - All requests are pre-configured
   - Modify request bodies as needed
   - Check responses and status codes

## Database Schema

### Users Table
```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(100) NOT NULL
email       VARCHAR(100) UNIQUE NOT NULL
age         INTEGER
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Products Table
```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(200) NOT NULL
description TEXT
price       DECIMAL(10, 2) NOT NULL
stock       INTEGER DEFAULT 0
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## Example API Requests

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":30}'
```

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Update Product
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":89.99,"stock":25}'
```

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild images
docker-compose build

# View logs
docker-compose logs -f

# Access database
docker exec -it api_postgres psql -U postgres -d api_db

# Remove volumes (caution: deletes data)
docker-compose down -v
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | api_db |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | postgres |

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js
- **Docker** - Containerization
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **dotenv** - Environment variable management

## Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Run in production mode
npm start
```

## License

ISC
