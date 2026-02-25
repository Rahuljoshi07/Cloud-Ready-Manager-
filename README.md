# ☁️ Azure Cloud Cost Monitor

> **Enterprise-grade Azure Cloud Cost Monitoring & Optimization Platform**
>
> Track cloud spending, analyze resource usage, detect anomalies, and get AI-powered optimization recommendations to reduce your infrastructure costs.

![Dashboard Preview](docs/dashboard-preview.png)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Development](#-development)
- [Deployment](#-deployment)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Contributing](#-contributing)

---

## ✨ Features

### 💰 Cost Dashboard
- Real-time total monthly cost with trend indicators
- Interactive daily cost trend charts (last 30/60/90 days)
- Cost breakdown by service, region, and resource group
- KPI cards with period-over-period comparison

### 🔍 Cost Analysis
- Multi-subscription cost comparison
- Tag-based cost allocation
- Cost by resource group with drill-down
- 90-day historical trend analysis
- Custom date range selection

### 🤖 Optimization Recommendations
- Detect idle/underutilized virtual machines
- Identify over-provisioned instances
- Find unattached disks and unused storage
- Estimated monthly savings per recommendation
- One-click apply or dismiss actions

### 🚨 Budget Alerts
- Set budget thresholds per subscription
- Configurable alert percentages (80%, 90%, 100%)
- Real-time budget utilization progress bars
- Email and Slack webhook notifications

### 📈 Cost Anomaly Detection
- Z-score based statistical anomaly detection
- Rolling 14-day average baseline
- Automatic alert creation for detected spikes
- Configurable sensitivity thresholds

### 📊 Forecasting
- Linear regression cost forecasting
- End-of-month projected spend
- 30/60/90 day forecasts
- Confidence intervals

### 📄 Reports
- Monthly cost summary PDF reports
- Optimization opportunity reports
- Downloadable and shareable
- Historical report archive

### 🔐 Authentication & Access Control
- JWT-based authentication
- Role-based access control (Admin / User / Viewer)
- Secure API endpoints
- Session management

### 🌙 Modern UI
- Dark mode by default (toggle to light)
- Enterprise-style Azure portal inspired design
- Responsive layout (desktop, tablet, mobile)
- Real-time data refresh

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Azure Cloud Monitor                      │
├─────────────────┬───────────────────────┬───────────────────────┤
│   Frontend       │       Backend          │      Database         │
│   React.js       │   Node.js/Express      │    PostgreSQL 15      │
│   Port: 3000     │      Port: 5000        │      Port: 5432       │
├─────────────────┴───────────────────────┴───────────────────────┤
│                        Docker Network                            │
└─────────────────────────────────────────────────────────────────┘

Services:
┌─────────────────┐   ┌──────────────────┐   ┌─────────────────────┐
│ Data Collector  │   │ Processing Engine │   │ Notification Service│
│ (Azure Service) │──▶│ (Anomaly, Forecast│──▶│ (Email / Slack)     │
└─────────────────┘   └──────────────────┘   └─────────────────────┘
```

### Services

| Service | Description | Port |
|---------|-------------|------|
| **Frontend** | React.js dashboard served by Nginx | 3000 |
| **Backend** | Node.js/Express REST API | 5000 |
| **PostgreSQL** | Primary database | 5432 |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, React Router v6, Recharts |
| **Backend** | Node.js 18, Express.js |
| **Database** | PostgreSQL 15, Sequelize ORM |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Containerization** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |
| **Notifications** | Nodemailer (Email), Slack Webhooks |
| **Reports** | PDFKit |
| **Charts** | Recharts (React) |

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)

### 1. Clone the repository

```bash
git clone https://github.com/Rahuljoshi07/Cloud-Ready-Manager-.git
cd Cloud-Ready-Manager-
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your settings (defaults work for demo)
```

### 3. Start the platform

```bash
docker-compose up -d
```

### 4. Access the application

| Service | URL |
|---------|-----|
| **Dashboard** | http://localhost:3000 |
| **API** | http://localhost:5000 |
| **API Health** | http://localhost:5000/health |

### 5. Login with demo credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@contoso.com | Admin@123 |
| **Viewer** | viewer@contoso.com | Viewer@123 |

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DB_NAME=azure_monitor
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=postgres
DB_PORT=5432

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h

# Frontend
REACT_APP_API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Azure (optional - uses mock data if not provided)
AZURE_SUBSCRIPTION_ID=your_subscription_id
AZURE_TENANT_ID=your_tenant_id
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret

# Email Notifications (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Slack Notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## 📡 API Reference

### Authentication

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@contoso.com",
  "password": "Admin@123"
}
```

### Cost Data

```http
# Get dashboard overview
GET /api/v1/costs/dashboard
Authorization: Bearer <token>

# Get cost trend (daily)
GET /api/v1/costs/trend?days=30&subscriptionId=sub-001
Authorization: Bearer <token>

# Get cost by service
GET /api/v1/costs/by-service?period=monthly
Authorization: Bearer <token>

# Get cost forecast
GET /api/v1/costs/forecast?days=30
Authorization: Bearer <token>
```

### Resources

```http
# List all resources
GET /api/v1/resources?page=1&limit=20&status=idle
Authorization: Bearer <token>

# Get top expensive resources
GET /api/v1/resources/top-expensive?limit=10
Authorization: Bearer <token>

# Get idle resources
GET /api/v1/resources/idle
Authorization: Bearer <token>
```

### Recommendations

```http
# List recommendations
GET /api/v1/recommendations
Authorization: Bearer <token>

# Apply recommendation
PUT /api/v1/recommendations/:id/apply
Authorization: Bearer <token>

# Dismiss recommendation
PUT /api/v1/recommendations/:id/dismiss
Authorization: Bearer <token>
```

### Budgets

```http
# Create budget
POST /api/v1/budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Production Budget",
  "subscriptionId": "sub-001",
  "amount": 5000,
  "currency": "USD",
  "period": "monthly",
  "alertThreshold": 80
}
```

### Reports

```http
# Generate and download monthly report (PDF)
GET /api/v1/reports/monthly/:year/:month
Authorization: Bearer <token>

# Generate optimization report (PDF)
GET /api/v1/reports/optimization
Authorization: Bearer <token>
```

---

## 💻 Development

### Without Docker (local development)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure your PostgreSQL connection in .env
npm run dev
```

#### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000
npm start
```

### With Docker (development mode)

```bash
docker-compose up --build
```

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

---

## 🚢 Deployment

### Production with Docker Compose

```bash
# Build and start in production mode
docker-compose -f docker-compose.yml up -d --build

# View logs
docker-compose logs -f

# Scale backend (optional)
docker-compose up -d --scale backend=2
```

### GitHub Actions CI/CD

The pipeline automatically:
1. ✅ Runs backend tests (with PostgreSQL service)
2. ✅ Builds and tests the frontend
3. ✅ Runs security scans with Trivy
4. ✅ Builds and pushes Docker images to GitHub Container Registry (on `main` branch push)

**Required GitHub Secrets:**
- `REACT_APP_API_URL` - Production API URL

---

## 🗄️ Database Schema

### Tables

```sql
-- Users table
users (id, email, password, name, role, subscriptions, createdAt, updatedAt)

-- Cost records from Azure
cost_records (id, subscriptionId, resourceGroup, service, region, date, amount, currency, tags)

-- Azure resources
resources (id, subscriptionId, resourceId, resourceName, resourceType, resourceGroup, 
           region, status, cpuUtilization, memoryUtilization, costPerDay, tags)

-- System alerts
alerts (id, userId, type, severity, title, message, resourceId, status, createdAt)

-- Optimization recommendations
recommendations (id, resourceId, subscriptionId, type, title, description, 
                 estimatedSavings, priority, status, createdAt)

-- Cost budgets
budgets (id, userId, subscriptionId, name, amount, currency, period, 
         currentSpend, alertThreshold, status, createdAt)
```

---

## 🔐 Security

- **JWT Authentication**: All API endpoints (except auth) require valid JWT tokens
- **Password Hashing**: Passwords hashed with bcrypt (salt rounds: 12)
- **Rate Limiting**: API rate limiting to prevent abuse (100 req/15min per IP)
- **Helmet.js**: Security headers (XSS, CSRF, clickjacking protection)
- **Input Validation**: All inputs validated with express-validator
- **Environment Variables**: Secrets stored in environment variables, never in code
- **CORS**: Configured to only allow requests from the frontend domain

---

## 📁 Project Structure

```
Cloud-Ready-Manager-/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── backend/
│   ├── src/
│   │   ├── config/             # Database & Azure config
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, validation, errors
│   │   ├── models/             # Sequelize models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── utils/              # Helpers
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth & Theme contexts
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   └── utils/              # Formatters, helpers
│   ├── Dockerfile
│   └── package.json
├── scripts/
│   └── init.sql                # Database initialization
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🎯 Demo Data

The platform auto-seeds realistic demo data on first boot:
- **3 Azure subscriptions** (Production, Development, Staging)
- **90 days of historical cost data** across 15 Azure services
- **20+ mock resources** (VMs, Storage, Databases, App Services)
- **Optimization recommendations** with estimated savings
- **Budget configurations** with alert thresholds

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Rahul Joshi**
- GitHub: [@Rahuljoshi07](https://github.com/Rahuljoshi07)

---

*Built for FinOps and DevOps teams to gain full visibility into Azure cloud costs.*
