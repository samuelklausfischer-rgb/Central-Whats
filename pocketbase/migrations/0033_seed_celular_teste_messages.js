migrate(
  (app) => {
    let device
    try {
      device = app.findFirstRecordByData('devices', 'name', 'Celular Teste')
    } catch (_) {
      return
    }

    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'teste@teste.com')
    } catch (_) {}

    const messagesCol = app.findCollectionByNameOrId('messages')

    const existingMessages = app.findRecordsByFilter(
      'messages',
      `device_id = '${device.id}'`,
      '',
      1,
      0,
    )
    if (existingMessages.length > 0) {
      return // Already seeded
    }

    const remoteSender = '5511999999999'

    const messages = [
      { content: 'Olá, preciso de ajuda com meu acesso', direction: 'inbound', is_read: true },
      { content: 'Claro, como posso ajudar?', direction: 'outbound', is_read: true },
      { content: 'Esqueci minha senha do portal.', direction: 'inbound', is_read: true },
      {
        content: 'Você pode redefinir pelo link "Esqueci a senha" na página de login.',
        direction: 'outbound',
        is_read: true,
      },
      { content: 'Tentei mas não recebi o email.', direction: 'inbound', is_read: true },
      {
        content: 'Verifique a pasta de spam. Se não estiver lá, posso abrir um chamado para o TI.',
        direction: 'outbound',
        is_read: true,
      },
      { content: 'Ah, encontrei! Estava no spam.', direction: 'inbound', is_read: true },
      { content: 'Perfeito. Mais alguma dúvida?', direction: 'outbound', is_read: true },
      { content: 'Não, era só isso. Obrigado!', direction: 'inbound', is_read: false },
    ]

    for (const msg of messages) {
      const record = new Record(messagesCol)
      record.set('content', msg.content)
      record.set('direction', msg.direction)
      record.set('is_read', msg.is_read)
      record.set('device_id', device.id)
      record.set('remote_sender', remoteSender)
      record.set('origin', 'app')

      if (user && msg.direction === 'outbound') {
        record.set('sender_id', user.id)
        record.set('sender_name', user.get('name'))
      }

      app.save(record)
    }
  },
  (app) => {
    let device
    try {
      device = app.findFirstRecordByData('devices', 'name', 'Celular Teste')
    } catch (_) {
      return
    }
    const messages = app.findRecordsByFilter('messages', `device_id = '${device.id}'`, '', 100, 0)
    for (const msg of messages) {
      app.delete(msg)
    }
  },
)
