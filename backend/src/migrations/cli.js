/**
 * Run migrations against MONGODB_URI (standalone — CI / deploy scripts).
 * Usage: npm run migrate
 */
require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const { runMigrations } = require('./runner');

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('[migrate] Connected');
  await runMigrations(mongoose.connection);
  await mongoose.disconnect();
  console.log('[migrate] Done');
  process.exit(0);
})().catch((err) => {
  console.error('[migrate] Failed:', err);
  process.exit(1);
});
