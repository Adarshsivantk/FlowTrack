import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export const useAuth = () => {                  //Custom hook
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on app load via /auth/me
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.get('/auth/me')
        setUser(data)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    // data includes isTeamLead flag from server
    localStorage.setItem('token', data.token)
    setUser(data)
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('token', data.token)
    setUser(data)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((userData) => {
    setUser(userData)
  }, [])

  const value = useMemo(() => ({      
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
    // isTeamLead comes from server — dynamic based on team membership
    isTeamLead: !!user?.isTeamLead,
    isUser: user?.role === 'user' && !user?.isTeamLead,
  }), [user, loading, login, register, logout, updateUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}