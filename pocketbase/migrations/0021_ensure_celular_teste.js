migrate(
  (app) => {
    const devices = app.findCollectionByNameOrId('devices')

    try {
      app.findFirstRecordByData('devices', 'instance_key', 'Celular teste')
    } catch (_) {
      const record = new Record(devices)
      record.set('name', 'Celular teste')
      record.set('instance_key', 'Celular teste')
      record.set('status', 'connected')
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('devices', 'instance_key', 'Celular teste')
      app.delete(record)
    } catch (_) {}
  },
)
