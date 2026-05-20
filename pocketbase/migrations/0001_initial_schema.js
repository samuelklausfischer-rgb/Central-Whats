migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(new TextField({ name: 'signature' }))
    app.save(users)

    const devices = new Collection({
      name: 'devices',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'department', type: 'text' },
        { name: 'status', type: 'text', required: true },
        { name: 'unread_count', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(devices)

    const messages = new Collection({
      name: 'messages',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'content', type: 'text', required: true },
        { name: 'device_id', type: 'relation', collectionId: devices.id, maxSelect: 1 },
        { name: 'sender_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'is_read', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(messages)
  },
  (app) => {
    const messages = app.findCollectionByNameOrId('messages')
    app.delete(messages)
    const devices = app.findCollectionByNameOrId('devices')
    app.delete(devices)
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('signature')
    app.save(users)
  },
)
