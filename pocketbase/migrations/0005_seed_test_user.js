migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'teste@teste.com')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('teste@teste.com')
    record.setPassword('teste@teste')
    record.setVerified(true)
    record.set('name', 'Usuário Teste')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'teste@teste.com')
      app.delete(record)
    } catch (_) {}
  },
)
