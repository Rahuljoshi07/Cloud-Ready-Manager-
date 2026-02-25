# Azure Cloud Cost Monitoring & Optimization Platform

[![CI/CD Pipeline](https://github.com/org/azure-cost-monitor/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/org/azure-cost-monitor/actions/workflows/ci-cd.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack enterprise-grade platform for monitoring, analyzing, and optimizing Azure cloud costs. Features real-time cost dashboards, budget management, intelligent recommendations, and anomaly detection — all powered by mock Azure data for demo purposes.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Azure Cost Monitor                        │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   Frontend   │    │   Backend    │    │  PostgreSQL   │  │
│  │  React.js    │◄──►│  Node.js /   │◄──►│   Database    │  │
│  │  + Recharts  │    │  Express     │    │  (Port 5432)  │  │
│  │  (Port 3000) │    │  (Port 5000) │    └───────────────┘  │
│  └──────────────┘    └──────┬───────┘                       │
│                             │                                │
│                    ┌────────▼────────┐                       │
│                    │  Azure Mock     │                       │
│                    │  Service        │                       │
│                    │  (Cost Data,    │                       │
│                    │   Resources,    │                       │
│                    │   Forecasts)    │                       │
│                    └─────────────────┘                       │
└──────────────────────────────────────────────────────────────┘
```

---

## Features

- **📊 Real-time Dashboard** — KPI cards, cost trend charts with 30-day history + 14-day forecast
- **💰 Cost Breakdown** — Drill down by service, region, resource group, and top 10 resources
- **🎯 Budget Management** — Create/track budgets with visual progress bars and threshold alerts
- **🔔 Smart Alerts** — Cost anomaly detection, budget breach alerts, idle resource notifications
- **💡 Optimization Recommendations** — AI-driven suggestions with estimated monthly savings
- **📈 Cost Forecasting** — Linear regression-based 30-day cost projections
- **🌙 Dark/Light Theme** — Professional Azure-inspired dark theme with toggle
- **🔐 JWT Authentication** — Secure login with role-based access (admin/viewer)
- **🐳 Docker Ready** — Full Docker Compose setup for one-command deployment

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, Lucide Icons |
| Backend | Node.js 18, Express 4, JWT, bcryptjs |
| Database | PostgreSQL 15 |
| Styling | CSS Variables, custom dark theme |
| DevOps | Docker, Docker Compose, GitHub Actions |
| HTTP Client | Axios |

---

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 15 (for local dev) OR Docker + Docker Compose

---

## Quick Start

### With Docker (Recommended)

```bash
git clone <repo-url>
cd azure-cost-monitor

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the app at [http://localhost:3000](http://localhost:3000)

---

### Without Docker (Local Development)

#### 1. Setup Database

```bash
psql -U postgres -c "CREATE DATABASE azure_cost_monitor;"
psql -U postgres -d azure_cost_monitor -f backend/src/db/schema.sql
```

#### 2. Start Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run dev
# API running at http://localhost:5000
```

#### 3. Start Frontend

```bash
cd frontend
npm install
npm start
# App running at http://localhost:3000
```

---

## Demo Login

| Field | Value |
|-------|-------|
| Email | `admin@company.com` |
| Password | `admin123` |

---

## API Documentation

All API endpoints require `Authorization: Bearer <token>` header (except auth routes).

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/logout` | Logout |
| GET  | `/api/auth/profile` | Get current user |

### Costs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/costs/summary` | KPI summary (total, daily avg, resources) |
| GET | `/api/costs/monthly` | 30-day cost data + anomaly detection |
| GET | `/api/costs/by-service` | Cost breakdown by Azure service |
| GET | `/api/costs/by-region` | Cost breakdown by region |
| GET | `/api/costs/by-resource-group` | Cost by resource group |
| GET | `/api/costs/top-resources` | Top 10 most expensive resources |
| GET | `/api/costs/forecast?days=30` | Linear regression forecast |

### Budgets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | List all budgets |
| POST | `/api/budgets` | Create new budget |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List alerts (filter by `severity`, `status`) |
| POST | `/api/alerts` | Create alert |
| PUT | `/api/alerts/:id` | Update alert status |
| DELETE | `/api/alerts/:id` | Delete alert |

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | List recommendations |
| PUT | `/api/recommendations/:id` | Update status (active/implemented/dismissed) |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | API server port |
| `NODE_ENV` | `development` | Environment |
| `JWT_SECRET` | — | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `azure_cost_monitor` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |

---

## Project Structure

```
azure-cost-monitor/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth & error handling
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Azure mock, forecasting, anomaly detection
│   │   ├── utils/           # Date utilities
│   │   ├── db/              # DB connection + schema
│   │   └── app.js           # Express app entry
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Auth & Theme context
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx          # Router setup
│   │   └── index.css        # Global styles + CSS variables
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .github/workflows/ci-cd.yml
└── README.md
```

---

## License

MIT © 2024 Azure Cost Monitor
