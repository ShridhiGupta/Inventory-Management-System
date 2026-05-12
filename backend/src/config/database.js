const mongoose = require('mongoose');
const { runMigrations } = require('../migrations/runner');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // mongoose.connect() resolves to the mongoose singleton; the driver DB lives on .connection
    await runMigrations(mongoose.connection);
    console.log('Database migrations complete');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
