const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true // Allow multiple SQL statements in one query
});

async function initializeDatabase() {
  try {
    console.log("Initializing database...");
    const sqlFilePath = path.join(__dirname, '..', 'dogwalks.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // It's better to connect without specifying a database first to create it
    const initialConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await initialConnection.query(`USE ${process.env.DB_NAME}`);
    
    // Now execute the rest of the script using the pool's connection
    await initialConnection.query(sql);
    
    await initialConnection.end();
    
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Exit the process if the database can't be set up
    process.exit(1);
  }
}

module.exports = {
  pool,
  initializeDatabase
}; 