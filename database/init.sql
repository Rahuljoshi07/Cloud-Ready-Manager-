-- Azure Cloud Cost Monitoring Platform - Database Schema
-- PostgreSQL 15+

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cost_records (
  id SERIAL PRIMARY KEY,
  subscription_id VARCHAR(255),
  resource_group VARCHAR(255),
  service_name VARCHAR(255),
  region VARCHAR(255),
  cost DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  usage_date DATE,
  tags JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_records_date ON cost_records(usage_date DESC);
CREATE INDEX IF NOT EXISTS idx_cost_records_service ON cost_records(service_name);
CREATE INDEX IF NOT EXISTS idx_cost_records_subscription ON cost_records(subscription_id);
CREATE INDEX IF NOT EXISTS idx_cost_records_region ON cost_records(region);

CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  resource_id VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  type VARCHAR(255),
  resource_group VARCHAR(255),
  subscription_id VARCHAR(255),
  region VARCHAR(255),
  status VARCHAR(50),
  cpu_utilization DECIMAL(5,2),
  memory_utilization DECIMAL(5,2),
  monthly_cost DECIMAL(10,2),
  tags JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_subscription ON resources(subscription_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_cost ON resources(monthly_cost DESC);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100),
  severity VARCHAR(50),
  message TEXT,
  resource_id VARCHAR(255),
  subscription_id VARCHAR(255),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);

CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100),
  resource_id VARCHAR(255),
  resource_name VARCHAR(255),
  description TEXT,
  potential_savings DECIMAL(10,2),
  action VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_savings ON recommendations(potential_savings DESC);

CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  subscription_id VARCHAR(255),
  amount DECIMAL(10,2),
  period VARCHAR(50) DEFAULT 'monthly',
  current_spend DECIMAL(10,2) DEFAULT 0,
  threshold_percentage INTEGER DEFAULT 80,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_subscription ON budgets(subscription_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
