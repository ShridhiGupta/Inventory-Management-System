/**
 * Creates or updates a SUPER_ADMIN user.
 * Usage: from backend folder, `npm run seed:super-admin`
 * Requires MONGODB_URI in .env
 */
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');

// Ensure .env is loaded from backend root when cwd varies
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');

const EMAIL = 'shreegupta572@gmail.com';
const PASSWORD = 'shridhii';
const ROLE = 'SUPER_ADMIN';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in environment (.env)');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  let user = await User.findOne({ email: EMAIL.toLowerCase() });

  if (user) {
    user.role = ROLE;
    user.password = PASSWORD;
    user.isActive = true;
    if (!user.firstName) user.firstName = 'Super';
    if (!user.lastName) user.lastName = 'Admin';
    await user.save();
    console.log('Updated existing user to SUPER_ADMIN:', EMAIL);
  } else {
    user = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: EMAIL,
      password: PASSWORD,
      role: ROLE,
      permissions: ['read', 'write', 'delete', 'admin'],
    });
    await user.save();
    console.log('Created SUPER_ADMIN:', EMAIL);
  }

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
