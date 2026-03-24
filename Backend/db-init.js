// Database initialization script to add profile_pic column if it doesn't exist
const db = require('./db');

const initDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Check if profile_pic column exists, if not add it
    const query = `
      ALTER TABLE users ADD COLUMN profile_pic VARCHAR(255) DEFAULT NULL;
    `;
    
    try {
      await db.query(query);
      console.log('✅ profile_pic column added to users table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ profile_pic column already exists');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
};

module.exports = initDatabase;
