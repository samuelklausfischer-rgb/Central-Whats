migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'samuelklausfischer@hotmail.com')
    } catch (_) {
      return // user not found, skip seed
    }

    const prompts = [
      {
        label: 'Formalizar texto',
        action_key: 'formalize',
        system_prompt:
          'Assistente de escrita profissional. Tom formal, claro e educado. Preserve o sentido.',
      },
      {
        label: 'Corrigir erros ortográficos',
        action_key: 'correct_spelling',
        system_prompt:
          'Revisor de português. Corrija ortografia, acentuação e gramática. Preserve o tom.',
      },
      {
        label: 'Melhorar clareza',
        action_key: 'improve_clarity',
        system_prompt: 'Assistente de comunicação. Reescreva para ficar mais claro e organizado.',
      },
      {
        label: 'Deixar mais objetivo',
        action_key: 'make_shorter',
        system_prompt:
          'Assistente de comunicação objetiva. Reescreva para ficar mais curto e direto.',
      },
      {
        label: 'Deixar mais cordial',
        action_key: 'make_kind',
        system_prompt:
          'Assistente de atendimento cordial. Tom mais gentil, empático e profissional.',
      },
      {
        label: 'Resumir mensagem',
        action_key: 'summarize',
        system_prompt: 'Assistente de resumo. Mantenha somente informações essenciais.',
      },
      {
        label: 'Expandir mensagem',
        action_key: 'expand',
        system_prompt:
          'Assistente de escrita. Expanda de forma natural e clara sem inventar dados.',
      },
      {
        label: 'Transformar em resposta profissional',
        action_key: 'professional_reply',
        system_prompt: 'Transforme em resposta profissional e educada pronta para o cliente.',
      },
      {
        label: 'Criar resposta rápida',
        action_key: 'suggest_reply',
        system_prompt:
          'Assistente de WhatsApp. Sugira resposta curta e profissional baseada no contexto.',
      },
    ]

    const col = app.findCollectionByNameOrId('ai_assistant_prompts')
    for (const p of prompts) {
      try {
        app.findFirstRecordByFilter(
          'ai_assistant_prompts',
          'user_id={:user_id} && action_key={:action_key}',
          { user_id: user.id, action_key: p.action_key },
        )
      } catch (_) {
        const record = new Record(col)
        record.set('label', p.label)
        record.set('action_key', p.action_key)
        record.set('system_prompt', p.system_prompt)
        record.set('user_id', user.id)
        record.set('is_active', true)
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      app.db().newQuery('DELETE FROM ai_assistant_prompts').execute()
    } catch (_) {}
  },
)
