const fs = require('fs');
const path = require('path');

const COLLECTION = 'schema_migrations';

/**
 * Run pending migrations in lexical order (001_*.js, 002_*.js, …).
 * Each file must export: async function up(db) { ... }  (or module.exports = { up })
 *
 * @param {import('mongoose').Connection} connection
 */
async function runMigrations(connection) {
  // Prefer mongoose.connection (has .db); mongoose singleton uses .connection.db
  const resolved =
    connection?.db != null ? connection : connection?.connection;
  if (!resolved?.db) {
    throw new Error('runMigrations: invalid mongoose connection (expected Connection or Mongoose)');
  }

  const db = resolved.db;
  const journal = db.collection(COLLECTION);
  await journal.createIndex({ name: 1 }, { unique: true });

  const dir = __dirname;
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^\d{3}_[^.]+\.js$/.test(f))
    .sort();

  for (const file of files) {
    const name = file.replace(/\.js$/, '');
    const exists = await journal.findOne({ name });
    if (exists) {
      console.log(`[migrate] Skip (already applied): ${name}`);
      continue;
    }

    const mod = require(path.join(dir, file));
    const up = mod.up || mod.default?.up;
    if (typeof up !== 'function') {
      throw new Error(`Migration ${file} must export async up(db)`);
    }

    console.log(`[migrate] Applying: ${name}`);
    await up(db);
    await journal.insertOne({ name, appliedAt: new Date() });
    console.log(`[migrate] Applied: ${name}`);
  }
}

module.exports = { runMigrations, COLLECTION };
