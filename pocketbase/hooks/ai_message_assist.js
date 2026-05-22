routerAdd(
  'POST',
  '/backend/v1/ai/message-assist',
  (e) => {
    const body = e.requestInfo().body
    const action = body.action
    const text = body.text
    const conversationContext = body.conversationContext

    const groqKey = $secrets.get('GROQ_KEY')
    if (!groqKey) {
      return e.internalServerError('GROQ_KEY not configured')
    }

    let promptRecord
    try {
      promptRecord = $app.findFirstRecordByFilter(
        'ai_assistant_prompts',
        'action_key = {:a} && user_id = {:u} && is_active = true',
        { a: action, u: e.auth.id },
      )
    } catch (_) {
      return e.badRequestError('Ação de IA inválida ou não encontrada')
    }

    let prompt = promptRecord.getString('system_prompt')

    prompt +=
      "\n\nREGRAS:\n- Responda apenas em português do Brasil (pt-BR).\n- Nenhuma explicação, saudação, confirmação ou meta-fala (ex: nada de 'Aqui está', 'Claro').\n- Não use aspas envolvendo a resposta.\n- Retorne apenas o texto final e nada mais."

    let groqMessages = [{ role: 'system', content: prompt }]

    if (action === 'suggest_reply') {
      let contextStr = ''
      if (Array.isArray(conversationContext) && conversationContext.length > 0) {
        contextStr = conversationContext
          .map((m) => `${m.role === 'assistant' ? 'Atendente' : 'Cliente'}: ${m.text}`)
          .join('\n')
      }
      groqMessages.push({
        role: 'user',
        content: `Contexto da conversa:\n${contextStr}\n\nPor favor, sugira uma resposta curta e profissional para o Cliente.`,
      })
    } else {
      groqMessages.push({
        role: 'user',
        content: text || '',
      })
    }

    const res = $http.send({
      url: 'https://api.groq.com/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + groqKey,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        messages: groqMessages,
      }),
      timeout: 30,
    })

    if (res.statusCode !== 200) {
      let errorDetail = 'Erro na API Groq'
      try {
        const parsed = res.json
        if (parsed && parsed.error && parsed.error.message) {
          errorDetail = parsed.error.message
        }
      } catch (_) {}
      return e.internalServerError('Falha ao gerar texto: ' + errorDetail)
    }

    const generated = res.json?.choices?.[0]?.message?.content || ''
    return e.json(200, { result: generated.trim() })
  },
  $apis.requireAuth(),
)
