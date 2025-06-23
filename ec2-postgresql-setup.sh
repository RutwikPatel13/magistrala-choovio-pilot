#!/bin/bash

echo "🚀 Setting up PostgreSQL Backend on EC2..."
echo "📅 $(date)"

# Update system
echo "📦 Updating system packages..."
sudo apt update -y
sudo apt upgrade -y

# Install Node.js (if not already installed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Docker (if not already installed)
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker ubuntu
fi

# Install Docker Compose (if not already installed)
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create project directory
echo "📁 Creating project directory..."
mkdir -p /home/ubuntu/postgresql-backend
cd /home/ubuntu/postgresql-backend

# Create package.json
echo "📄 Creating package.json..."
cat > package.json << 'PACKAGE_EOF'
{
  "name": "magistrala-postgresql-backend",
  "version": "1.0.0",
  "description": "PostgreSQL backend API for Magistrala backup and sync system",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "setup-db": "node scripts/setup-database.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "uuid": "^9.0.1",
    "morgan": "^1.10.0"
  },
  "keywords": ["magistrala", "postgresql", "iot", "backup", "sync"],
  "author": "Choovio Team",
  "license": "Apache-2.0",
  "engines": {
    "node": ">=16.0.0"
  }
}
PACKAGE_EOF

# Create .env file
echo "🔧 Creating .env configuration..."
cat > .env << 'ENV_EOF'
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=magistrala_backup
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Server Configuration
PORT=3001
NODE_ENV=production

# Security
JWT_SECRET=choovio-magistrala-backup-secret-2025

# CORS Origins
CORS_ORIGINS=http://localhost:3000,https://choovio-iot-dashboard-1750453820.s3-website-us-east-1.amazonaws.com,http://34.207.208.152:3001
ENV_EOF

# Create PostgreSQL schema
echo "🗄️ Creating database schema..."
cat > schema.sql << 'SCHEMA_EOF'
-- PostgreSQL Database Schema for Magistrala Backup System
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    magistrala_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'synced',
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Things (Devices) table
CREATE TABLE IF NOT EXISTS things (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    magistrala_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    secret VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'synced',
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    magistrala_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'synced',
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LoRaWAN Devices table
CREATE TABLE IF NOT EXISTS lorawan_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    magistrala_id VARCHAR(255) UNIQUE,
    thing_id UUID REFERENCES things(id),
    dev_eui VARCHAR(16) UNIQUE NOT NULL,
    app_eui VARCHAR(16),
    app_key VARCHAR(32),
    dev_addr VARCHAR(8),
    nwk_s_key VARCHAR(32),
    app_s_key VARCHAR(32),
    frequency_plan VARCHAR(100),
    lorawan_version VARCHAR(20) DEFAULT '1.0.3',
    regional_parameters VARCHAR(20) DEFAULT 'RP001-1.0.3-RevA',
    class VARCHAR(10) DEFAULT 'A',
    supports_join BOOLEAN DEFAULT true,
    rx1_delay INTEGER DEFAULT 1,
    rx1_dr_offset INTEGER DEFAULT 0,
    rx2_dr INTEGER DEFAULT 0,
    rx2_frequency BIGINT,
    factory_preset_freqs INTEGER[],
    max_eirp INTEGER DEFAULT 16,
    supports_32bit_f_cnt BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'synced',
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thing_id UUID REFERENCES things(id),
    channel_id UUID REFERENCES channels(id),
    connection_type VARCHAR(50) DEFAULT 'publish',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'synced',
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(thing_id, channel_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channels(id),
    thing_id UUID REFERENCES things(id),
    protocol VARCHAR(20),
    content_type VARCHAR(100),
    payload JSONB,
    subtopic VARCHAR(255),
    publisher VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    category VARCHAR(100),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'synced',
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sync Log table
CREATE TABLE IF NOT EXISTS sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    magistrala_id VARCHAR(255),
    operation VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_things_owner_id ON things(owner_id);
CREATE INDEX IF NOT EXISTS idx_things_magistrala_id ON things(magistrala_id);
CREATE INDEX IF NOT EXISTS idx_channels_owner_id ON channels(owner_id);
CREATE INDEX IF NOT EXISTS idx_channels_magistrala_id ON channels(magistrala_id);
CREATE INDEX IF NOT EXISTS idx_lorawan_devices_thing_id ON lorawan_devices(thing_id);
CREATE INDEX IF NOT EXISTS idx_lorawan_devices_dev_eui ON lorawan_devices(dev_eui);

-- Sample data
INSERT INTO users (magistrala_id, email, username, first_name, last_name, role, metadata) 
VALUES 
    ('demo_admin_2025', 'admin@choovio.com', 'admin', 'Admin', 'User', 'admin', '{"demo": true, "created_by": "system"}'),
    ('demo_user_2025', 'user@choovio.com', 'user', 'Demo', 'User', 'user', '{"demo": true, "created_by": "system"}')
ON CONFLICT (email) DO NOTHING;
SCHEMA_EOF

# Create Docker Compose file
echo "🐳 Creating Docker Compose configuration..."
cat > docker-compose.yml << 'COMPOSE_EOF'
services:
  postgres:
    image: postgres:15-alpine
    container_name: magistrala-postgres-backup
    environment:
      POSTGRES_DB: magistrala_backup
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
    networks:
      - magistrala-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d magistrala_backup"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local

networks:
  magistrala-network:
    driver: bridge
    external: false
COMPOSE_EOF

echo "📦 Installing npm dependencies..."
npm install

echo "🐳 Starting PostgreSQL with Docker Compose..."
sudo docker-compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 15

echo "🎯 Starting Node.js backend..."
nohup npm start > backend.log 2>&1 &

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🔍 Testing services..."
echo "PostgreSQL Health:"
sudo docker exec magistrala-postgres-backup pg_isready -U postgres -d magistrala_backup

echo "Backend API Health:"
curl -s http://localhost:3001/api/health | jq . || curl -s http://localhost:3001/api/health

echo "✅ PostgreSQL Backend deployment completed!"
echo "📊 Service Status:"
echo "- PostgreSQL: Running on port 5432"
echo "- Backend API: Running on port 3001"
echo "- PgAdmin: Available on port 5050 (if enabled)"

echo "🔗 Useful URLs:"
echo "- Health Check: http://34.207.208.152:3001/api/health"
echo "- Database Stats: http://34.207.208.152:3001/api/stats"

echo "📋 Next steps:"
echo "1. Update React app to use EC2 PostgreSQL: REACT_APP_POSTGRES_API_URL=http://34.207.208.152:3001/api"
echo "2. Open port 3001 in EC2 security group if needed"
echo "3. Test the dual-write system"

echo "🎉 Setup complete!"