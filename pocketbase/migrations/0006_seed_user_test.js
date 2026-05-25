migrate(
  (app) => {
    // Retry deploy due to previous gateway HTML error
    let users
    try {
      users = app.findCollectionByNameOrId('users')
    } catch (_) {
      return
    }

    try {
      app.findAuthRecordByEmail('users', 'usuario.teste@example.com')
      return // already exists
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('usuario.teste@example.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Usuário Teste')
    record.set('is_admin', false)
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'usuario.teste@example.com')
      app.delete(record)
    } catch (_) {}
  },
)
