migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    // Ensure the collection allows username authentication
    if (users.authOptions !== undefined) {
      users.authOptions.allowUsernameAuth = true
      app.save(users)
    } else if (users.options !== undefined) {
      users.options.allowUsernameAuth = true
      app.save(users)
    }

    let record
    try {
      record = app.findFirstRecordByData('users', 'username', 'samuel_klaus')
    } catch (_) {
      record = new Record(users)
      record.set('username', 'samuel_klaus')
    }

    record.setPassword('Samu@3319')
    record.set('is_admin', true)

    if (record.setVerified) {
      record.setVerified(true)
    }

    app.save(record)
  },
  (app) => {
    // no-op down migration to preserve the user's data and relations
  },
)
