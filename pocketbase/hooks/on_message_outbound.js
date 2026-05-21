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
  const deviceId = record.getString('device_id')
  if (deviceId) {
    try {
      const device = $app.findRecordById('devices', deviceId)
      const dKey = device.getString('instance_key')
      if (dKey) {
        instanceKey = dKey
      }
    } catch (_) {}
  }

  const payload = {
    number: record.getString('remote_sender'),
    text: record.getString('content') || '[Anexo]',
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
