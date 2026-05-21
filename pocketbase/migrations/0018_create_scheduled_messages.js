migrate(
  (app) => {
    const collection = new Collection({
      name: 'scheduled_messages',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.is_admin = true)",
      viewRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.is_admin = true)",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.is_admin = true)",
      deleteRule:
        "@request.auth.id != '' && (user_id = @request.auth.id || @request.auth.is_admin = true)",
      fields: [
        { name: 'content', type: 'text', required: true },
        { name: 'scheduled_at', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'sent', 'failed', 'cancelled'],
          maxSelect: 1,
        },
        {
          name: 'device_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('devices').id,
          maxSelect: 1,
        },
        { name: 'remote_sender', type: 'text', required: true },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_scheduled_messages_scheduled_at ON scheduled_messages (scheduled_at)',
        'CREATE INDEX idx_scheduled_messages_status ON scheduled_messages (status)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('scheduled_messages')
    app.delete(collection)
  },
)
