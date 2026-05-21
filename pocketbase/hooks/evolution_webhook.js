routerAdd('POST', '/backend/v1/webhooks/evolution/messages-upsert', (e) => {
  const body = e.requestInfo().body || {}

  const logger = $app.logger()

  const logContext = {
    event: body.event || 'unknown',
    instance: body.instance || 'unknown',
    fromMe: 'unknown',
    remoteJid: 'unknown',
    remoteJidAlt: 'unknown',
    normalized_phone: 'unknown',
    status: 'unknown',
    reason: '',
  }

  const writeLog = (level, msg) => {
    logger[level](
      msg,
      'event',
      logContext.event,
      'instance',
      logContext.instance,
      'fromMe',
      logContext.fromMe,
      'remoteJid',
      logContext.remoteJid,
      'remoteJidAlt',
      logContext.remoteJidAlt,
      'normalized_phone',
      logContext.normalized_phone,
      'status',
      logContext.status,
      'reason',
      logContext.reason,
    )
  }

  if (!body.instance || !body.data) {
    logContext.status = 'discarded'
    logContext.reason = 'missing instance or data'
    writeLog('warn', 'Evolution webhook discarded')
    return e.json(200, { status: 'ignored', reason: 'missing instance or data' })
  }

  if (body.event === 'messages.upsert' || body.event === 'MESSAGES_UPSERT') {
    try {
      let messageData = body.data

      if (Array.isArray(messageData)) {
        messageData = messageData[0]
      }

      if (!messageData) {
        logContext.status = 'discarded'
        logContext.reason = 'empty data array/object'
        writeLog('warn', 'Evolution webhook discarded')
        return e.json(200, { status: 'ignored', reason: 'empty data' })
      }

      const key = messageData.key || {}
      logContext.fromMe = key.fromMe !== undefined ? String(key.fromMe) : 'unknown'
      logContext.remoteJid = key.remoteJid || 'unknown'
      logContext.remoteJidAlt = key.remoteJidAlt || 'unknown'

      if (key.fromMe === true) {
        logContext.status = 'discarded'
        logContext.reason = 'fromMe is true'
        writeLog('info', 'Evolution webhook discarded')
        return e.json(200, { status: 'ignored', reason: 'fromMe is true' })
      }

      const rawJid = key.remoteJidAlt || key.remoteJid || ''
      const remoteSender = rawJid
        .replace(/@s\.whatsapp\.net/g, '')
        .replace(/@lid/g, '')
        .replace(/\D/g, '')

      logContext.normalized_phone = remoteSender || 'unknown'

      if (!remoteSender) {
        logContext.status = 'discarded'
        logContext.reason = 'no remote sender identified after normalization'
        writeLog('warn', 'Evolution webhook discarded')
        return e.json(200, { status: 'ignored', reason: 'no remote sender identified' })
      }

      const msgObj = messageData.message || {}
      const content =
        msgObj.conversation ||
        (msgObj.extendedTextMessage && msgObj.extendedTextMessage.text) ||
        (msgObj.imageMessage && msgObj.imageMessage.caption) ||
        (msgObj.videoMessage && msgObj.videoMessage.caption) ||
        ''

      if (!content) {
        logContext.status = 'discarded'
        logContext.reason = 'no text content found in message'
        writeLog('warn', 'Evolution webhook discarded')
        return e.json(200, { status: 'ignored', reason: 'no text content' })
      }

      let device
      try {
        device = $app.findFirstRecordByData('devices', 'instance_key', 'Celular teste')
      } catch (err) {
        logContext.status = 'discarded'
        logContext.reason = 'device exactly named "Celular teste" not found in instance_key'
        writeLog('warn', 'Evolution webhook discarded')
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

      logContext.status = 'processed'
      logContext.reason = 'success'
      writeLog('info', 'Evolution webhook processed successfully')

      return e.json(200, { status: 'success' })
    } catch (err) {
      logContext.status = 'discarded'
      logContext.reason = 'internal error during processing'
      writeLog('error', 'Evolution webhook processing error: ' + err.message)
      return e.json(200, { status: 'error', message: 'internal error during processing' })
    }
  }

  logContext.status = 'discarded'
  logContext.reason = 'event type ignored'
  writeLog('warn', 'Evolution webhook discarded')
  return e.json(200, { status: 'ignored', event: body.event })
})
