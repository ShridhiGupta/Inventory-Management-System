/**
 * Ensure all user documents have preferences.notificationSeenAlertIds for DB-backed notification state.
 */
module.exports = {
  async up(db) {
    await db.collection('users').updateMany(
      {
        $or: [
          { preferences: { $exists: false } },
          { 'preferences.notificationSeenAlertIds': { $exists: false } }
        ]
      },
      {
        $set: { 'preferences.notificationSeenAlertIds': [] }
      }
    );
  }
};
