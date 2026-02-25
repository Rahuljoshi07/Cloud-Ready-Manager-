-- Azure Cost Monitor Database Initialization
-- This script runs on first PostgreSQL startup

CREATE DATABASE azure_monitor;

\c azure_monitor;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE azure_monitor TO postgres;
