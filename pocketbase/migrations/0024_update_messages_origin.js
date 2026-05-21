migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('messages')
    col.fields.add(
      new SelectField({
        name: 'origin',
        values: ['app', 'webhook'],
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('messages')
    col.fields.removeByName('origin')
    app.save(col)
  },
)
