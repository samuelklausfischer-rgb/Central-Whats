routerAdd(
  'GET',
  '/backend/v1/contacts/{jid}/avatar',
  (e) => {
    const jid = e.request.pathValue('jid')
    const instanceName = e.request.url.query().get('instance') || ''

    if (!instanceName) {
      return e.badRequestError('Missing instance query parameter')
    }

    const EVOLUTION_API_URL = $secrets.get('EVOLUTION_API_URL') || 'http://evolution-api:8080'
    const EVOLUTION_API_KEY = $secrets.get('EVOLUTION_API_KEY') || ''

    let avatarUrl = ''

    try {
      const res = $http.send({
        url: `${EVOLUTION_API_URL}/chat/fetchProfile/${instanceName}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({ number: jid }),
        timeout: 10,
      })

      if (res.statusCode === 200 && res.json && res.json.picture) {
        avatarUrl = res.json.picture
      }
    } catch (err) {
      $app.logger().error('fetchProfile error', 'error', err.message)
    }

    if (!avatarUrl) {
      try {
        const res = $http.send({
          url: `${EVOLUTION_API_URL}/chat/findContacts/${instanceName}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: EVOLUTION_API_KEY,
          },
          body: JSON.stringify({ where: { id: `${jid}@s.whatsapp.net` } }),
          timeout: 10,
        })
        if (res.statusCode === 200 && res.json && Array.isArray(res.json) && res.json.length > 0) {
          avatarUrl = res.json[0].profilePicUrl || ''
        }
      } catch (err) {
        $app.logger().error('findContacts error', 'error', err.message)
      }
    }

    if (avatarUrl) {
      try {
        const contactRecord = $app.findFirstRecordByData('contacts', 'remote_jid', jid)
        contactRecord.set('avatar_url', avatarUrl)
        contactRecord.set('avatar_updated_at', new Date().toISOString())
        $app.save(contactRecord)
      } catch (_) {
        const contactsCol = $app.findCollectionByNameOrId('contacts')
        const contactRecord = new Record(contactsCol)
        contactRecord.set('remote_jid', jid)
        contactRecord.set('avatar_url', avatarUrl)
        contactRecord.set('avatar_updated_at', new Date().toISOString())
        $app.save(contactRecord)
      }
      return e.json(200, { avatar_url: avatarUrl })
    }

    try {
      const contactRecord = $app.findFirstRecordByData('contacts', 'remote_jid', jid)
      contactRecord.set('avatar_updated_at', new Date().toISOString())
      $app.save(contactRecord)
    } catch (_) {
      const contactsCol = $app.findCollectionByNameOrId('contacts')
      const contactRecord = new Record(contactsCol)
      contactRecord.set('remote_jid', jid)
      contactRecord.set('avatar_updated_at', new Date().toISOString())
      $app.save(contactRecord)
    }

    return e.json(200, { avatar_url: null })
  },
  $apis.requireAuth(),
)
