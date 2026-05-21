migrate(
  (app) => {
    const contacts = new Collection({
      name: 'contacts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'remote_jid', type: 'text', required: true },
        { name: 'name', type: 'text' },
        { name: 'avatar_url', type: 'text' },
        { name: 'avatar_updated_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_contacts_remote_jid ON contacts (remote_jid) WHERE remote_jid != ''",
      ],
    })
    app.save(contacts)

    const devices = app.findCollectionByNameOrId('devices')
    if (!devices.fields.getByName('avatar_url')) {
      devices.fields.add(new TextField({ name: 'avatar_url' }))
      devices.fields.add(new DateField({ name: 'avatar_updated_at' }))
    }
    app.save(devices)
  },
  (app) => {
    const contacts = app.findCollectionByNameOrId('contacts')
    app.delete(contacts)

    const devices = app.findCollectionByNameOrId('devices')
    devices.fields.removeByName('avatar_url')
    devices.fields.removeByName('avatar_updated_at')
    app.save(devices)
  },
)
