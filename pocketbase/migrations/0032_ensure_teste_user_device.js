migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let userRecord
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'teste@teste.com')
    } catch (_) {
      userRecord = new Record(users)
      userRecord.setEmail('teste@teste.com')
      userRecord.setPassword('teste@teste')
      userRecord.setVerified(true)
      userRecord.set('name', 'Usuário de Teste')
      app.save(userRecord)
    }

    const devices = app.findCollectionByNameOrId('devices')
    let deviceRecord
    try {
      deviceRecord = app.findFirstRecordByData('devices', 'name', 'Celular Teste')
    } catch (_) {
      deviceRecord = new Record(devices)
      deviceRecord.set('name', 'Celular Teste')
      deviceRecord.set('status', 'online')
      deviceRecord.set('department', 'Testes')
      app.save(deviceRecord)
    }

    let allowed = userRecord.get('allowed_devices')
    if (!allowed) {
      allowed = []
    } else if (!Array.isArray(allowed)) {
      allowed = [allowed]
    }

    if (!allowed.includes(deviceRecord.id)) {
      userRecord.set('allowed_devices', [...allowed, deviceRecord.id])
      app.save(userRecord)
    }
  },
  (app) => {
    try {
      const userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'teste@teste.com')
      app.delete(userRecord)
    } catch (_) {}
    try {
      const deviceRecord = app.findFirstRecordByData('devices', 'name', 'Celular Teste')
      app.delete(deviceRecord)
    } catch (_) {}
  },
)
