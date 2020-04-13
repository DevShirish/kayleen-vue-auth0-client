import createAuth0Client from '@auth0/auth0-spa-js'

export default settings => {
  return {
    actions: {
      async check({ getters }, payload) {
        return payload.auth(getters)
      },
      async performRequest({ commit, getters }) {
        let auth0 = getters.auth0

        if (auth0 == null) {
          auth0 = await createAuth0Client({
            audience: settings.audience,
            client_id: settings.clientId,
            domain: settings.domain,
            redirect_uri: settings.signInCallbackUrl
          })

          commit('setAuth0', { auth0 })
        }

        const isAuthenticated = await auth0.isAuthenticated()

        commit('setIsAuthenticated', { isAuthenticated })

        if (isAuthenticated) {
          const accessToken = await auth0.getTokenSilently()
          const user = await auth0.getUser()

          commit('setAccessToken', { accessToken })
          commit('setUser', { user })
        }
      },
      async signIn({ getters }, payload) {
        if (!payload) payload = {}

        const path = payload.redirectPath || document.location.pathname + (document.location.search || '') + (document.location.hash || '')

        sessionStorage.setItem('auth_redirect_path', path)

        await getters.auth0.loginWithRedirect()
      },
      async signInCallback({ getters }) {
        await getters.auth0.handleRedirectCallback()

        return sessionStorage.getItem('auth_redirect_path') || '/'
      },
      async signOut({ getters }) {
        await getters.auth0.logout({ returnTo: settings.signOutCallbackUrl })
      },
      async signOutCallback() { }
    },
    getters: {
      accessToken: state => state.accessToken,
      auth0: state => state.auth0,
      displayName: state => {
        if (!state.user) return null

        return state.user.nickname
      },
      email: state => {
        if (!state.user) return null

        return state.user.email
      },
      hasRole: state => role => {
        if (!state.user || !state.user[`${settings.namespace}/roles`]) return false

        return state.user[`${settings.namespace}/roles`].includes(role)
      },
      idToken: () => null,
      isAuthenticated: state => state.isAuthenticated,
      picture: state => {
        if (!state.user) return null

        return state.user.picture
      },
      sub: state => {
        if (!state.user) return null

        return state.user.sub
      },
      user: state => state.user
    },
    mutations: {
      setAccessToken(state, payload) {
        state.accessToken = payload.accessToken
      },
      setAuth0(state, payload) {
        state.auth0 = payload.auth0
      },
      setIsAuthenticated(state, payload) {
        state.isAuthenticated = payload.isAuthenticated
      },
      setUser(state, payload) {
        state.user = payload.user
      }
    },
    namespaced: true,
    state: {
      accessToken: null,
      auth0: null,
      isAuthenticated: false,
      user: null
    }
  }
}