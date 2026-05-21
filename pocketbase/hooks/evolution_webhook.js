routerAdd('POST', '/backend/v1/webhooks/evolution', (e) => {
  const body = e.requestInfo().body || {}

  $app
    .logger()
    .info('Evolution webhook request received', 'event', body.event, 'instance', body.instance)

  if (!body.instance || !body.data) {
    $app.logger().warn('Evolution webhook discarded', 'reason', 'missing instance or data')
    return e.json(200, { status: 'ignored', reason: 'missing instance or data' })
  }

  if (body.event === 'messages.upsert' || body.event === 'MESSAGES_UPSERT') {
    try {
      let messageData = body.data

      if (Array.isArray(messageData)) {
        messageData = messageData[0]
      }

      if (!messageData) {
        $app.logger().warn('Evolution webhook discarded', 'reason', 'empty data array/object')
        return e.json(200, { status: 'ignored', reason: 'empty data' })
      }

      const key = messageData.key || {}

      $app
        .logger()
        .info(
          'Evolution webhook identity check',
          'fromMe',
          key.fromMe,
          'remoteJid',
          key.remoteJid,
          'remoteJidAlt',
          key.remoteJidAlt,
        )

      if (key.fromMe === true) {
        $app.logger().warn('Evolution webhook discarded', 'reason', 'fromMe is true')
        return e.json(200, { status: 'ignored', reason: 'fromMe is true' })
      }

      const rawJid = key.remoteJidAlt || key.remoteJid || ''
      const remoteSender = rawJid
        .replace(/@s\.whatsapp\.net/g, '')
        .replace(/@lid/g, '')
        .replace(/\D/g, '')

      if (!remoteSender) {
        $app
          .logger()
          .warn(
            'Evolution webhook discarded',
            'reason',
            'no remote sender identified after normalization',
          )
        return e.json(200, { status: 'ignored', reason: 'no remote sender identified' })
      }

      $app.logger().info('Evolution webhook normalized sender', 'normalizedSender', remoteSender)

      const msgObj = messageData.message || {}
      const content =
        msgObj.conversation ||
        (msgObj.extendedTextMessage && msgObj.extendedTextMessage.text) ||
        (msgObj.imageMessage && msgObj.imageMessage.caption) ||
        (msgObj.videoMessage && msgObj.videoMessage.caption) ||
        ''

      if (!content) {
        $app
          .logger()
          .warn('Evolution webhook discarded', 'reason', 'no text content found in message')
        return e.json(200, { status: 'ignored', reason: 'no text content' })
      }

      let device
      try {
        device = $app.findFirstRecordByData('devices', 'instance_key', 'Celular teste')
      } catch (err) {
        $app
          .logger()
          .warn(
            'Evolution webhook discarded',
            'reason',
            'device exactly named "Celular teste" not found in instance_key',
          )
        return e.json(200, { status: 'error', message: 'device not found' })
      }

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

      $app
        .logger()
        .info(
          'Evolution webhook processed successfully',
          'device_id',
          device.id,
          'remote_sender',
          remoteSender,
        )
      return e.json(200, { status: 'success' })
    } catch (err) {
      $app.logger().error('Evolution webhook processing error', 'error', err.message)
      return e.json(200, { status: 'error', message: 'internal error during processing' })
    }
  }

  $app
    .logger()
    .warn('Evolution webhook discarded', 'reason', 'event type ignored', 'event_type', body.event)
  return e.json(200, { status: 'ignored', event: body.event })
})
