migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('messages')
    if (!col.fields.getByName('sender_name')) {
      col.fields.add(new TextField({ name: 'sender_name' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('messages')
    col.fields.removeByName('sender_name')
    app.save(col)
  },
)
