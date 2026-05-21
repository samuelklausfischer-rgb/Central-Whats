cronAdd('process_scheduled_messages', '*/1 * * * *', () => {
  const now = new Date().toISOString().replace('T', ' ')
  let records
  try {
    records = $app.findRecordsByFilter(
      'scheduled_messages',
      "status = 'pending' && scheduled_at <= {:now}",
      'scheduled_at',
      100,
      0,
      { now: now },
    )
  } catch (_) {
    return
  }

  if (!records || records.length === 0) return

  for (let record of records) {
    try {
      record.set('status', 'sent')
      $app.save(record)

      const msgCol = $app.findCollectionByNameOrId('messages')
      const msg = new Record(msgCol)
      msg.set('content', record.get('content'))
      msg.set('device_id', record.get('device_id'))
      msg.set('sender_id', record.get('user_id'))
      msg.set('remote_sender', record.get('remote_sender'))
      msg.set('direction', 'outbound')
      msg.set('is_read', true)
      $app.save(msg)
    } catch (e) {
      record.set('status', 'failed')
      $app.save(record)
    }
  }
})
