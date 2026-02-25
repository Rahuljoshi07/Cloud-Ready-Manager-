-- Azure Cost Monitor Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cost records table
CREATE TABLE IF NOT EXISTS cost_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id VARCHAR(255),
  resource_group VARCHAR(255),
  service_name VARCHAR(255),
  region VARCHAR(100),
  amount DECIMAL(10, 4) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  usage_date DATE NOT NULL,
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id VARCHAR(500),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255),
  resource_group VARCHAR(255),
  region VARCHAR(100),
  subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'running',
  cpu_utilization DECIMAL(5, 2),
  memory_utilization DECIMAL(5, 2),
  cost_per_day DECIMAL(10, 4),
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  resource_id VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  period VARCHAR(50) DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  current_spend DECIMAL(10, 2) DEFAULT 0,
  threshold_percentage INTEGER DEFAULT 80,
  subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id VARCHAR(500),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  estimated_savings DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'implemented')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cost_records_usage_date ON cost_records(usage_date);
CREATE INDEX IF NOT EXISTS idx_cost_records_service ON cost_records(service_name);
CREATE INDEX IF NOT EXISTS idx_cost_records_region ON cost_records(region);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);

-- Seed admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'admin@company.com',
  '$2a$10$rQ8NbM9JzF7wQ3HzVpXXCeKn1j5CvQIFXhL2eJVNk8kR4Wa1.O.Gy',
  'Admin User',
  'admin'
) ON CONFLICT (email) DO NOTHING;
