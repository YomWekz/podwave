/**
 * MongoDB Connection Configuration
 * Connects to MongoDB Atlas
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI || mongoURI === 'your_mongodb_atlas_connection_string') {
      console.warn('⚠️  MongoDB URI not configured. Using mock data mode.');
      console.warn('   Set MONGODB_URI in .env file to connect to MongoDB Atlas.');
      return false;
    }
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    console.log(`  Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.warn('⚠️  Running in mock data mode.');
    return false;
  }
}

/**
 * Check if MongoDB is connected
 * @returns {boolean}
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
  }
}

module.exports = {
  connectDB,
  isConnected,
  disconnectDB
};
