migrate(
  (app) => {
    const devices = app.findCollectionByNameOrId('devices')
    if (!devices.fields.getByName('instance_key')) {
      devices.fields.add(new TextField({ name: 'instance_key' }))
    }
    devices.addIndex('idx_devices_instance_key', true, 'instance_key', "instance_key != ''")
    app.save(devices)

    const messages = app.findCollectionByNameOrId('messages')
    if (!messages.fields.getByName('remote_sender')) {
      messages.fields.add(new TextField({ name: 'remote_sender' }))
    }
    if (!messages.fields.getByName('direction')) {
      messages.fields.add(
        new SelectField({ name: 'direction', values: ['inbound', 'outbound'], maxSelect: 1 }),
      )
    }
    app.save(messages)
  },
  (app) => {
    const devices = app.findCollectionByNameOrId('devices')
    devices.removeIndex('idx_devices_instance_key')
    devices.fields.removeByName('instance_key')
    app.save(devices)

    const messages = app.findCollectionByNameOrId('messages')
    messages.fields.removeByName('remote_sender')
    messages.fields.removeByName('direction')
    app.save(messages)
  },
)
