# Azure Cloud Cost Monitor - Architecture

## System Architecture

```
                        ┌─────────────────────────────────────────────────────────┐
                        │              Azure Cloud Cost Monitor                    │
                        └─────────────────────────────────────────────────────────┘
                                                  │
                        ┌─────────────────────────┼─────────────────────────┐
                        │                         │                         │
               ┌────────▼────────┐      ┌─────────▼──────────┐   ┌─────────▼────────┐
               │    Frontend      │      │      Backend        │   │    Database       │
               │   React.js       │◄────►│  Node.js/Express   │◄──►│  PostgreSQL 15    │
               │   Port: 3000     │      │     Port: 5000      │   │   Port: 5432      │
               └────────┬────────┘      └─────────┬──────────┘   └──────────────────┘
                        │                         │
                        │               ┌──────────┴──────────┐
                        │               │      Services        │
                        │               ├──────────────────────┤
                        │               │ • Azure Mock Service │
                        │               │ • Anomaly Detection  │
                        │               │ • Forecasting        │
                        │               │ • Notifications      │
                        │               │ • Report Generator   │
                        │               └──────────────────────┘
                        │
               ┌────────▼────────────────────────────────────────┐
               │              Pages / Features                     │
               ├─────────────────────────────────────────────────┤
               │ • Dashboard      - KPI cards, charts, alerts    │
               │ • Cost Analysis  - Trends, breakdowns           │
               │ • Resources      - Inventory, utilization       │
               │ • Recommendations- Optimization suggestions     │
               │ • Budgets        - Budget management            │
               │ • Alerts         - Alert management             │
               │ • Reports        - PDF reports                  │
               └─────────────────────────────────────────────────┘
```

## Data Flow

```
Azure APIs (simulated)
        │
        ▼
┌───────────────────┐
│  Azure Service    │  ← getCostData(), getResources(), getSubscriptions()
│  (Mock/Real)      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐    ┌─────────────────────┐
│  Data Collector   │───►│  Anomaly Detection   │
│  (Cron: hourly)   │    │  (Z-score, rolling   │
└────────┬──────────┘    │   14-day window)     │
         │               └──────────┬──────────┘
         ▼                          │
┌───────────────────┐               ▼
│   PostgreSQL DB   │    ┌─────────────────────┐
│ ┌───────────────┐ │    │  Notification Svc    │
│ │ cost_records  │ │    │  (Email + Slack)     │
│ │ resources     │ │    └─────────────────────┘
│ │ alerts        │ │
│ │ recommendations│
│ │ budgets       │ │
│ │ users         │ │
│ └───────────────┘ │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   REST API        │  ← Express controllers + JWT auth
│  /api/v1/...      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   React Frontend  │  ← Recharts, React Query, React Router
│   Dark-mode UI    │
└───────────────────┘
```

## Database Schema

```sql
users
├── id (UUID PK)
├── email (unique)
├── password (bcrypt hashed)
├── name
├── role (admin|user|viewer)
├── subscriptions (JSON array)
└── notificationPreferences (JSON)

cost_records
├── id (UUID PK)
├── subscriptionId
├── resourceGroup
├── service
├── region
├── date
├── amount (decimal)
├── currency
└── tags (JSON)

resources
├── id (UUID PK)
├── subscriptionId
├── resourceId (unique)
├── resourceName
├── resourceType
├── resourceGroup
├── region
├── status (running|stopped|idle|deallocated)
├── cpuUtilization (float)
├── memoryUtilization (float)
├── costPerDay (decimal)
└── tags (JSON)

alerts
├── id (UUID PK)
├── userId (FK)
├── type (budget|anomaly|recommendation)
├── severity (low|medium|high|critical)
├── title
├── message
├── status (active|acknowledged|resolved)
└── createdAt

recommendations
├── id (UUID PK)
├── resourceId
├── subscriptionId
├── type (resize|stop|delete|rightsize|reserve|hybrid)
├── title
├── description
├── estimatedSavings (decimal)
├── priority (low|medium|high)
└── status (pending|applied|dismissed)

budgets
├── id (UUID PK)
├── userId (FK)
├── subscriptionId
├── name
├── amount (decimal)
├── currency
├── period (monthly|quarterly|annual)
├── currentSpend (decimal)
├── alertThreshold (percentage)
└── status (active|warning|exceeded)
```

## Security Architecture

```
Client Request
      │
      ▼
┌─────────────┐
│   Helmet    │  ← XSS, CSRF, Clickjacking headers
│   CORS      │  ← Origin whitelist
│  Rate Limit │  ← 300 req/15min global, 20/15min auth
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  JWT Auth   │  ← Bearer token required for all /api routes
│  Middleware │     except /auth/login, /auth/register
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    RBAC     │  ← Admin: full access
│  Middleware │     User: own resources
│             │     Viewer: read-only
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Validator  │  ← express-validator input validation
└──────┬──────┘
       │
       ▼
  Controller
```

## CI/CD Pipeline

```
git push main
     │
     ▼
GitHub Actions
├── Backend Tests (with PostgreSQL service container)
├── Frontend Build & Tests
├── Security Scan (Trivy)
└── Docker Build & Push → ghcr.io
         │
         ▼
   Production Deploy
   (docker-compose pull && docker-compose up -d)
```
