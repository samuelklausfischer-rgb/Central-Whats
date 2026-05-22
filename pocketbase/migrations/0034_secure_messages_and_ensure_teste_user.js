migrate(
  (app) => {
    // 1. Secure messages collection for multi-tenant safety
    const messagesCol = app.findCollectionByNameOrId('messages')
    const rule =
      "@request.auth.id != '' && (@request.auth.is_admin = true || @request.auth.allowed_devices ?= device_id)"
    messagesCol.listRule = rule
    messagesCol.viewRule = rule
    messagesCol.createRule = rule
    messagesCol.updateRule = rule
    messagesCol.deleteRule = rule
    app.save(messagesCol)

    // 2. Ensure teste@teste.com user exists
    const usersCol = app.findCollectionByNameOrId('users')
    let user
    try {
      user = app.findAuthRecordByEmail('users', 'teste@teste.com')
    } catch (_) {
      user = new Record(usersCol)
      user.setEmail('teste@teste.com')
      user.setPassword('teste@teste')
      user.setVerified(true)
      user.set('name', 'Usuário Teste')
    }

    // 3. Ensure 'Celular teste' device exists
    let device
    try {
      device = app.findFirstRecordByData('devices', 'instance_key', 'Celular teste')
    } catch (_) {
      const devicesCol = app.findCollectionByNameOrId('devices')
      device = new Record(devicesCol)
      device.set('name', 'Celular teste')
      device.set('status', 'connected')
      device.set('instance_key', 'Celular teste')
      app.save(device)
    }

    // 4. Link device to user explicitly
    const allowed = user.get('allowed_devices') || []
    if (!allowed.includes(device.id)) {
      allowed.push(device.id)
      user.set('allowed_devices', allowed)
    }

    app.save(user)
  },
  (app) => {
    const messagesCol = app.findCollectionByNameOrId('messages')
    const rule = "@request.auth.id != ''"
    messagesCol.listRule = rule
    messagesCol.viewRule = rule
    messagesCol.createRule = rule
    messagesCol.updateRule = rule
    messagesCol.deleteRule = rule
    app.save(messagesCol)
  },
)
