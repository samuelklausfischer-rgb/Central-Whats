onRecordAfterCreateSuccess((e) => {
  const record = e.record
  if (record.getString('direction') !== 'outbound') {
    return e.next()
  }

  if (record.getString('origin') === 'webhook') {
    return e.next()
  }

  const apikey = $secrets.get('EVOLUTION_API_KEY') || ''

  let instanceKey = 'Celular teste'
  let signature = ''

  const deviceId = record.getString('device_id')
  if (deviceId) {
    try {
      const device = $app.findRecordById('devices', deviceId)
      const dKey = device.getString('instance_key')
      if (dKey) {
        instanceKey = dKey
      }
      signature = device.getString('signature') || ''
    } catch (_) {}
  }

  if (!signature) {
    const senderId = record.getString('sender_id')
    if (senderId) {
      try {
        const user = $app.findRecordById('users', senderId)
        signature = user.getString('signature') || ''
      } catch (_) {}
    }
  }

  let textContent = record.getString('content') || '[Anexo]'

  if (signature && signature.trim() && textContent !== '[Anexo]') {
    textContent = signature.trim() + '\n\n' + textContent

    try {
      record.set('content', textContent)
      $app.saveNoValidate(record)
    } catch (updateErr) {
      $app
        .logger()
        .error('Failed to update message record with signature', 'error', updateErr.message)
    }
  }

  const payload = {
    number: record.getString('remote_sender'),
    text: textContent,
  }

  try {
    const res = $http.send({
      url: `http://apps-evolution-api.srofjl.easypanel.host/message/sendText/${encodeURIComponent(instanceKey)}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apikey,
      },
      body: JSON.stringify(payload),
      timeout: 15,
    })

    if (res.statusCode >= 300) {
      let bodyText = ''
      try {
        bodyText = JSON.stringify(res.json)
      } catch (parseErr) {
        bodyText = 'non-json response'
      }
      $app
        .logger()
        .error(
          'Failed to send message via Evolution API',
          'status',
          res.statusCode,
          'body',
          bodyText,
        )
    }
  } catch (err) {
    $app.logger().error('Evolution API transport error', 'error', err.message)
  }

  return e.next()
}, 'messages')
