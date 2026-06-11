/**
 * One-time migration: Add 'sent_to_editor' to feeds.status ENUM
 * Run: node migrate-enum.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'podwave_admin',
  });

  console.log('Connected to MySQL');

  // Check current column definition
  const [cols] = await conn.execute("SHOW COLUMNS FROM feeds LIKE 'status'");
  console.log('Current status column:', cols[0]);

  // Alter the ENUM to add 'sent_to_editor'
  await conn.execute(
    "ALTER TABLE feeds MODIFY COLUMN status ENUM('active','failed','pending','sent_to_editor') DEFAULT 'pending'"
  );
  console.log("✓ ALTER TABLE complete: added 'sent_to_editor' to status ENUM");

  // Verify
  const [updated] = await conn.execute("SHOW COLUMNS FROM feeds LIKE 'status'");
  console.log('Updated status column:', updated[0]);

  await conn.end();
  console.log('Done!');
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
