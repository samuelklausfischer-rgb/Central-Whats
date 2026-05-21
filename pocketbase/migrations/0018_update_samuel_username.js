migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_')

    // Ensure auth rule allows authentication
    collection.authRule = ''

    // Ensure username field exists
    if (!collection.fields.getByName('username')) {
      collection.fields.add(
        new TextField({
          name: 'username',
        }),
      )
    }

    // Ensure email is not strictly required, to prevent blocking users without email
    const emailField = collection.fields.getByName('email')
    if (emailField) {
      emailField.required = false
    }

    // Save fields first so the 'username' column exists in SQLite
    app.save(collection)

    // Give unique values to empty usernames to prevent unique constraint failures
    app
      .db()
      .newQuery(`
    UPDATE _pb_users_auth_ 
    SET username = id 
    WHERE username = '' OR username IS NULL
  `)
      .execute()

    // Deduplicate before adding unique index
    app
      .db()
      .newQuery(`
    DELETE FROM _pb_users_auth_ WHERE id NOT IN (
      SELECT MIN(id) FROM _pb_users_auth_ GROUP BY username
    ) AND username IS NOT NULL
  `)
      .execute()

    // Add the unique index required for identity fields
    collection.addIndex('idx_users_username', true, 'username', '')

    // Ensure username is accepted as an identity field
    if (collection.passwordAuth) {
      const identityFields = []
      if (collection.fields.getByName('email')) identityFields.push('email')
      if (collection.fields.getByName('username')) identityFields.push('username')
      collection.passwordAuth.identityFields = identityFields
    }

    app.save(collection)

    try {
      const oldRecord = app.findFirstRecordByData('_pb_users_auth_', 'username', 'samuel_klaus')

      // Check if the target username already exists to handle unique constraint safely
      try {
        const existing = app.findFirstRecordByData('_pb_users_auth_', 'username', 'Samuel')
        if (existing.id !== oldRecord.id) {
          app.delete(existing)
        }
      } catch (_) {}

      oldRecord.set('username', 'Samuel')
      oldRecord.setPassword('Samu@3319')
      if (collection.fields.getByName('is_admin')) {
        oldRecord.set('is_admin', true)
      }
      app.save(oldRecord)
    } catch (_) {
      // If samuel_klaus was not found, attempt to update Samuel in case it already exists
      try {
        const record = app.findFirstRecordByData('_pb_users_auth_', 'username', 'Samuel')
        record.setPassword('Samu@3319')
        if (collection.fields.getByName('is_admin')) {
          record.set('is_admin', true)
        }
        app.save(record)
      } catch (__) {
        try {
          const newRecord = new Record(collection)
          newRecord.set('username', 'Samuel')
          newRecord.setPassword('Samu@3319')
          if (collection.fields.getByName('is_admin')) {
            newRecord.set('is_admin', true)
          }
          app.save(newRecord)
        } catch (err) {
          console.log('Could not create Samuel record:', err.message)
        }
      }
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('_pb_users_auth_', 'username', 'Samuel')
      record.set('username', 'samuel_klaus')
      app.save(record)
    } catch (_) {}
  },
)
