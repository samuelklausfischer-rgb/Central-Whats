migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'teste@teste.com')
    } catch (_) {
      user = new Record(usersCol)
      user.setEmail('teste@teste.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Usuário Teste')
      app.save(user)
    }

    let device
    try {
      device = app.findFirstRecordByData('devices', 'instance_key', 'Celular teste')
    } catch (_) {
      const devicesCol = app.findCollectionByNameOrId('devices')
      device = new Record(devicesCol)
      device.set('name', 'Celular Teste')
      device.set('status', 'online')
      device.set('instance_key', 'Celular teste')
      app.save(device)
    }

    let allowed = user.get('allowed_devices') || []
    if (!Array.isArray(allowed)) {
      allowed = allowed ? [allowed] : []
    }

    if (!allowed.includes(device.id)) {
      allowed.push(device.id)
      user.set('allowed_devices', allowed)
      app.saveNoValidate(user)
    }
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'teste@teste.com')
      const device = app.findFirstRecordByData('devices', 'instance_key', 'Celular teste')

      let allowed = user.get('allowed_devices') || []
      if (!Array.isArray(allowed)) {
        allowed = allowed ? [allowed] : []
      }

      const index = allowed.indexOf(device.id)
      if (index !== -1) {
        allowed.splice(index, 1)
        user.set('allowed_devices', allowed)
        app.saveNoValidate(user)
      }
    } catch (_) {}
  },
)
