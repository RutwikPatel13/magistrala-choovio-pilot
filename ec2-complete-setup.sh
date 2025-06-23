#!/bin/bash

echo "🚀 Complete PostgreSQL Backend Setup for EC2"
echo "📅 $(date)"

# First, run the basic setup
curl -sSL https://raw.githubusercontent.com/rutwik/magistrala-pilot/main/ec2-postgresql-setup.sh | bash

# Now add the server.js file
cd /home/ubuntu/postgresql-backend

echo "📄 Creating server.js..."
cat > server.js << 'SERVER_EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'magistrala_backup',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://choovio-iot-dashboard-1750453820.s3-website-us-east-1.amazonaws.com', 'http://localhost:3000', 'http://34.207.208.152:3001']
    : true,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      timestamp: result.rows[0].now,
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

// Database statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const queries = [
      'SELECT COUNT(*) as count FROM users',
      'SELECT COUNT(*) as count FROM things',
      'SELECT COUNT(*) as count FROM channels',
      'SELECT COUNT(*) as count FROM lorawan_devices',
      'SELECT COUNT(*) as count FROM connections',
      'SELECT COUNT(*) as count FROM messages',
      'SELECT COUNT(*) as count FROM settings'
    ];

    const results = await Promise.all(
      queries.map(query => pool.query(query))
    );

    res.json({
      users: parseInt(results[0].rows[0].count),
      things: parseInt(results[1].rows[0].count),
      channels: parseInt(results[2].rows[0].count),
      lorawan_devices: parseInt(results[3].rows[0].count),
      connections: parseInt(results[4].rows[0].count),
      messages: parseInt(results[5].rows[0].count),
      settings: parseInt(results[6].rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Things endpoints
app.get('/api/things', async (req, res) => {
  try {
    const { limit = 50, offset = 0, status = 'active' } = req.query;
    const result = await pool.query(
      'SELECT * FROM things WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [status, limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/things', async (req, res) => {
  try {
    const { magistrala_id, name, description, secret, status, tags, metadata, owner_id } = req.body;
    const result = await pool.query(
      'INSERT INTO things (magistrala_id, name, description, secret, status, tags, metadata, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [magistrala_id, name, description, secret, status || 'active', tags || [], metadata || {}, owner_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Thing already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Channels endpoints
app.get('/api/channels', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await pool.query(
      'SELECT * FROM channels ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/channels', async (req, res) => {
  try {
    const { magistrala_id, name, description, metadata, owner_id } = req.body;
    const result = await pool.query(
      'INSERT INTO channels (magistrala_id, name, description, metadata, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [magistrala_id, name, description, metadata || {}, owner_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Channel already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PostgreSQL Backend API running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.POSTGRES_DB || 'magistrala_backup'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down PostgreSQL Backend API...');
  await pool.end();
  process.exit(0);
});
SERVER_EOF

echo "🔄 Restarting services..."
pkill -f "node server.js" || true
sleep 2
nohup npm start > backend.log 2>&1 &

echo "⏳ Waiting for services to restart..."
sleep 10

echo "🔍 Final testing..."
curl -s http://localhost:3001/api/health

echo "✅ Complete setup finished!"
SERVER_EOF