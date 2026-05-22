migrate(
  (app) => {
    const devicesToRemove = ['Celular RH', 'Celular Operações']

    for (const name of devicesToRemove) {
      try {
        const record = app.findFirstRecordByData('devices', 'name', name)
        app.delete(record)
      } catch (_) {
        // Record not found, already deleted or doesn't exist.
      }
    }
  },
  (app) => {
    const devices = app.findCollectionByNameOrId('devices')
    const devicesToRestore = ['Celular RH', 'Celular Operações']

    for (const name of devicesToRestore) {
      try {
        app.findFirstRecordByData('devices', 'name', name)
      } catch (_) {
        const record = new Record(devices)
        record.set('name', name)
        record.set('status', 'offline')
        app.save(record)
      }
    }
  },
)
