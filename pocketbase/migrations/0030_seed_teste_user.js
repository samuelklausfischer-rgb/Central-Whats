migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    // Idempotent: skip if user already exists
    try {
      app.findAuthRecordByEmail('users', 'teste@teste.com')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('teste@teste.com')
    record.setPassword('teste@teste')
    record.setVerified(true)
    record.set('name', 'Teste')

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'teste@teste.com')
      app.delete(record)
    } catch (_) {}
  },
)
