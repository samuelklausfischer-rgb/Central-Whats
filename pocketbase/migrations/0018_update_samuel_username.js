migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_')

    // Ensure auth rule allows authentication
    collection.authRule = ''

    // Ensure username is accepted as an identity field
    if (collection.passwordAuth) {
      collection.passwordAuth.identityFields = ['email', 'username']
    }

    // Ensure email is not strictly required, to prevent blocking users without email
    const emailField = collection.fields.getByName('email')
    if (emailField) {
      emailField.required = false
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
      oldRecord.set('is_admin', true)
      app.save(oldRecord)
    } catch (_) {
      // If samuel_klaus was not found, attempt to update Samuel in case it already exists
      try {
        const record = app.findFirstRecordByData('_pb_users_auth_', 'username', 'Samuel')
        record.setPassword('Samu@3319')
        record.set('is_admin', true)
        app.save(record)
      } catch (__) {}
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
