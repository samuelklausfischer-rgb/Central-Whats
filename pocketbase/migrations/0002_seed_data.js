migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'samuelklausfischer@hotmail.com')
    } catch (_) {
      admin = new Record(users)
      admin.setEmail('samuelklausfischer@hotmail.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Admin')
      admin.set('signature', 'Admin - Central')
      app.save(admin)
    }

    const devices = app.findCollectionByNameOrId('devices')
    const d1 = new Record(devices)
    d1.set('name', 'Celular Financeiro')
    d1.set('department', 'Financeiro')
    d1.set('status', 'online')
    d1.set('unread_count', 1)
    app.save(d1)

    const d2 = new Record(devices)
    d2.set('name', 'Celular Operações')
    d2.set('department', 'Operacional')
    d2.set('status', 'offline')
    d2.set('unread_count', 0)
    app.save(d2)

    const d3 = new Record(devices)
    d3.set('name', 'Celular RH')
    d3.set('department', 'RH')
    d3.set('status', 'online')
    d3.set('unread_count', 0)
    app.save(d3)

    const messages = app.findCollectionByNameOrId('messages')
    const m1 = new Record(messages)
    m1.set('content', 'Bom dia, a nota fiscal referente ao mês passado já foi emitida?')
    m1.set('device_id', d1.id)
    m1.set('is_read', false)
    app.save(m1)

    const m2 = new Record(messages)
    m2.set('content', '*Admin - Central*\nBom dia! Vou verificar com a equipe e já retorno.')
    m2.set('device_id', d1.id)
    m2.set('sender_id', admin.id)
    m2.set('is_read', true)
    app.save(m2)
  },
  (app) => {
    const messages = app.findCollectionByNameOrId('messages')
    app.truncateCollection(messages)
    const devices = app.findCollectionByNameOrId('devices')
    app.truncateCollection(devices)
  },
)
