const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection...');
  console.log('Config:', {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'magistrala_backup',
    user: process.env.POSTGRES_USER || 'postgres'
  });

  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'magistrala_backup',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('📡 Attempting connection...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT NOW(), current_user, current_database()');
    console.log('✅ Query result:', result.rows[0]);
    
    const tablesResult = await client.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log('✅ Tables found:', tablesResult.rows[0].table_count);
    
    client.release();
    await pool.end();
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
    await pool.end();
  }
}

testConnection();