const mongoose = require('mongoose');
const { runMigrations } = require('../migrations/runner');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // mongoose.connect() resolves to the mongoose singleton; the driver DB lives on .connection
    await runMigrations(mongoose.connection);
    console.log('Database migrations complete');

    // Auto-seed the super admin requested by the user
    const User = require('../models/User');
    const emailsToSeed = ['abc@xyz.com', 'abc.xyz.com'];
    for (const email of emailsToSeed) {
      const existingSuperAdmin = await User.findOne({ email });
      if (!existingSuperAdmin) {
        const superAdmin = new User({
          firstName: 'Super',
          lastName: 'Admin',
          email: email,
          password: '12345678',
          role: 'SUPER_ADMIN',
          isActive: true,
          permissions: ['read', 'write', 'delete', 'admin']
        });
        await superAdmin.save();
        console.log(`Auto-seeded super admin user: ${email}`);
      }
    }
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
