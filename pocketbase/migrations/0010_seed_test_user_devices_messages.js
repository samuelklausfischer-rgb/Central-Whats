migrate(
  (app) => {
    // 1. Ensure User
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'teste@usuario.com')
    } catch (_) {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      user = new Record(users)
      user.setEmail('teste@usuario.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Usuário Teste')
      app.save(user)
    }

    // 2. Update 'devices' collection listRule
    const devicesCol = app.findCollectionByNameOrId('devices')
    if (!devicesCol.fields.getByName('users')) {
      devicesCol.fields.add(
        new RelationField({
          name: 'users',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 999,
        }),
      )
    }
    devicesCol.listRule =
      "@request.auth.id != '' && (users ~ @request.auth.id || @request.auth.is_admin = true)"
    devicesCol.viewRule =
      "@request.auth.id != '' && (users ~ @request.auth.id || @request.auth.is_admin = true)"
    app.save(devicesCol)

    // 3. Ensure Devices (using raw SQL to bypass hooks that might trigger external APIs)
    let dev1, dev2
    const now = new Date().toISOString().replace('T', ' ').replace('Z', 'Z')

    try {
      dev1 = app.findFirstRecordByData('devices', 'name', 'WhatsApp Principal')
    } catch (_) {
      const id = $security.randomString(15)
      app
        .db()
        .newQuery(`
      INSERT INTO devices (id, name, status, instance_key, users, created, updated)
      VALUES ({:id}, {:name}, 'connected', {:instance_key}, {:users}, {:now}, {:now})
    `)
        .bind({
          id,
          name: 'WhatsApp Principal',
          instance_key: 'wp_principal',
          users: JSON.stringify([user.id]),
          now,
        })
        .execute()
      dev1 = app.findFirstRecordByData('devices', 'id', id)
    }

    let dev1Users = dev1.get('users') || []
    if (!Array.isArray(dev1Users))
      dev1Users = typeof dev1Users === 'string' && dev1Users !== '' ? [dev1Users] : []
    if (!dev1Users.includes(user.id)) {
      dev1Users.push(user.id)
      app
        .db()
        .newQuery('UPDATE devices SET users = {:users} WHERE id = {:id}')
        .bind({ users: JSON.stringify(dev1Users), id: dev1.id })
        .execute()
    }

    try {
      dev2 = app.findFirstRecordByData('devices', 'name', 'Celular Teste')
    } catch (_) {
      const id = $security.randomString(15)
      app
        .db()
        .newQuery(`
      INSERT INTO devices (id, name, status, instance_key, users, created, updated)
      VALUES ({:id}, {:name}, 'connected', {:instance_key}, {:users}, {:now}, {:now})
    `)
        .bind({
          id,
          name: 'Celular Teste',
          instance_key: 'cel_teste',
          users: JSON.stringify([user.id]),
          now,
        })
        .execute()
      dev2 = app.findFirstRecordByData('devices', 'id', id)
    }

    let dev2Users = dev2.get('users') || []
    if (!Array.isArray(dev2Users))
      dev2Users = typeof dev2Users === 'string' && dev2Users !== '' ? [dev2Users] : []
    if (!dev2Users.includes(user.id)) {
      dev2Users.push(user.id)
      app
        .db()
        .newQuery('UPDATE devices SET users = {:users} WHERE id = {:id}')
        .bind({ users: JSON.stringify(dev2Users), id: dev2.id })
        .execute()
    }

    // 4. Ensure Contact
    let contactsCol
    try {
      contactsCol = app.findCollectionByNameOrId('contacts')
    } catch (_) {}

    if (contactsCol) {
      try {
        app.findFirstRecordByData('contacts', 'remote_jid', '5511999999999')
      } catch (_) {
        const id = $security.randomString(15)
        app
          .db()
          .newQuery(`
        INSERT INTO contacts (id, name, remote_jid, created, updated)
        VALUES ({:id}, {:name}, {:remote_jid}, {:now}, {:now})
      `)
          .bind({
            id,
            name: 'Samuel Klaus',
            remote_jid: '5511999999999',
            now,
          })
          .execute()
      }
    }

    // 5. Update messages listRule
    const msgsCol = app.findCollectionByNameOrId('messages')
    msgsCol.listRule =
      "@request.auth.id != '' && (device_id.users ~ @request.auth.id || @request.auth.is_admin = true)"
    msgsCol.viewRule =
      "@request.auth.id != '' && (device_id.users ~ @request.auth.id || @request.auth.is_admin = true)"
    app.save(msgsCol)

    // 6. Seed Messages
    const seedMsg = (dev, content, dir, minsAgo) => {
      try {
        app.findFirstRecordByData('messages', 'content', content)
      } catch (_) {
        const id = $security.randomString(15)
        const date = new Date(Date.now() - minsAgo * 60000)
        const dateStr = date.toISOString().replace('T', ' ').replace('Z', 'Z')

        app
          .db()
          .newQuery(`
        INSERT INTO messages (id, content, device_id, remote_sender, sender_name, direction, is_read, origin, created, updated)
        VALUES ({:id}, {:content}, {:device_id}, {:remote_sender}, {:sender_name}, {:direction}, {:is_read}, {:origin}, {:created}, {:updated})
      `)
          .bind({
            id,
            content,
            device_id: dev.id,
            remote_sender: '5511999999999',
            sender_name: 'Samuel Klaus',
            direction: dir,
            is_read: true,
            origin: 'app',
            created: dateStr,
            updated: dateStr,
          })
          .execute()
      }
    }

    seedMsg(dev1, 'Olá, gostaria de saber mais sobre o sistema', 'inbound', 60)
    seedMsg(dev1, 'Claro, Samuel! O que gostaria de saber?', 'outbound', 55)
    seedMsg(dev1, 'Como funciona a integração com múltiplos aparelhos?', 'inbound', 50)

    seedMsg(dev2, 'Oi, estou testando o outro celular.', 'inbound', 30)
    seedMsg(dev2, 'Tudo certo por aqui também, Samuel!', 'outbound', 25)
  },
  (app) => {
    // Down migration
  },
)
