migrate(
  (app) => {
    // Retry deploy due to previous gateway HTML error
    try {
      const devices = app.findCollectionByNameOrId('devices')
      const rule =
        "@request.auth.id != '' && (@request.auth.is_admin = true || @request.auth.allowed_devices ?= id)"
      devices.listRule = rule
      devices.viewRule = rule
      app.save(devices)
    } catch (_) {}
  },
  (app) => {
    try {
      const devices = app.findCollectionByNameOrId('devices')
      const rule = "@request.auth.id != ''"
      devices.listRule = rule
      devices.viewRule = rule
      app.save(devices)
    } catch (_) {}
  },
)
