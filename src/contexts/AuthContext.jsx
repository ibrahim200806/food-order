import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../utils/supabaseClient'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Fetch additional user details
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single()

          if (userData) {
            setUser({
              ...userData,
              email: session.user.email
            })
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Session check error:', error)
        setLoading(false)
      }
    }

    checkUser()

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          // Fetch user details when signed in
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single()

          if (userData) {
            setUser({
              ...userData,
              email: session.user.email
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async (phone, password) => {
    try {
      // First, find the user by phone
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

      if (userError || !users) {
        throw new Error('User not found')
      }

      // Use email for Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: users.email,
        password: password
      })

      if (error) throw error

      // Set user data
      setUser({
        ...users,
        email: data.user.email
      })

      return users
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (name, email, phone, password) => {
    try {
      // First, check if user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email},phone.eq.${phone}`)

      if (checkError) throw checkError
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('User with this email or phone already exists')
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            phone: phone,
            role: 'user'
          }
        }
      })

      if (authError) throw authError

      // Insert additional user details into users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          name,
          email,
          phone,
          role: 'user'
        }])
        .select()

      if (userError) throw userError

      // Set user data
      setUser({
        ...userData[0],
        email: authData.user.email
      })

      return userData[0]
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}