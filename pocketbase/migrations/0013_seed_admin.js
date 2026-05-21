migrate(
  (app) => {
    try {
      app.findFirstRecordByData('_pb_users_auth_', 'username', 'samuelklaus')
      return
    } catch (_) {}

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const record = new Record(users)
    record.set('username', 'samuelklaus')
    record.setEmail('samuel@centralcell.com')
    record.setPassword('Samu@3319')
    record.setVerified(true)
    record.set('name', 'Samuel Klaus')
    record.set('is_admin', true)
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('_pb_users_auth_', 'username', 'samuelklaus')
      app.delete(record)
    } catch (_) {}
  },
)
