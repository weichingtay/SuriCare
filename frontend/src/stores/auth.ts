import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: number
  username: string
  email: string
  contact_number: string
  relationship: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const session = ref<Session | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const userId = computed(() => userProfile.value?.id || null)
  const userEmail = computed(() => user.value?.email || null)

  // Helper functions
  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // Initialize auth state
  const initializeAuth = async (): Promise<void> => {
    try {
      setLoading(true)
      clearError()

      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }

      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
        await fetchUserProfile()
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        console.log('Auth state changed:', event)
        
        session.value = currentSession
        user.value = currentSession?.user || null

        if (event === 'SIGNED_IN' && currentSession) {
          await fetchUserProfile()
        } else if (event === 'SIGNED_OUT') {
          userProfile.value = null
        }
      })

    } catch (err) {
      console.error('Auth initialization error:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize authentication')
    } finally {
      setLoading(false)
    }
  }

  // Fetch user profile from backend
  const fetchUserProfile = async (): Promise<void> => {
    if (!user.value?.id) {
      setError('No user authentication ID available')
      return
    }

    try {
      setLoading(true)
      clearError()

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      
      // Get user profile by auth_user_id
      const response = await fetch(`${baseUrl}/user-profile/by-auth-id/${user.value.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // Auto-create profile for new users
          await createUserProfile()
          return
        }
        throw new Error(`Failed to fetch user profile: ${response.statusText}`)
      }

      const profile = await response.json()
      userProfile.value = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        contact_number: profile.contact_number,
        relationship: profile.relationship
      }

      console.log('User profile loaded:', userProfile.value)

    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile')
    } finally {
      setLoading(false)
    }
  }

  // Create user profile for new Supabase Auth users
  const createUserProfile = async (): Promise<void> => {
    if (!user.value) {
      throw new Error('No authenticated user')
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      
      const response = await fetch(`${baseUrl}/user-profile/link-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auth_user_id: user.value.id,
          username: user.value.user_metadata?.name || user.value.email?.split('@')[0] || 'User',
          email: user.value.email || '',
          contact_number: '',
          relationship: 'Parent'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create user profile: ${response.statusText}`)
      }

      const newProfile = await response.json()
      userProfile.value = {
        id: newProfile.id,
        username: newProfile.username,
        email: newProfile.email,
        contact_number: newProfile.contact_number,
        relationship: newProfile.relationship
      }

      console.log('New user profile created:', userProfile.value)

    } catch (err) {
      console.error('Error creating user profile:', err)
      throw err
    }
  }

  // Login with email and password
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        throw loginError
      }

      if (data.user && data.session) {
        user.value = data.user
        session.value = data.session
        await fetchUserProfile()
        return { success: true }
      }

      throw new Error('Login failed - no user data returned')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      console.error('Login error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Register new user
  const register = async (email: string, password: string, additionalData?: { name?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: additionalData
        }
      })

      if (signupError) {
        throw signupError
      }

      if (data.user) {
        user.value = data.user
        session.value = data.session
        
        // Profile will be created automatically when user confirms email
        return { success: true }
      }

      throw new Error('Registration failed')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      console.error('Registration error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      const { error: logoutError } = await supabase.auth.signOut()

      if (logoutError) {
        throw logoutError
      }

      // Clear local state
      user.value = null
      userProfile.value = null
      session.value = null

      return { success: true }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      setError(errorMessage)
      console.error('Logout error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Get authorization headers for API calls
  const getAuthHeaders = (): Record<string, string> => {
    if (!session.value?.access_token) {
      return {}
    }

    return {
      'Authorization': `Bearer ${session.value.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  return {
    // State
    user: readonly(user),
    userProfile: readonly(userProfile),
    session: readonly(session),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    isAuthenticated,
    userId,
    userEmail,
    
    // Actions
    initializeAuth,
    fetchUserProfile,
    login,
    register,
    logout,
    getAuthHeaders,
    setError,
    clearError
  }
})