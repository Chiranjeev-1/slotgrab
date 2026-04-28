import { createContext, useContext, useState } from 'react'
import api from '../api/axios'
import { googleAuth } from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  )

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password })
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const signup = async (data) => {
    const res = await api.post('/auth/register/', data)
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout/', { refresh: localStorage.getItem('refresh') })
    } catch (e) {}
    localStorage.clear()
    setUser(null)
  }

  
const loginWithGoogle = async (credentialResponse) => {
  const res = await googleAuth({
    code: credentialResponse.code,
    redirect_uri: window.location.origin
  })
  localStorage.setItem('access', res.data.access)
  localStorage.setItem('refresh', res.data.refresh)
  localStorage.setItem('user', JSON.stringify(res.data.user))
  setUser(res.data.user)
  return res.data
}


  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)





