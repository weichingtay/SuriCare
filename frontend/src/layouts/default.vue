<template>
  <v-app class="custom-app">
    <!-- Background -->
    <div class="app-background" />

    <!-- Navigation sidebar -->
    <AppNavigation
      v-if="!hideComponent.includes(route.name)"
      :active-tab="activeTab"
      @nav-change="handleNavChange"
    />

    <!-- Header -->
    <AppHeader
      v-if="!hideComponent.includes(route.name) && childrenStore.children.length"
      :children="childrenStore.children"
      :current-child="childrenStore.currentChild"
      @child-selected="childrenStore.selectChild"
    />

    <v-main
      v-if="!hideComponent.includes(route.name)"
      class="custom-main"
    >
      <div v-if="chatbotPage.includes(route.name)" class="chatbot-content">
        <router-view />
      </div>

      <div v-else class="custom-main-content">
        <router-view />
      </div>
    </v-main>

    <v-main
      v-else
      class="custom-main-wo-header-nav"
    >
      <router-view />
    </v-main>

    <!-- Growth dialog now handled inside AppHeader component -->

    <!-- <AppFooter /> -->
  </v-app>
</template>

<script lang="ts" setup>
  import { onMounted, ref, watch } from 'vue'
  // import AppHeader from '@/components/AppHeader.vue'
  // import AppNavigation from '@/components/AppNavigation.vue'
  import { useChildrenStore } from '@/stores/children'
  import { useAuthStore } from '@/stores/auth'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  // Use the stores
  const childrenStore = useChildrenStore()
  const authStore = useAuthStore()

  const activeTab = ref('')

  const handleNavChange = (tabName: string) => {
    activeTab.value = tabName
  }

  const hideComponent = ['/login', '/addChild', '/signup']
  const chatbotPage = ['/chatbot']

  // Load children when user is authenticated
  const loadChildrenIfAuthenticated = async () => {
    if (authStore.isAuthenticated && childrenStore.children.length === 0) {
      console.log('User authenticated, loading children...')
      await childrenStore.loadChildren()
    }
  }

  // Watch for authentication changes
  watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (isAuthenticated) {
      loadChildrenIfAuthenticated()
    } else {
      // Clear children when user logs out
      childrenStore.children.splice(0, childrenStore.children.length)
    }
  }, { immediate: true })

  onMounted(async () => {
    // Load children if already authenticated
    await loadChildrenIfAuthenticated()
  })
</script>

<style lang="scss" scoped>
.custom-main-wo-header-nav {
  position: relative;
  z-index: 1;
  height: 100vh;
  overflow: auto;
}

.chatbot-content {
  height: calc(100vh - 72px);
  position: relative;
  overflow-y: auto;
}
</style>
