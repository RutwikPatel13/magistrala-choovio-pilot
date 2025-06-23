#!/bin/bash

echo "🚀 Deploying PostgreSQL Backend to EC2..."

# Create the PostgreSQL backend directory
mkdir -p /home/ubuntu/postgresql-backend
cd /home/ubuntu/postgresql-backend

echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "magistrala-postgresql-backend",
  "version": "1.0.0",
  "description": "PostgreSQL backend API for Magistrala backup and sync system",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
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
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  },
  "keywords": [
    "magistrala",
    "postgresql",
    "iot",
    "backup",
    "sync"
  ],
  "author": "Choovio Team",
  "license": "Apache-2.0",
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

echo "🔧 Creating .env configuration..."
cat > .env << 'EOF'
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

# CORS Origins (comma separated)
CORS_ORIGINS=http://localhost:3000,https://choovio-iot-dashboard-1750453820.s3-website-us-east-1.amazonaws.com,http://34.207.208.152:3001
EOF

echo "🐳 Creating Docker Compose configuration..."
cat > docker-compose.yml << 'EOF'
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

  postgres-backend:
    build: .
    container_name: magistrala-postgres-backend
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_DB: magistrala_backup
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      PORT: 3001
      NODE_ENV: production
      CORS_ORIGINS: "http://localhost:3000,https://choovio-iot-dashboard-1750453820.s3-website-us-east-1.amazonaws.com,http://34.207.208.152:3001"
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - magistrala-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: magistrala-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@choovio.com
      PGADMIN_DEFAULT_PASSWORD: ChoovioAdmin2025!
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - magistrala-network
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  pgadmin_data:
    driver: local

networks:
  magistrala-network:
    driver: bridge
    external: false
EOF

echo "🐳 Creating Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Install curl for healthchecks
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
EOF

echo "✅ All configuration files created successfully!"
echo "📍 Next steps:"
echo "1. Install Node.js and npm"
echo "2. Install dependencies: npm install"
echo "3. Start services: docker-compose up -d"
echo "4. Test: curl http://localhost:3001/api/health"