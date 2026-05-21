migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('messages')
    col.fields.add(
      new TextField({
        name: 'external_id',
      }),
    )
    col.addIndex('idx_messages_external_id', true, 'external_id', "external_id != ''")
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('messages')
    col.removeIndex('idx_messages_external_id')
    col.fields.removeByName('external_id')
    app.save(col)
  },
)
