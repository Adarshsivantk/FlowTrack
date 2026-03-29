import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const publicPaths = ['/login', '/register']
      const onPublicPage = publicPaths.some((p) => window.location.pathname.startsWith(p))
      // Don't redirect for the session-restore call — it's expected to 401 when logged out
      const isSessionRestore = err.config?.url?.includes('/auth/me')
      if (!onPublicPage && !isSessionRestore) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api