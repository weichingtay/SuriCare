import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Type definitions for our user data structure
export interface UserProfile {
  id: number
  username: string
  email: string
  contact_number: string
  relationship: string
}

export interface AuthState {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', () => {
  // Development mode - set this to true to bypass Supabase auth
  const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true'
  
  // State
  const user = ref<User | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const session = ref<Session | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const userId = computed(() => userProfile.value?.id || null)
  const userEmail = computed(() => user.value?.email || null)

  // Actions
  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // Initialize auth state from Supabase session
  const initializeAuth = async () => {
    try {
      setLoading(true)
      clearError()

      // Development mode - create mock session
      if (isDevelopmentMode) {
        console.log('🔧 Development mode: using mock session')
        user.value = {
          id: 'dev-user-123',
          email: 'dev@example.com',
          user_metadata: { name: 'Dev User' }
        } as unknown as User
        
        session.value = {
          access_token: 'dev-token-123',
          user: user.value
        } as Session
        
        await fetchUserProfile()
        setLoading(false)
        return
      }

      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }

      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
        
        // Fetch user profile from our database
        await fetchUserProfile()
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession)
        
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

  // Fetch user profile from backend database
  const fetchUserProfile = async () => {
    if (!user.value?.id) {
      setError('No user authentication ID available')
      return
    }

    try {
      setLoading(true)
      clearError()

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      
      // Development mode - use fixed test user
      if (isDevelopmentMode) {
        console.log('🔧 Development mode: using fixed test user profile')
        userProfile.value = {
          id: 1,
          username: 'Dev User',
          email: 'dev@example.com',
          contact_number: '+1234567890',
          relationship: 'Parent'
        }
        return
      }
      
      // First, try to get existing user profile by auth_user_id
      try {
        const response = await fetch(`${baseUrl}/user-profile/by-auth-id/${user.value.id}`)
        
        if (response.ok) {
          const profile = await response.json()
          userProfile.value = {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            contact_number: profile.contact_number,
            relationship: profile.relationship
          }
          console.log('Existing user profile loaded:', userProfile.value)
          return
        }
      } catch (err) {
        console.log('No existing profile found, will create new one')
      }

      // If no existing profile, create a new one linked to the Supabase Auth user
      const createProfileResponse = await fetch(`${baseUrl}/user-profile/link-auth`, {
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

      if (!createProfileResponse.ok) {
        throw new Error(`Failed to create user profile: ${createProfileResponse.statusText}`)
      }

      const newProfile = await createProfileResponse.json()
      userProfile.value = {
        id: newProfile.id,
        username: newProfile.username,
        email: newProfile.email,
        contact_number: newProfile.contact_number,
        relationship: newProfile.relationship
      }

      console.log('New user profile created:', userProfile.value)

    } catch (err) {
      console.error('Error fetching/creating user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile')
    } finally {
      setLoading(false)
    }
  }

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()

      // Development mode - bypass Supabase auth
      if (isDevelopmentMode) {
        console.log('🔧 Development mode: bypassing Supabase auth')
        
        // Create mock user and session
        user.value = {
          id: 'dev-user-123',
          email: email,
          user_metadata: { name: 'Dev User' }
        } as unknown as User
        
        session.value = {
          access_token: 'dev-token-123',
          user: user.value
        } as Session
        
        await fetchUserProfile()
        return { success: true }
      }

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
  const register = async (email: string, password: string, additionalData?: Partial<UserProfile>) => {
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
        
        // Create user profile in backend if additional data provided
        if (additionalData) {
          // TODO: Call backend API to create user profile
          console.log('Would create user profile with data:', additionalData)
        }
        
        return { success: true }
      }

      throw new Error('Registration failed - no user data returned')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      console.error('Registration error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Login with Google OAuth
  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      clearError()

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (oauthError) {
        throw oauthError
      }

      return { success: true }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed'
      setError(errorMessage)
      console.error('Google login error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
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

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      clearError()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) {
        throw resetError
      }

      return { success: true, message: 'Password reset email sent' }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed'
      setError(errorMessage)
      console.error('Password reset error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Get authorization headers for API calls
  const getAuthHeaders = () => {
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
    loginWithGoogle,
    logout,
    resetPassword,
    getAuthHeaders,
    setError,
    clearError
  }
}) 