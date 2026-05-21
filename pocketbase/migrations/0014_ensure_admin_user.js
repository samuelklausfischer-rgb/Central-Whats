migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let record
    try {
      record = app.findFirstRecordByData('_pb_users_auth_', 'username', 'samuel_klaus')
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

    record.set('username', 'samuel_klaus')
    record.setPassword('Samu@3319')
    record.setVerified(true)
    record.set('name', 'Samuel Klaus')
    record.set('is_admin', true)

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('_pb_users_auth_', 'username', 'samuel_klaus')
      app.delete(record)
    } catch (_) {}
  },
)
