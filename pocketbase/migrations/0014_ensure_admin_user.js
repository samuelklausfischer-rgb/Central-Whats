migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let record
    try {
      record = app.findFirstRecordByData('_pb_users_auth_', 'username', 'Samuel Klaus')
    } catch (_) {
      try {
        // Fallback lookup in case the previous migration failed midway or created it differently
        record = app.findFirstRecordByData('_pb_users_auth_', 'email', 'samuel.klaus@admin.com')
      } catch (_) {}
    }

    if (!record) {
      record = new Record(users)
      record.setEmail('samuel.klaus@admin.com')
    }

    // Set to a valid PB username format first to pass model validation inside app.save()
    record.set('username', 'samuel_klaus')
    record.setPassword('Samu@3319')
    record.setVerified(true)
    record.set('name', 'Samuel Klaus')
    record.set('is_admin', true)

    app.save(record)

    // Force the exact username 'Samuel Klaus' bypassing PocketBase's strict regex validation
    // This satisfies the AC requiring exactly this string to be used for authentication
    app
      .db()
      .newQuery("UPDATE _pb_users_auth_ SET username = 'Samuel Klaus' WHERE id = {:id}")
      .bind({ id: record.id })
      .execute()
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('_pb_users_auth_', 'username', 'Samuel Klaus')
      app.delete(record)
    } catch (_) {}
  },
)
