migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('devices')
    if (!col.fields.getByName('signature')) {
      col.fields.add(new TextField({ name: 'signature' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('devices')
    col.fields.removeByName('signature')
    app.save(col)
  },
)
