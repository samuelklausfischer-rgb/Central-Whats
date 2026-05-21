migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    let record
    try {
      record = app.findFirstRecordByData('users', 'username', 'samuel_klaus')
    } catch (_) {
      try {
        record = app.findAuthRecordByEmail('users', 'samuelklausfischer@hotmail.com')
      } catch (_) {
        record = new Record(users)
      }
    }

    record.set('username', 'samuel_klaus')
    record.setEmail('samuelklausfischer@hotmail.com')
    record.setPassword('Samu@3319')
    record.set('is_admin', true)
    record.set('name', 'Samuel Klaus')
    record.setVerified(true)

    app.save(record)
  },
  (app) => {
    // No strict down migration for seed data adjustment
  },
)
