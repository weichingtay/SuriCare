<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()

  onMounted(async () => {
    // Initialize authentication on app startup
    await authStore.initializeAuth()
  })
</script>
