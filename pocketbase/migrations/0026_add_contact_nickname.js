migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contacts')
    if (!col.fields.getByName('nickname')) {
      col.fields.add(new TextField({ name: 'nickname', required: false }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('contacts')
    col.fields.removeByName('nickname')
    app.save(col)
  },
)
