/**
 * Database Setup Script
 * Creates PostgreSQL database and runs initial schema
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🗄️ Setting up PostgreSQL database for Magistrala backup system...');

  // First connect to postgres database to create our database
  const adminPool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: 'postgres', // Default postgres database
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
  });

  const dbName = process.env.POSTGRES_DB || 'magistrala_backup';

  try {
    // Check if database exists
    const dbCheck = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (dbCheck.rows.length === 0) {
      // Create database
      console.log(`📊 Creating database: ${dbName}`);
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      console.log('✅ Database created successfully');
    } else {
      console.log(`📊 Database ${dbName} already exists`);
    }

    await adminPool.end();

    // Now connect to our new database and run schema
    const pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: dbName,
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
    });

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../../custom-dashboard/src/database/schema.sql');
    console.log('📄 Reading schema file:', schemaPath);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('🔧 Executing database schema...');
    
    await pool.query(schema);
    console.log('✅ Database schema created successfully');

    // Test the connection and show statistics
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM things) as things,
        (SELECT COUNT(*) FROM channels) as channels,
        (SELECT COUNT(*) FROM lorawan_devices) as lorawan_devices,
        (SELECT COUNT(*) FROM connections) as connections,
        (SELECT COUNT(*) FROM messages) as messages,
        (SELECT COUNT(*) FROM settings) as settings
    `);

    console.log('📊 Database Statistics:');
    console.log(`  Users: ${stats.rows[0].users}`);
    console.log(`  Things: ${stats.rows[0].things}`);
    console.log(`  Channels: ${stats.rows[0].channels}`);
    console.log(`  LoRaWAN Devices: ${stats.rows[0].lorawan_devices}`);
    console.log(`  Connections: ${stats.rows[0].connections}`);
    console.log(`  Messages: ${stats.rows[0].messages}`);
    console.log(`  Settings: ${stats.rows[0].settings}`);

    await pool.end();
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };