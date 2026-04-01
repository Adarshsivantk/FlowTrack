import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Add this 👇
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const publicPaths = ['/login', '/register']
      const onPublicPage = publicPaths.some((p) => window.location.pathname.startsWith(p))
      const isSessionRestore = err.config?.url?.includes('/auth/me')
      if (!onPublicPage && !isSessionRestore) {
        localStorage.removeItem('token') // ← clear token on 401
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api