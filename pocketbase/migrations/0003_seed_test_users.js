migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const seedUsers = [
      {
        email: 'teste@teste.com',
        password: 'teste@teste',
        name: 'Usuário Teste',
        signature: 'Teste - Unidade Central',
      },
      {
        email: 'samuelklausfischer@hotmail.com',
        password: 'Skip@Pass',
        name: 'Admin',
        signature: 'Admin - Central Celular',
      },
    ]

    for (const userData of seedUsers) {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', userData.email)
        // already exists, skip
        continue
      } catch (_) {
        // Record does not exist, create it
        const record = new Record(users)
        record.setEmail(userData.email)
        record.setPassword(userData.password)
        record.setVerified(true)
        record.set('name', userData.name)
        record.set('signature', userData.signature)
        app.save(record)
      }
    }
  },
  (app) => {
    const emails = ['teste@teste.com', 'samuelklausfischer@hotmail.com']
    for (const email of emails) {
      try {
        const record = app.findAuthRecordByEmail('_pb_users_auth_', email)
        app.delete(record)
      } catch (_) {}
    }
  },
)
