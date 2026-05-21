migrate(
  (app) => {
    const fileFieldMsg = new FileField({
      name: 'attachments',
      maxSelect: 10,
      maxSize: 10485760, // 10MB
      mimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
      ],
    })

    const fileFieldSched = new FileField({
      name: 'attachments',
      maxSelect: 10,
      maxSize: 10485760, // 10MB
      mimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
      ],
    })

    const messagesCol = app.findCollectionByNameOrId('messages')
    if (!messagesCol.fields.getByName('attachments')) {
      messagesCol.fields.add(fileFieldMsg)
      app.save(messagesCol)
    }

    const scheduledCol = app.findCollectionByNameOrId('scheduled_messages')
    if (!scheduledCol.fields.getByName('attachments')) {
      scheduledCol.fields.add(fileFieldSched)
      app.save(scheduledCol)
    }
  },
  (app) => {
    const messagesCol = app.findCollectionByNameOrId('messages')
    if (messagesCol.fields.getByName('attachments')) {
      messagesCol.fields.removeByName('attachments')
      app.save(messagesCol)
    }

    const scheduledCol = app.findCollectionByNameOrId('scheduled_messages')
    if (scheduledCol.fields.getByName('attachments')) {
      scheduledCol.fields.removeByName('attachments')
      app.save(scheduledCol)
    }
  },
)
