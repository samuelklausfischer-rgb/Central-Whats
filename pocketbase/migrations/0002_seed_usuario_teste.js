migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const allDevices = app.findRecordsByFilter('devices', "id != ''", '-created', 100, 0)
    const deviceIds = allDevices.map((d) => d.id)

    let record
    try {
      record = app.findAuthRecordByEmail('_pb_users_auth_', 'usuarioteste@hotmail.com')
    } catch (_) {
      record = new Record(users)
      record.setEmail('usuarioteste@hotmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Usuário Teste')
    }
    record.set('allowed_devices', deviceIds)
    record.set('is_admin', false)
    app.save(record)

    let samuel
    try {
      samuel = app.findAuthRecordByEmail('_pb_users_auth_', 'samuelklausfischer@hotmail.com')
      samuel.set('allowed_devices', deviceIds)
      samuel.set('is_admin', true)
      app.save(samuel)
    } catch (_) {}
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'usuarioteste@hotmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
