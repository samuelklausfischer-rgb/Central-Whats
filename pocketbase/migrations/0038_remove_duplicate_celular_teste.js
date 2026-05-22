migrate(
  (app) => {
    let devices = []
    try {
      devices = app.findRecordsByFilter('devices', "name = 'Celular teste'", '', 100, 0)
    } catch (e) {
      devices = []
    }

    // If there's only one or zero "Celular teste" devices, there's no duplicate to remove
    if (devices.length <= 1) {
      return
    }

    // Count messages for each device
    const deviceCounts = devices.map((device) => {
      let msgs = []
      try {
        msgs = app.findRecordsByFilter('messages', `device_id = '${device.id}'`, '', 10000, 0)
      } catch (e) {
        msgs = []
      }
      return { device, count: msgs.length, msgs }
    })

    // Sort descending by message count so the device with the most history stays at index 0
    deviceCounts.sort((a, b) => b.count - a.count)

    // Keep the first (highest count), mark the rest for deletion
    const devicesToDelete = deviceCounts.slice(1)

    for (const { device, msgs } of devicesToDelete) {
      // 1. Delete associated messages
      for (const msg of msgs) {
        try {
          app.delete(msg)
        } catch (e) {}
      }

      // 2. Delete associated scheduled_messages
      try {
        const schedMsgs = app.findRecordsByFilter(
          'scheduled_messages',
          `device_id = '${device.id}'`,
          '',
          10000,
          0,
        )
        for (const msg of schedMsgs) {
          try {
            app.delete(msg)
          } catch (e) {}
        }
      } catch (e) {}

      // 3. Delete associated contact_tags
      try {
        const tags = app.findRecordsByFilter(
          'contact_tags',
          `device_id = '${device.id}'`,
          '',
          10000,
          0,
        )
        for (const tag of tags) {
          try {
            app.delete(tag)
          } catch (e) {}
        }
      } catch (e) {}

      // 4. Remove the device reference from users.allowed_devices
      try {
        const users = app.findRecordsByFilter(
          'users',
          `allowed_devices ~ '${device.id}'`,
          '',
          10000,
          0,
        )
        for (const user of users) {
          try {
            const allowed = user.get('allowed_devices')
            if (allowed) {
              const allowedArray = Array.isArray(allowed) ? allowed : [allowed]
              const newAllowed = allowedArray.filter((id) => id !== device.id)
              user.set('allowed_devices', newAllowed)
              app.save(user)
            }
          } catch (e) {}
        }
      } catch (e) {}

      // 5. Finally, delete the duplicate device record itself
      try {
        app.delete(device)
      } catch (e) {}
    }
  },
  (app) => {
    // Data deletion cannot be safely reversed in a down migration
  },
)
