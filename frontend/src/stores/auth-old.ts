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

  // Direct login against Supabase primary_care_giver table
  const directLogin = async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()

      // Query the primary_care_giver table in Supabase
      const { data: users, error: queryError } = await supabase
        .from('primary_care_giver')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .limit(1)

      if (queryError) {
        throw new Error(`Database query failed: ${queryError.message}`)
      }

      if (!users || users.length === 0) {
        throw new Error('Invalid email or password')
      }

      const userRecord = users[0]

      // Create mock Supabase user and session for compatibility with rest of app
      user.value = {
        id: userRecord.auth_user_id || `supabase-user-${userRecord.id}`,
        email: userRecord.email,
        user_metadata: { name: userRecord.username }
      } as unknown as User

      session.value = {
        access_token: `supabase-token-${userRecord.id}`,
        user: user.value
      } as Session

      // Set user profile directly from Supabase table
      userProfile.value = {
        id: userRecord.id,
        username: userRecord.username,
        email: userRecord.email,
        contact_number: userRecord.contact_number,
        relationship: userRecord.relationship
      }

      console.log('✅ Supabase table login successful:', userProfile.value)
      return { success: true }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      console.error('Supabase table login error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()

      // TODO: Migration to Supabase Auth
      // When ready to switch to real Supabase Auth, set VITE_USE_SUPABASE_AUTH=true
      // This will use proper password hashing, JWT tokens, and session management
      const useSupabaseAuth = import.meta.env.VITE_USE_SUPABASE_AUTH === 'true'

      if (useSupabaseAuth) {
        console.log('🔐 Using Supabase Auth (secure authentication)')
        return await supabaseAuthLogin(email, password)
      } else {
        console.log('🗄️ Using direct table authentication (development mode)')
        return await directLogin(email, password)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      console.error('Login error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // TODO: Implement proper Supabase Auth login (for future migration)
  const supabaseAuthLogin = async (email: string, password: string) => {
    try {
      // This will use real Supabase Auth when implemented
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

        // TODO: When migrating, link Supabase Auth user to primary_care_giver table
        // via auth_user_id field or create profile sync
        await fetchUserProfile()
        return { success: true }
      }

      throw new Error('Supabase Auth login failed - no user data returned')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Supabase Auth login failed'
      setError(errorMessage)
      console.error('Supabase Auth login error:', err)
      return { success: false, error: errorMessage }
    }
  }

  // Register new user
  const register = async (email: string, password: string, additionalData?: Partial<UserProfile>) => {
    try {
      setLoading(true)
      clearError()

      // TODO: Add registration mode switch when migrating to Supabase Auth
      const useSupabaseAuth = import.meta.env.VITE_USE_SUPABASE_AUTH === 'true'

      if (useSupabaseAuth) {
        console.log('🔐 Using Supabase Auth registration')
        return await supabaseAuthRegister(email, password, additionalData)
      } else {
        console.log('🗄️ Using direct table registration')
        return await directRegister(email, password, additionalData)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      console.error('Registration error:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // TODO: Implement Supabase Auth registration (for future migration)
  const supabaseAuthRegister = async (email: string, password: string, additionalData?: Partial<UserProfile>) => {
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

      // TODO: When migrating, create linked profile in primary_care_giver table
      if (additionalData) {
        console.log('Would create linked user profile with data:', additionalData)
      }

      return { success: true }
    }

    throw new Error('Supabase Auth registration failed')
  }

  // TODO: Implement direct table registration (for current mode)
  const directRegister = async (email: string, password: string, additionalData?: Partial<UserProfile>) => {
    // For now, just direct table insert (add when needed)
    // This would insert directly into primary_care_giver table
    console.log('Direct registration not implemented yet')
    throw new Error('Direct registration not implemented yet - use Supabase dashboard to add users')
  }

  // Login with Google OAuth
  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      clearError()

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
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
    directLogin,
    supabaseAuthLogin, // TODO: Placeholder for future Supabase Auth
    register,
    directRegister, // TODO: Placeholder for direct table registration
    supabaseAuthRegister, // TODO: Placeholder for future Supabase Auth registration
    loginWithGoogle,
    logout,
    resetPassword,
    getAuthHeaders,
    setError,
    clearError
  }
})
