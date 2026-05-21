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

    let prompt = ''
    switch (action) {
      case 'formalize':
        prompt =
          'Assistente de escrita profissional. Tom formal, claro e educado. Preserve o sentido.'
        break
      case 'correct_spelling':
        prompt = 'Revisor de português. Corrija ortografia, acentuação e gramática. Preserve o tom.'
        break
      case 'improve_clarity':
        prompt = 'Assistente de comunicação. Reescreva para ficar mais claro e organizado.'
        break
      case 'make_shorter':
        prompt = 'Assistente de comunicação objetiva. Reescreva para ficar mais curto e direto.'
        break
      case 'make_kind':
        prompt = 'Assistente de atendimento cordial. Tom mais gentil, empático e profissional.'
        break
      case 'summarize':
        prompt = 'Assistente de resumo. Mantenha somente informações essenciais.'
        break
      case 'expand':
        prompt = 'Assistente de escrita. Expanda de forma natural e clara sem inventar dados.'
        break
      case 'professional_reply':
        prompt = 'Transforme em resposta profissional e educada pronta para o cliente.'
        break
      case 'suggest_reply':
        prompt = 'Assistente de WhatsApp. Sugira resposta curta e profissional baseada no contexto.'
        break
      default:
        return e.badRequestError('Ação inválida')
    }

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
