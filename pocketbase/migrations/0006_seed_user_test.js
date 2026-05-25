migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'usuario.teste@example.com')
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
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'usuario.teste@example.com')
      app.delete(record)
    } catch (_) {}
  },
)
