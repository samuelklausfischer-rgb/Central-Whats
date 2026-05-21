routerAdd(
  'GET',
  '/backend/v1/devices/{id}/avatar',
  (e) => {
    const id = e.request.pathValue('id')
    const device = $app.findRecordById('devices', id)
    const instanceName = device.getString('instance_key')

    if (!instanceName) {
      return e.badRequestError('Missing instance_key')
    }

    const EVOLUTION_API_URL = $secrets.get('EVOLUTION_API_URL') || 'http://evolution-api:8080'
    const EVOLUTION_API_KEY = $secrets.get('EVOLUTION_API_KEY') || ''

    let avatarUrl = ''

    try {
      const res = $http.send({
        url: `${EVOLUTION_API_URL}/instance/fetchInstances`,
        method: 'GET',
        headers: {
          apikey: EVOLUTION_API_KEY,
        },
        timeout: 10,
      })

      if (res.statusCode === 200 && res.json && Array.isArray(res.json)) {
        const inst = res.json.find((i) => i.instance && i.instance.instanceName === instanceName)
        if (inst && inst.instance && inst.instance.profilePicUrl) {
          avatarUrl = inst.instance.profilePicUrl
        }
      }
    } catch (err) {
      $app.logger().error('fetchInstances error', 'error', err.message)
    }

    if (avatarUrl) {
      device.set('avatar_url', avatarUrl)
    }
    device.set('avatar_updated_at', new Date().toISOString())
    $app.save(device)

    return e.json(200, { avatar_url: avatarUrl })
  },
  $apis.requireAuth(),
)
