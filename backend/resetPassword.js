const mongoose = require('mongoose');
require('dotenv').config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./src/models/User');
    const newPassword = 'admin123';

    // Find the user and update password using the model's pre-save hook
    const user = await User.findOne({ email: 'shreegupta572@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }

    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the password

    console.log('Password reset successfully!');
    console.log('Email: shreegupta572@gmail.com');
    console.log('Password: admin123');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

resetPassword();
