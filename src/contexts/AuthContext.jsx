import React, { createContext, useState, useEffect, useContext } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on component mount
    const checkUserAuthentication = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        // Use token to get current user data
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to authenticate token')
        }

        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error('Authentication check failed:', error)
        // Clear invalid token
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    checkUserAuthentication()
  }, [])

  const login = async (phone, password) => {
    try {
      console.log('Attempting login with phone:', phone)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password })
      })
      
      // Log entire response for debugging
      console.log('Login response status:', response.status)
      
      const data = await response.json()
      console.log('Login response data:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }
      
      // Store token in localStorage
      localStorage.setItem('token', data.token)
      
      // Set user data in state
      setUser(data.user)
      
      return data.user
    } catch (error) {
      console.error('Login error details:', error)
      throw error
    }
  }

  const register = async (name, email, phone, password) => {
    try {
      console.log('Registering new user:', { name, email, phone })
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password
        })
      })
      
      // Log response details for debugging
      console.log('Registration response status:', response.status)
      
      const responseText = await response.text()
      console.log('Raw response text:', responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        throw new Error(`Server returned invalid JSON: ${responseText}`)
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      
      // Store token in localStorage
      localStorage.setItem('token', data.token)
      
      // Set user data in state
      setUser(data.user)
      
      return data.user
    } catch (error) {
      console.error('Registration error details:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Remove token from localStorage
      localStorage.removeItem('token')
      
      // Clear user state
      setUser(null)
      
      console.log('User logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Creates value object with authentication state and methods
  const value = {
    user,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}