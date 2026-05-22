migrate(
  (app) => {
    let activeDeviceId = null
    try {
      const records = app.findRecordsByFilter('devices', "name = 'Celular teste'", '', 1, 0)
      if (records.length > 0) {
        activeDeviceId = records[0].id
      }
    } catch (_) {}

    const deletedIds = []

    try {
      const devices = app.findRecordsByFilter('devices', '1=1', '', 100, 0)
      for (const d of devices) {
        const name = d.getString('name')
        const dept = d.getString('department')
        if (
          (name === 'Celular Financeiro' && dept === 'Financeiro') ||
          (name === 'Celular Operações' && dept === 'Operacional') ||
          (name === 'Celular RH' && dept === 'RH') ||
          (name === 'Celular Teste' && dept === 'Testes')
        ) {
          deletedIds.push(d.id)
          app.delete(d)
        }
      }
    } catch (err) {
      console.log('Error deleting devices:', err)
    }

    if (deletedIds.length > 0) {
      // Cleanup related records to maintain database integrity
      try {
        for (const devId of deletedIds) {
          try {
            const msgs = app.findRecordsByFilter('messages', `device_id = '${devId}'`, '', 1000, 0)
            for (const m of msgs) app.delete(m)
          } catch (_) {}

          try {
            const tags = app.findRecordsByFilter(
              'contact_tags',
              `device_id = '${devId}'`,
              '',
              1000,
              0,
            )
            for (const t of tags) app.delete(t)
          } catch (_) {}

          try {
            const sched = app.findRecordsByFilter(
              'scheduled_messages',
              `device_id = '${devId}'`,
              '',
              1000,
              0,
            )
            for (const s of sched) app.delete(s)
          } catch (_) {}
        }
      } catch (err) {
        console.log('Error cleaning up related records:', err)
      }

      // Reassign allowed_devices for users holding deleted references
      if (activeDeviceId) {
        try {
          const users = app.findRecordsByFilter('users', '1=1', '', 1000, 0)
          for (const u of users) {
            let devs = u.get('allowed_devices')
            if (!devs) devs = []
            if (!Array.isArray(devs)) devs = [devs]

            let changed = false
            const newDevs = []

            for (const devId of devs) {
              if (deletedIds.includes(devId)) {
                changed = true
              } else if (devId) {
                newDevs.push(devId)
              }
            }

            if (changed) {
              if (!newDevs.includes(activeDeviceId)) {
                newDevs.push(activeDeviceId)
              }
              u.set('allowed_devices', newDevs)
              app.saveNoValidate(u)
            }
          }
        } catch (err) {
          console.log('Error updating users:', err)
        }
      }
    }
  },
  (app) => {
    // Data cleanup migration - no down script required
  },
)
