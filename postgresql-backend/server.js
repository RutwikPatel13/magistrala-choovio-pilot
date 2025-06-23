/**
 * PostgreSQL Backend API for Magistrala Backup System
 * Provides REST API for PostgreSQL operations from React frontend
 */

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
    ? ['https://choovio-iot-dashboard-1750453820.s3-website-us-east-1.amazonaws.com', 'http://localhost:3000']
    : true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
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

// ==================== USERS ENDPOINTS ====================

app.get('/api/users', async (req, res) => {
  try {
    const { limit = 50, offset = 0, status = 'active' } = req.query;
    const result = await pool.query(
      'SELECT * FROM users WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [status, limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { magistrala_id, email, username, first_name, last_name, role, metadata } = req.body;
    const result = await pool.query(
      'INSERT INTO users (magistrala_id, email, username, first_name, last_name, role, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [magistrala_id, email, username, first_name, last_name, role || 'user', metadata || {}]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'User already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { email, username, first_name, last_name, role, metadata } = req.body;
    const result = await pool.query(
      'UPDATE users SET email = $1, username = $2, first_name = $3, last_name = $4, role = $5, metadata = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [email, username, first_name, last_name, role, metadata, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== THINGS ENDPOINTS ====================

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
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Thing already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/api/things/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM things WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thing not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/things/:id', async (req, res) => {
  try {
    const { name, description, status, tags, metadata } = req.body;
    const result = await pool.query(
      'UPDATE things SET name = $1, description = $2, status = $3, tags = $4, metadata = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, description, status, tags, metadata, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thing not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/things/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM things WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thing not found' });
    }
    res.json({ message: 'Thing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHANNELS ENDPOINTS ====================

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
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Channel already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/api/channels/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM channels WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/channels/:id', async (req, res) => {
  try {
    const { name, description, metadata } = req.body;
    const result = await pool.query(
      'UPDATE channels SET name = $1, description = $2, metadata = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, description, metadata, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/channels/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM channels WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== LORAWAN DEVICES ENDPOINTS ====================

app.get('/api/lorawan-devices', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await pool.query(
      'SELECT ld.*, t.name as thing_name FROM lorawan_devices ld LEFT JOIN things t ON ld.thing_id = t.id ORDER BY ld.created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lorawan-devices', async (req, res) => {
  try {
    const {
      magistrala_id, thing_id, dev_eui, app_eui, app_key, dev_addr,
      nwk_s_key, app_s_key, frequency_plan, lorawan_version, 
      regional_parameters, class: deviceClass, supports_join,
      rx1_delay, rx1_dr_offset, rx2_dr, rx2_frequency,
      factory_preset_freqs, max_eirp, supports_32bit_f_cnt, metadata
    } = req.body;

    const result = await pool.query(
      `INSERT INTO lorawan_devices (
        magistrala_id, thing_id, dev_eui, app_eui, app_key, dev_addr,
        nwk_s_key, app_s_key, frequency_plan, lorawan_version,
        regional_parameters, class, supports_join, rx1_delay,
        rx1_dr_offset, rx2_dr, rx2_frequency, factory_preset_freqs,
        max_eirp, supports_32bit_f_cnt, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *`,
      [
        magistrala_id, thing_id, dev_eui, app_eui, app_key, dev_addr,
        nwk_s_key, app_s_key, frequency_plan || 'EU868', 
        lorawan_version || '1.0.3', regional_parameters || 'RP001-1.0.3-RevA',
        deviceClass || 'A', supports_join !== false, rx1_delay || 1,
        rx1_dr_offset || 0, rx2_dr || 0, rx2_frequency,
        factory_preset_freqs || [], max_eirp || 16,
        supports_32bit_f_cnt !== false, metadata || {}
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'LoRaWAN device already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/api/lorawan-devices/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT ld.*, t.name as thing_name FROM lorawan_devices ld LEFT JOIN things t ON ld.thing_id = t.id WHERE ld.id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'LoRaWAN device not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/lorawan-devices/:id', async (req, res) => {
  try {
    const { dev_eui, app_eui, app_key, frequency_plan, metadata } = req.body;
    const result = await pool.query(
      'UPDATE lorawan_devices SET dev_eui = $1, app_eui = $2, app_key = $3, frequency_plan = $4, metadata = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [dev_eui, app_eui, app_key, frequency_plan, metadata, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'LoRaWAN device not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/lorawan-devices/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lorawan_devices WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'LoRaWAN device not found' });
    }
    res.json({ message: 'LoRaWAN device deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CONNECTIONS ENDPOINTS ====================

app.get('/api/connections', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.thing_id, c.channel_id, c.connection_type, c.created_at,
        t.name as thing_name, t.magistrala_id as thing_magistrala_id,
        ch.name as channel_name, ch.magistrala_id as channel_magistrala_id
      FROM connections c
      JOIN things t ON c.thing_id = t.id
      JOIN channels ch ON c.channel_id = ch.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/connections', async (req, res) => {
  try {
    const { thing_id, channel_id, connection_type } = req.body;
    const result = await pool.query(
      'INSERT INTO connections (thing_id, channel_id, connection_type) VALUES ($1, $2, $3) RETURNING *',
      [thing_id, channel_id, connection_type || 'publish']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Connection already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete('/api/connections/:thingId/:channelId', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM connections WHERE thing_id = $1 AND channel_id = $2 RETURNING *',
      [req.params.thingId, req.params.channelId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    res.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MESSAGES ENDPOINTS ====================

app.get('/api/messages', async (req, res) => {
  try {
    const { limit = 100, offset = 0, channel_id, thing_id } = req.query;
    
    let query = 'SELECT * FROM messages';
    let params = [];
    let whereConditions = [];

    if (channel_id) {
      whereConditions.push(`channel_id = $${params.length + 1}`);
      params.push(channel_id);
    }

    if (thing_id) {
      whereConditions.push(`thing_id = $${params.length + 1}`);
      params.push(thing_id);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { channel_id, thing_id, protocol, content_type, payload, subtopic, publisher } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (channel_id, thing_id, protocol, content_type, payload, subtopic, publisher) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [channel_id, thing_id, protocol || 'http', content_type || 'application/json', payload, subtopic, publisher]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SYNC LOG ENDPOINTS ====================

app.post('/api/sync-log', async (req, res) => {
  try {
    const { table_name, record_id, magistrala_id, operation, status, error_message, request_data, response_data } = req.body;
    const result = await pool.query(
      'INSERT INTO sync_log (table_name, record_id, magistrala_id, operation, status, error_message, request_data, response_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [table_name, record_id, magistrala_id, operation, status, error_message, request_data, response_data]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sync-log', async (req, res) => {
  try {
    const { limit = 100, offset = 0, table_name, status } = req.query;
    
    let query = 'SELECT * FROM sync_log';
    let params = [];
    let whereConditions = [];

    if (table_name) {
      whereConditions.push(`table_name = $${params.length + 1}`);
      params.push(table_name);
    }

    if (status) {
      whereConditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SETTINGS ENDPOINTS ====================

app.get('/api/settings', async (req, res) => {
  try {
    const { category, user_id } = req.query;
    
    let query = 'SELECT * FROM settings';
    let params = [];
    let whereConditions = [];

    if (category) {
      whereConditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }

    if (user_id) {
      whereConditions.push(`user_id = $${params.length + 1}`);
      params.push(user_id);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { key, value, description, category, user_id } = req.body;
    const result = await pool.query(
      'INSERT INTO settings (key, value, description, category, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [key, value, description, category, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Setting key already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.put('/api/settings/:key', async (req, res) => {
  try {
    const { value, description } = req.body;
    const result = await pool.query(
      'UPDATE settings SET value = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE key = $3 RETURNING *',
      [value, description, req.params.key]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/settings/:key', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM settings WHERE key = $1 RETURNING *', [req.params.key]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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