<template>
  <v-card
    class="login-card pa-8"
    elevation="0"
    width="400"
  >
    <v-card-title class="text-h4 font-weight-bold text-center mb-6 pa-0">
      Login
    </v-card-title>

    <v-form @submit.prevent="handleLogin">
      <!-- Error Message -->
      <v-alert
        v-if="errorMessage || authStore.error"
        type="error"
        class="mb-4"
        density="compact"
      >
        {{ errorMessage || authStore.error }}
      </v-alert>

      <!-- Email Field -->
      <div class="mb-4">
        <label class="field-label">Email</label>
        <v-text-field
          v-model="email"
          bg-color="white"
          color="#9E9E9E"
          density="comfortable"
          hide-details="auto"
          placeholder="Input your email"
          :rules="emailRules"
          variant="outlined"
        />
      </div>

      <!-- Password Field -->
      <div class="mb-4">
        <div class="d-flex justify-space-between align-start">
          <label class="field-label">Password</label>
          <v-btn
            class="pa-0 forgot-password-btn text-capitalize"
            color="primary"
            height="21px"
            size="small"
            variant="text"
            @click="handleForgotPassword"
          >
            Forgot Password?
          </v-btn>
        </div>
        <v-text-field
          v-model="password"
          bg-color="white"
          color="#9E9E9E"
          density="comfortable"
          hide-details="auto"
          placeholder="Input your password"
          :rules="passwordRules"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
        >
          <template #append-inner>
            <v-btn
              :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              size="small"
              variant="text"
              @click="showPassword = !showPassword"
            />
          </template>
        </v-text-field>
      </div>

      <!-- Sign Up Link -->
      <div class="text-center align-start mb-4">
        <span class="text-body-2">Don't have an account? </span>
        <v-btn
          class="pa-0 signup-btn text-capitalize"
          color="primary"
          height="16.8px"
          size="small"
          variant="text"
          @click="handleSignUp"
        >
          Sign Up
        </v-btn>
      </div>

      <!-- Divider -->
      <div class="divider-container mb-4">
        <hr class="divider-line">
        <span class="divider-text">OR</span>
        <hr class="divider-line">
      </div>

      <!-- Google Login Button -->
      <v-btn
        block
        class="mb-4 google-btn"
        size="large"
        variant="outlined"
        @click="handleGoogleLogin"
      >
        <div class="google-icon mr-3" />
        Continue with Google
      </v-btn>

      <!-- Login Button -->
      <v-btn
        block
        class="login-btn"
        :loading="loading"
        size="large"
        type="submit"
        variant="flat"
      >
        Login
      </v-btn>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()

  // Reactive variables
  const email = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const loading = ref(false)
  const errorMessage = ref('')

  // Validation rules
  const emailRules = [
    (v: string) => !!v || 'Email is required',
    (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
  ]

  const passwordRules = [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
  ]

  // Event handlers
  const handleLogin = async () => {
    // Clear any previous errors
    errorMessage.value = ''
    authStore.clearError()

    loading.value = true
    try {
      const result = await authStore.login(email.value, password.value)

      if (result.success) {
        console.log('Login successful!')
        // Navigate to dashboard
        await router.push('/')
      } else {
        errorMessage.value = result.error || 'Login failed. Please check your credentials.'
      }
    } catch (error) {
      console.error('Login error:', error)
      errorMessage.value = 'An unexpected error occurred. Please try again.'
    } finally {
      loading.value = false
    }
  }

  const handleGoogleLogin = async () => {
    try {
      loading.value = true
      const result = await authStore.loginWithGoogle()

      if (result.success) {
        console.log('Google login initiated')
        // Google login will redirect automatically
      } else {
        errorMessage.value = result.error || 'Google login failed'
      }
    } catch (error) {
      console.error('Google login error:', error)
      errorMessage.value = 'Google login failed. Please try again.'
    } finally {
      loading.value = false
    }
  }

  const handleForgotPassword = async () => {
    if (!email.value) {
      errorMessage.value = 'Please enter your email address first'
      return
    }

    try {
      loading.value = true
      const result = await authStore.resetPassword(email.value)

      if (result.success) {
        errorMessage.value = ''
        // Show success message (you might want to use a toast notification instead)
        alert('Password reset email sent! Please check your inbox.')
      } else {
        errorMessage.value = result.error || 'Failed to send reset email'
      }
    } catch (error) {
      console.error('Password reset error:', error)
      errorMessage.value = 'Failed to send reset email. Please try again.'
    } finally {
      loading.value = false
    }
  }

  const handleSignUp = () => {
    router.push('/signup')
  }
</script>

<style scoped>
  .login-card {
    max-width: 100%;
    background-color: #faf9f5;
  }

  .field-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #333;
    display: block;
    margin-bottom: 4px;
  }

  .forgot-password-btn {
    font-size: 0.8rem;
    text-decoration: none;
    min-width: auto;
    height: auto;
    letter-spacing: 0.0178571429em;
  }

  .signup-btn {
    font-size: 0.875rem;
    text-decoration: none;
    min-width: auto;
    height: auto;
    letter-spacing: 0.0178571429em;
  }

  .google-btn {
    background-color: white !important;
    border: solid 1.5px black;
    color: black !important;
    text-transform: none;
    font-weight: 500;
    letter-spacing: 0.0178571429em;
  }

  .google-icon {
    width: 22px;
    height: 22px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .login-btn {
    background-color: #d87179 !important;
    color: white;
    text-transform: none;
    font-weight: 500;
    font-size: 1rem;
    letter-spacing: 0.0178571429em;
  }

  :deep(.v-field__outline) {
    --v-field-border-width: 1px;
  }

  :deep(.v-field--focused .v-field__outline) {
    --v-field-border-width: 2px;
  }

  .divider-container {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    border: none;
    background-color: #9e9e9e;
    margin: 0;
  }

  .divider-text {
    padding: 0 16px;
    color: #9e9e9e;
    font-size: 0.875rem;
    font-weight: 400;
  }
</style>
