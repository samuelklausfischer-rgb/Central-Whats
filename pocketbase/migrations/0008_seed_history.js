migrate(
  (app) => {
    // Retry deploy due to previous gateway HTML error
    let messages
    let contacts
    try {
      messages = app.findCollectionByNameOrId('messages')
      contacts = app.findCollectionByNameOrId('contacts')
    } catch (_) {
      return
    }

    let dev1
    try {
      dev1 = app.findFirstRecordByData('devices', 'instance_key', 'inst_teste_1')
    } catch (_) {
      return
    }

    let contact
    try {
      contact = app.findFirstRecordByData('contacts', 'remote_jid', '5511999999999@s.whatsapp.net')
    } catch (_) {
      contact = new Record(contacts)
      contact.set('remote_jid', '5511999999999@s.whatsapp.net')
      contact.set('name', 'Samuel Klaus')
      contact.set('nickname', 'Samuel Klaus')
      app.save(contact)
    }

    try {
      app.findFirstRecordByData('messages', 'external_id', 'msg_samuel_1')
      return
    } catch (_) {}

    const msg1 = new Record(messages)
    msg1.set('content', 'Olá, tudo bem?')
    msg1.set('device_id', dev1.id)
    msg1.set('remote_sender', '5511999999999@s.whatsapp.net')
    msg1.set('direction', 'inbound')
    msg1.set('is_read', true)
    msg1.set('external_id', 'msg_samuel_1')
    msg1.set('sender_name', 'Samuel Klaus')
    app.save(msg1)

    const msg2 = new Record(messages)
    msg2.set('content', 'Tudo ótimo! Como posso ajudar com as instâncias?')
    msg2.set('device_id', dev1.id)
    msg2.set('remote_sender', '5511999999999@s.whatsapp.net')
    msg2.set('direction', 'outbound')
    msg2.set('is_read', true)
    msg2.set('external_id', 'msg_samuel_2')
    msg2.set('sender_name', 'Usuário Teste')
    app.save(msg2)
  },
  (app) => {
    try {
      const msg1 = app.findFirstRecordByData('messages', 'external_id', 'msg_samuel_1')
      app.delete(msg1)
    } catch (_) {}
    try {
      const msg2 = app.findFirstRecordByData('messages', 'external_id', 'msg_samuel_2')
      app.delete(msg2)
    } catch (_) {}
  },
)
