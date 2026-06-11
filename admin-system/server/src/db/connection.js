/**
 * MySQL Database Connection
 * Handles connection pooling and query execution
 */

const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'podwave_admin',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

/**
 * Execute a parameterized query
 * @param {string} sql - SQL query with placeholders
 * @param {Array} params - Parameters to substitute
 * @returns {Promise<Array>} Query results
 */
async function query(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    }
}

/**
 * Get a single row from query
 * @param {string} sql - SQL query with placeholders
 * @param {Array} params - Parameters to substitute
 * @returns {Promise<Object|null>} Single row or null
 */
async function queryOne(sql, params = []) {
    const results = await query(sql, params);
    return results[0] || null;
}

/**
 * Insert a row and return the inserted ID
 * @param {string} table - Table name
 * @param {Object} data - Key-value pairs to insert
 * @returns {Promise<number>} Inserted ID
 */
async function insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.map(k => `\`${k}\``).join(', ');
    
    const sql = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`;
    const result = await query(sql, values);
    return result.insertId;
}

/**
 * Update rows in a table
 * @param {string} table - Table name
 * @param {Object} data - Key-value pairs to update
 * @param {string} where - WHERE clause (without WHERE keyword)
 * @param {Array} whereParams - Parameters for WHERE clause
 * @returns {Promise<number>} Number of affected rows
 */
async function update(table, data, where, whereParams = []) {
    const setClause = Object.keys(data)
        .map(k => `\`${k}\` = ?`)
        .join(', ');
    const values = [...Object.values(data), ...whereParams];
    
    const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${where}`;
    const result = await query(sql, values);
    return result.affectedRows;
}

/**
 * Delete rows from a table
 * @param {string} table - Table name
 * @param {string} where - WHERE clause (without WHERE keyword)
 * @param {Array} whereParams - Parameters for WHERE clause
 * @returns {Promise<number>} Number of affected rows
 */
async function remove(table, where, whereParams = []) {
    const sql = `DELETE FROM \`${table}\` WHERE ${where}`;
    const result = await query(sql, whereParams);
    return result.affectedRows;
}

/**
 * Test database connection
 * Includes a 5-second timeout so a slow/hung MySQL never blocks server startup.
 * @returns {Promise<boolean>} True if connected
 */
async function testConnection() {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout after 5s')), 5000)
    );

    const connect = async () => {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return true;
    };

    try {
        await Promise.race([connect(), timeout]);
        console.log('✓ MySQL database connected successfully');
        return true;
    } catch (error) {
        console.error('✗ MySQL connection failed:', error.message);
        return false;
    }
}

/**
 * Close all connections in the pool
 */
async function closePool() {
    await pool.end();
    console.log('MySQL connection pool closed');
}

module.exports = {
    pool,
    query,
    queryOne,
    insert,
    update,
    remove,
    testConnection,
    closePool
};
