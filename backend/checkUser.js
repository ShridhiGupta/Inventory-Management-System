const mongoose = require('mongoose');
require('dotenv').config();

async function fixPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./src/models/User');
    const bcrypt = require('bcryptjs');

    const user = await User.findOne({ email: 'shreegupta572@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('Current password length:', user.password ? user.password.length : 0);
    
    // Manually hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    user.password = hashedPassword;
    await user.save();
    
    console.log('New password length:', user.password.length);
    console.log('Password starts with $2:', user.password.startsWith('$2') ? 'Yes' : 'No');
    
    // Test password comparison
    const testPassword = 'admin123';
    const isMatch1 = await user.comparePassword(testPassword);
    console.log('User.comparePassword result:', isMatch1 ? 'Match' : 'No Match');
    
    // Test direct bcrypt comparison
    const isMatch2 = await bcrypt.compare(testPassword, user.password);
    console.log('Direct bcrypt.compare result:', isMatch2 ? 'Match' : 'No Match');

    console.log('Password fixed successfully!');
    console.log('Email: shreegupta572@gmail.com');
    console.log('Password: admin123');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

fixPassword();
