migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const devices = app.findCollectionByNameOrId('devices')

    const labels = new Collection({
      name: 'labels',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != '' && user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'color', type: 'text', required: true },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(labels)

    const contact_tags = new Collection({
      name: 'contact_tags',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'device_id',
          type: 'relation',
          required: true,
          collectionId: devices.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'remote_sender', type: 'text', required: true },
        {
          name: 'label_id',
          type: 'relation',
          required: true,
          collectionId: labels.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [],
    })
    app.save(contact_tags)

    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'samuelklausfischer@hotmail.com')
      if (admin) {
        const defaultLabels = [
          { name: 'Pausa', color: '#f59e0b' },
          { name: 'Atendimento', color: '#3b82f6' },
          { name: 'Finalizado', color: '#10b981' },
        ]
        for (const lbl of defaultLabels) {
          const record = new Record(labels)
          record.set('name', lbl.name)
          record.set('color', lbl.color)
          record.set('user_id', admin.id)
          app.save(record)
        }
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const contact_tags = app.findCollectionByNameOrId('contact_tags')
      app.delete(contact_tags)
    } catch (_) {}
    try {
      const labels = app.findCollectionByNameOrId('labels')
      app.delete(labels)
    } catch (_) {}
  },
)
