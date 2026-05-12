module.exports = {
  async up(db) {
    await db.collection('organizationsettings').createIndex({ organizationKey: 1 }, { unique: true });
  }
};
