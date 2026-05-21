onRecordUpdateRequest((e) => {
  if (!e.auth || !e.auth.getBool('is_admin')) {
    const body = e.requestInfo().body || {}
    if (body.is_admin !== undefined || body.allowed_devices !== undefined) {
      throw new ForbiddenError('Apenas administradores podem alterar as permissões de acesso.')
    }
  }
  e.next()
}, '_pb_users_auth_')
