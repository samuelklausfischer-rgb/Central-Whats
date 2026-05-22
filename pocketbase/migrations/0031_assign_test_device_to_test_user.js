migrate(
  (app) => {
    try {
      const device = app.findFirstRecordByData('devices', 'name', 'Celular Teste')
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'teste@teste.com')

      let current = user.get('allowed_devices')
      let allowed = []
      if (Array.isArray(current)) {
        allowed = [...current]
      } else if (current) {
        allowed = [current]
      }

      if (!allowed.includes(device.id)) {
        allowed.push(device.id)
        user.set('allowed_devices', allowed)
        app.save(user)
      }
    } catch (_) {
      // Silently skip if user or device does not exist
    }
  },
  (app) => {
    try {
      const device = app.findFirstRecordByData('devices', 'name', 'Celular Teste')
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'teste@teste.com')

      let current = user.get('allowed_devices')
      let allowed = []
      if (Array.isArray(current)) {
        allowed = [...current]
      } else if (current) {
        allowed = [current]
      }

      if (allowed.includes(device.id)) {
        const newAllowed = allowed.filter((id) => id !== device.id)
        user.set('allowed_devices', newAllowed)
        app.save(user)
      }
    } catch (_) {
      // Silently skip if user or device does not exist
    }
  },
)
