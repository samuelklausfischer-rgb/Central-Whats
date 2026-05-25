migrate(
  (app) => {
    const devices = app.findCollectionByNameOrId('devices')
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let userTeste
    try {
      userTeste = app.findAuthRecordByEmail('_pb_users_auth_', 'usuario.teste@example.com')
    } catch (_) {
      return
    }

    let dev1
    try {
      dev1 = app.findFirstRecordByData('devices', 'instance_key', 'inst_teste_1')
    } catch (_) {
      dev1 = new Record(devices)
      dev1.set('name', 'WhatsApp Corporativo 1')
      dev1.set('instance_key', 'inst_teste_1')
      dev1.set('status', 'connected')
      app.save(dev1)
    }

    let dev2
    try {
      dev2 = app.findFirstRecordByData('devices', 'instance_key', 'inst_teste_2')
    } catch (_) {
      dev2 = new Record(devices)
      dev2.set('name', 'WhatsApp Corporativo 2')
      dev2.set('instance_key', 'inst_teste_2')
      dev2.set('status', 'connected')
      app.save(dev2)
    }

    const allowed = userTeste.get('allowed_devices') || []
    const newAllowed = [...allowed]
    let modified = false
    if (!newAllowed.includes(dev1.id)) {
      newAllowed.push(dev1.id)
      modified = true
    }
    if (!newAllowed.includes(dev2.id)) {
      newAllowed.push(dev2.id)
      modified = true
    }

    if (modified) {
      userTeste.set('allowed_devices', newAllowed)
      app.save(userTeste)
    }
  },
  (app) => {
    try {
      const dev1 = app.findFirstRecordByData('devices', 'instance_key', 'inst_teste_1')
      app.delete(dev1)
    } catch (_) {}
    try {
      const dev2 = app.findFirstRecordByData('devices', 'instance_key', 'inst_teste_2')
      app.delete(dev2)
    } catch (_) {}
  },
)
