import { createAuth0Client } from '@auth0/auth0-spa-js'

export default settings => {
  return {
    actions: {
      async check({ getters }, { auth }) {
        return auth(getters)
      },
      async performRequest({ commit, getters }) {
        let auth0 = getters.auth0

        if (!auth0) {
          auth0 = await createAuth0Client({
            audience: settings.audience,
            client_id: settings.clientId,
            domain: settings.domain,
            redirect_uri: settings.signInCallbackUrl,
            scope: settings.scope
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
        const path = (payload || {}).redirectPath || document.location.pathname + (document.location.search || '') + (document.location.hash || '')

        sessionStorage.setItem('auth_redirect_path', path)

        await getters.auth0[payload.popup ? 'loginWithPopup' : 'loginWithRedirect']({}, {
          popup: payload.popup,
          openUrl: payload.openUrl
        })
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
      hasPermission: state => permission => {
        if (!state.user || !state.user[`${settings.namespace}/permissions`]) return false

        return state.user[`${settings.namespace}/permissions`].includes(permission)
      },
      hasRole: state => role => {
        if (!state.user || !state.user[`${settings.namespace}/roles`]) return false

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
      setAccessToken(state, { accessToken }) {
        state.accessToken = accessToken
      },
      setAuth0(state, { auth0 }) {
        state.auth0 = auth0
      },
      setIsAuthenticated(state, { isAuthenticated }) {
        state.isAuthenticated = isAuthenticated
      },
      setUser(state, { user }) {
        state.user = user
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
