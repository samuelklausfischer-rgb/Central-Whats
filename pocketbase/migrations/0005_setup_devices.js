migrate(
  (app) => {
    let col
    try {
      col = app.findCollectionByNameOrId('devices')
      col.listRule = "@request.auth.id != ''"
      col.viewRule = "@request.auth.id != ''"
      app.save(col)
    } catch (_) {
      col = new Collection({
        name: 'devices',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: '@request.auth.is_admin = true',
        updateRule: '@request.auth.is_admin = true || @request.auth.allowed_devices ?= id',
        deleteRule: '@request.auth.is_admin = true',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'instance_key', type: 'text' },
          { name: 'status', type: 'text', required: true },
          { name: 'department', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(col)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('devices')
      col.listRule =
        "@request.auth.id != '' && (@request.auth.is_admin = true || @request.auth.allowed_devices ?= id)"
      col.viewRule =
        "@request.auth.id != '' && (@request.auth.is_admin = true || @request.auth.allowed_devices ?= id)"
      app.save(col)
    } catch (_) {}
  },
)
