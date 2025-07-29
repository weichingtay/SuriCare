/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// Route guards
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  console.log('Router guard - Path:', to.path, 'Authenticated:', authStore.isAuthenticated, 'Initialized:', authStore.isInitialized, 'Loading:', authStore.isLoading)

  // Public pages that don't require authentication
  const publicPages = ['/login', '/signup',  '/index']
  const isPublicPage = publicPages.includes(to.path)

  // Always initialize auth if not done yet
  if (!authStore.isInitialized && !authStore.isLoading) {
    console.log('Initializing auth...')
    try {
      await authStore.initializeAuth()
      console.log('Auth initialized - Authenticated:', authStore.isAuthenticated, 'Initialized:', authStore.isInitialized)
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    }
  }

  // Wait for auth initialization to complete if still loading
  if (authStore.isLoading) {
    console.log('Waiting for auth initialization to complete...')
    return // Let the navigation complete, auth state change will trigger redirect if needed
  }

  // If not a public page and user is not authenticated, redirect to login
  if (!isPublicPage && !authStore.isAuthenticated) {
    console.log('Redirecting to login - user not authenticated')
    return '/login'
  }

  // If authenticated user tries to access login/signup, redirect to dashboard
  if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/signup')) {
    console.log('Redirecting to dashboard - user already authenticated')
    return '/'
  }

  console.log('Route guard passed for:', to.path)
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
