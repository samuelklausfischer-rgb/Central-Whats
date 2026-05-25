migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const devices = app.findCollectionByNameOrId('devices')

    let usersChanged = false

    if (!users.fields.getByName('allowed_devices')) {
      users.fields.add(
        new RelationField({
          name: 'allowed_devices',
          collectionId: devices.id,
          maxSelect: 100,
        }),
      )
      usersChanged = true
    }

    if (!users.fields.getByName('is_admin')) {
      users.fields.add(
        new BoolField({
          name: 'is_admin',
        }),
      )
      usersChanged = true
    }

    if (usersChanged) {
      app.save(users)
    }

    devices.listRule =
      "@request.auth.id != '' && (@request.auth.is_admin = true || @request.auth.allowed_devices ?= id)"
    devices.viewRule =
      "@request.auth.id != '' && (@request.auth.is_admin = true || @request.auth.allowed_devices ?= id)"
    app.save(devices)

    const messages = app.findCollectionByNameOrId('messages')
    messages.listRule =
      "@request.auth.id != '' && (@request.auth.is_admin = true || @request.auth.allowed_devices ?= device_id)"
    messages.viewRule =
      "@request.auth.id != '' && (@request.auth.is_admin = true || @request.auth.allowed_devices ?= device_id)"
    messages.createRule =
      "@request.auth.id != '' && (@request.auth.is_admin = true || @request.auth.allowed_devices ?= device_id)"
    messages.updateRule =
      "@request.auth.id != '' && (@request.auth.is_admin = true || @request.auth.allowed_devices ?= device_id)"
    messages.deleteRule =
      "@request.auth.id != '' && (@request.auth.is_admin = true || @request.auth.allowed_devices ?= device_id)"
    app.save(messages)
  },
  (app) => {},
)
