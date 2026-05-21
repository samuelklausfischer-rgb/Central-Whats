migrate(
  (app) => {
    try {
      const adminUser = app.findAuthRecordByEmail(
        '_pb_users_auth_',
        'samuelklausfischer@hotmail.com',
      )

      const devicesCol = app.findCollectionByNameOrId('devices')
      let deviceId = null
      try {
        const records = app.findRecordsByFilter('devices', "status != ''", '', 1, 0)
        if (records.length > 0) {
          deviceId = records[0].id
        } else {
          throw new Error('No devices')
        }
      } catch (_) {
        const newDevice = new Record(devicesCol)
        newDevice.set('name', 'Seed Device')
        newDevice.set('status', 'connected')
        newDevice.set('instance_key', 'seed_device_1')
        app.save(newDevice)
        deviceId = newDevice.id
      }

      const scheduledCol = app.findCollectionByNameOrId('scheduled_messages')

      const m1 = new Record(scheduledCol)
      m1.set('content', 'Lembrete: Reunião de alinhamento às 14h amanhã.')
      m1.set(
        'scheduled_at',
        new Date(Date.now() + 86400000).toISOString().replace('T', ' ').substring(0, 19) + 'Z',
      )
      m1.set('status', 'pending')
      m1.set('device_id', deviceId)
      m1.set('remote_sender', '5511999999999')
      m1.set('user_id', adminUser.id)
      app.save(m1)

      const m2 = new Record(scheduledCol)
      m2.set('content', 'Olá, como foi o atendimento ontem?')
      m2.set(
        'scheduled_at',
        new Date(Date.now() - 86400000).toISOString().replace('T', ' ').substring(0, 19) + 'Z',
      )
      m2.set('status', 'sent')
      m2.set('device_id', deviceId)
      m2.set('remote_sender', '5511988888888')
      m2.set('user_id', adminUser.id)
      app.save(m2)

      const m3 = new Record(scheduledCol)
      m3.set('content', 'Mensagem que falhou ao enviar devido a perda de conexão.')
      m3.set(
        'scheduled_at',
        new Date(Date.now() - 43200000).toISOString().replace('T', ' ').substring(0, 19) + 'Z',
      )
      m3.set('status', 'failed')
      m3.set('device_id', deviceId)
      m3.set('remote_sender', '5511977777777')
      m3.set('user_id', adminUser.id)
      app.save(m3)
    } catch (e) {}
  },
  (app) => {
    try {
      app.db().newQuery('DELETE FROM scheduled_messages').execute()
    } catch (e) {}
  },
)
