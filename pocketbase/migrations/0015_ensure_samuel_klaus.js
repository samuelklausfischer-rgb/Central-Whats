migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let record
    try {
      record = app.findFirstRecordByData('_pb_users_auth_', 'username', 'samuel_klaus')
    } catch (_) {
      record = new Record(users)
      record.set('username', 'samuel_klaus')
      record.setEmail('samuel_klaus@admin.centralcell.com')
      record.setVerified(true)
    }

    record.set('name', 'Samuel Klaus')
    record.setPassword('Samu@3319')
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
