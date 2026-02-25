# ☁️ Azure Cloud Cost Monitoring & Optimization Platform

A full-stack enterprise platform for monitoring, analyzing, and optimizing Azure cloud spending. Built with Node.js, React, PostgreSQL, and Docker.

[![CI/CD](https://github.com/your-org/Cloud-Ready-Manager-/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-org/Cloud-Ready-Manager-/actions)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Cloud Monitor                   │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │   Frontend   │    │   Backend    │    │ Database  │  │
│  │  React.js    │───▶│  Express.js  │───▶│PostgreSQL │  │
│  │  Recharts    │    │  JWT Auth    │    │  15-alpine│  │
│  │  Port: 3000  │    │  Port: 5000  │    │ Port: 5432│  │
│  └──────────────┘    └──────────────┘    └───────────┘  │
│                             │                            │
│                    ┌────────┴────────┐                   │
│                    │    Services     │                   │
│                    │ ┌─────────────┐ │                   │
│                    │ │ Azure Mock  │ │                   │
│                    │ │ Anomaly Det.│ │                   │
│                    │ │ Forecasting │ │                   │
│                    │ │ Notif. Svc  │ │                   │
│                    │ │ PDF Reports │ │                   │
│                    │ └─────────────┘ │                   │
│                    └─────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Cost Dashboard** | Real-time KPIs, trend charts, service & region breakdown |
| 🔍 **Cost Breakdown** | Resource-level table with CPU/memory utilization metrics |
| 💡 **Recommendations** | AI-powered optimization suggestions (rightsizing, reserved instances, spot, etc.) |
| 🔔 **Alerts** | Z-score anomaly detection with email & Slack notifications |
| 💰 **Budgets** | Create budgets with configurable threshold alerts |
| 📄 **PDF Reports** | Generate and download professional cost reports |
| 🌙 **Dark Mode** | Full dark/light theme toggle |
| 🔐 **Auth** | JWT-based authentication with admin/viewer roles |

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 24+
- [Docker Compose](https://docs.docker.com/compose/) v2+
- Node.js 20+ (for local development)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/Cloud-Ready-Manager-.git
cd Cloud-Ready-Manager-

# Copy and configure environment
cp backend/.env.example .env

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Access the application
open http://localhost:3000
```

Services:
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:5000
- 🐘 PostgreSQL: localhost:5432

### Option 2: Local Development

```bash
# Terminal 1 – Start PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_DB=azure_cost_monitor \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:15-alpine

# Terminal 2 – Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Terminal 3 – Frontend
cd frontend
npm install
npm start
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

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@azurecost.io` | `admin123` |
| Viewer | `viewer@azurecost.io` | `viewer123` |

> ⚠️ Change these credentials in production!

---

## 🌍 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `5000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_NAME` | Database name | `azure_cost_monitor` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | JWT signing secret | *(required)* |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `SMTP_HOST` | SMTP server host | *(optional)* |
| `SMTP_USER` | SMTP username | *(optional)* |
| `SMTP_PASS` | SMTP password | *(optional)* |
| `SLACK_WEBHOOK_URL` | Slack notifications | *(optional)* |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## 📡 API Documentation

### Authentication
```
POST /api/auth/register     Register new user
POST /api/auth/login        Login (returns JWT)
GET  /api/auth/profile      Get current user profile
```

### Costs
```
GET  /api/costs             List cost records (filterable)
GET  /api/costs/summary     Monthly cost summary
GET  /api/costs/trend       Daily trend (last N days)
GET  /api/costs/by-service  Cost aggregated by service
GET  /api/costs/by-region   Cost aggregated by region
GET  /api/costs/anomalies   Detected cost anomalies
GET  /api/costs/forecast    Cost forecast (linear regression)
```

### Resources
```
GET    /api/resources       List all resources
GET    /api/resources/stats Resource statistics
GET    /api/resources/:id   Get resource by ID
POST   /api/resources       Create resource
PUT    /api/resources/:id   Update resource
DELETE /api/resources/:id   Delete resource
```

### Alerts
```
GET  /api/alerts            List alerts (filterable)
GET  /api/alerts/summary    Alert count by severity
POST /api/alerts            Create alert
PUT  /api/alerts/:id/resolve Mark alert as resolved
DELETE /api/alerts/:id      Delete alert
```

### Budgets
```
GET    /api/budgets                 List budgets
POST   /api/budgets                 Create budget
PUT    /api/budgets/:id             Update budget
DELETE /api/budgets/:id             Delete budget
GET    /api/budgets/check-thresholds Check budget violations
```

### Recommendations
```
GET /api/recommendations          List recommendations
PUT /api/recommendations/:id/apply   Mark as applied
PUT /api/recommendations/:id/dismiss Mark as dismissed
```

### Reports
```
GET /api/reports/summary       Dashboard summary KPIs
GET /api/reports/generate      Generate report (JSON or PDF)
GET /api/reports/generate?format=pdf  Download PDF
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, React Query |
| Backend | Node.js 20, Express 4, bcryptjs, jsonwebtoken |
| Database | PostgreSQL 15, raw SQL (no ORM) |
| Auth | JWT with role-based access (admin/viewer) |
| Analytics | Z-score anomaly detection, linear regression forecasting |
| Reports | PDFKit PDF generation |
| Notifications | Nodemailer (SMTP) + Slack webhooks |
| Container | Docker, Docker Compose, nginx |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/    Route handlers (auth, costs, resources, alerts, etc.)
│   │   ├── middleware/     JWT auth + validation middleware
│   │   ├── models/         Raw SQL data access layer
│   │   ├── routes/         Express route definitions
│   │   ├── services/       Azure mock, anomaly detection, forecasting, PDF, email
│   │   ├── db/             PostgreSQL connection pool
│   │   └── app.js          Express app + startup + seeding
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     Reusable UI (charts, cards, layout)
│   │   ├── pages/          Dashboard, Costs, Alerts, Budgets, Recs, Reports
│   │   ├── context/        AuthContext (React Context + JWT)
│   │   └── services/       Axios API client
│   └── Dockerfile
├── database/
│   └── init.sql            Schema + indexes
├── docker-compose.yml
└── .github/workflows/ci-cd.yml
```

---

## 📸 Screenshots

> _The application launches with mock Azure cost data pre-seeded for demonstration._

| Dashboard | Recommendations |
|-----------|----------------|
| *(KPI cards, trend chart, alerts)* | *(Savings cards with actions)* |

| Cost Breakdown | Reports |
|----------------|---------|
| *(Resource table with utilization)* | *(PDF generation)* |

---

## 🔒 Security Notes

- All passwords hashed with bcrypt (12 rounds)
- JWT tokens expire after 7 days
- Helmet.js HTTP security headers
- CORS configurable via environment variable
- Input validation via express-validator
- No secrets committed to source code

---

## 📄 License

MIT License – see [LICENSE](LICENSE) for details.
