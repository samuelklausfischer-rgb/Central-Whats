routerAdd('POST', '/backend/v1/webhooks/evolution', (e) => {
  const body = e.requestInfo().body || {}

  if (!body.instance || !body.data) {
    return e.json(200, { status: 'ignored', reason: 'missing instance or data' })
  }

  if (body.event === 'messages.upsert') {
    try {
      const instanceKey = body.instance
      let messageData = body.data

      if (Array.isArray(messageData)) {
        messageData = messageData[0]
      }

      if (!messageData) {
        return e.json(200, { status: 'ignored', reason: 'empty data' })
      }

      const key = messageData.key || {}
      if (key.fromMe) {
        return e.json(200, { status: 'ignored', reason: 'fromMe is true' })
      }

      const remoteJid = key.remoteJid || ''
      let remoteSender = remoteJid.split('@')[0]

      // Extract actual sender for group messages
      if (remoteJid.includes('@g.us')) {
        const participant = messageData.participant || ''
        if (participant) {
          remoteSender = participant.split('@')[0]
        }
      }

      if (!remoteSender) {
        remoteSender = ''
      }

      const msgObj = messageData.message || {}
      let content = msgObj.conversation || ''
      if (!content && msgObj.extendedTextMessage) {
        content = msgObj.extendedTextMessage.text || ''
      }

      if (!content) {
        return e.json(200, { status: 'ignored', reason: 'no text content' })
      }

      const device = $app.findFirstRecordByData('devices', 'instance_key', instanceKey)

      const messagesCol = $app.findCollectionByNameOrId('messages')
      const newMsg = new Record(messagesCol)
      newMsg.set('content', content)
      newMsg.set('device_id', device.id)
      newMsg.set('remote_sender', remoteSender)
      newMsg.set('direction', 'inbound')
      newMsg.set('is_read', false)
      $app.save(newMsg)

      device.set('unread_count', (device.getInt('unread_count') || 0) + 1)
      $app.save(device)

      return e.json(200, { status: 'success' })
    } catch (err) {
      $app.logger().error('Evolution webhook error', 'error', err.message)
      return e.json(200, { status: 'error', message: 'internal error or device not found' })
    }
  }

  return e.json(200, { status: 'ignored', event: body.event })
})
