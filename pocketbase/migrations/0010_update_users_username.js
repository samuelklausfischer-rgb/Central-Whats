migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'samuelklausfischer@hotmail.com')
      record.set('username', 'samuelklausfischer')
      app.save(record)
    } catch (_) {
      try {
        app.findFirstRecordByData('_pb_users_auth_', 'username', 'samuelklausfischer')
      } catch (_) {
        const record = new Record(users)
        record.set('username', 'samuelklausfischer')
        record.setEmail('samuelklausfischer@hotmail.com')
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', 'Admin')
        app.save(record)
      }
    }
  },
  (app) => {},
)
