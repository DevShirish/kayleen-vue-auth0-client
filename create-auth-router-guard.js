export default store => {
  return async (to, _from, next) => {
    await store.dispatch('auth/performRequest')

    if (!to.meta.auth) {
      next()
      return
    }

    const authorized = store.dispatch('auth/check', { auth: to.meta.auth })

    if (authorized) {
      next()
    } else if (!store.getters['auth/isAuthenticated']) {
      await store.dispatch('auth/signIn', { redirectPath: to.path })
    } else {
      next(new Error('Unauthorized'))
    }
  }
}