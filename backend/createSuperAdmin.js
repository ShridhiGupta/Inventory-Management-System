const mongoose = require('mongoose');
require('dotenv').config();

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./src/models/User');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'abc@xyz.com' });
    if (existingUser) {
      console.log('User with email abc@xyz.com already exists');
      await mongoose.connection.close();
      return;
    }

    // Create new super admin
    const superAdmin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'abc@xyz.com',
      password: '12345678',
      role: 'SUPER_ADMIN',
      isActive: true
    });

    await superAdmin.save();

    console.log('Super admin created successfully!');
    console.log('Email: abc@xyz.com');
    console.log('Password: 12345678');
    console.log('Role: SUPER_ADMIN');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating super admin:', error);
  }
}

createSuperAdmin();
