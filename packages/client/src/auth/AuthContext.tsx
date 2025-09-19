import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from './api'
import { getToken, setToken, getUser, setUser, clearAuth } from './storage'
import type { User } from './storage'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()
      const savedUser = getUser()
      
      if (token && savedUser) {
        try {
          // Verify token is still valid by fetching profile
          const response = await authApi.getProfile()
          setUserState(response.data)
          setUser(response.data)
        } catch (error) {
          // Token is invalid, clear auth
          clearAuth()
        }
      }
      
      setLoading(false)
    }
    
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)
      
      // Save token and user
      setToken(response.data.token)
      setUser(response.data.user)
      setUserState(response.data.user)
      
      // Redirect to home
      navigate('/')
    } catch (error) {
      // Re-throw error to be handled by the login form
      throw error
    }
  }

  const logout = () => {
    clearAuth()
    setUserState(null)
    navigate('/login')
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}