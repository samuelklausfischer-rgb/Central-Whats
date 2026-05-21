migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('is_admin')) {
      users.fields.add(new BoolField({ name: 'is_admin' }))
    }

    if (!users.fields.getByName('allowed_devices')) {
      const devices = app.findCollectionByNameOrId('devices')
      users.fields.add(
        new RelationField({
          name: 'allowed_devices',
          collectionId: devices.id,
          maxSelect: 1000,
        }),
      )
    }

    users.listRule = 'id = @request.auth.id || @request.auth.is_admin = true'
    users.viewRule = 'id = @request.auth.id || @request.auth.is_admin = true'
    users.createRule = '@request.auth.is_admin = true'
    users.updateRule = 'id = @request.auth.id || @request.auth.is_admin = true'
    users.deleteRule = 'id = @request.auth.id || @request.auth.is_admin = true'

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (users.fields.getByName('is_admin')) {
      users.fields.removeByName('is_admin')
    }
    if (users.fields.getByName('allowed_devices')) {
      users.fields.removeByName('allowed_devices')
    }
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)
  },
)
