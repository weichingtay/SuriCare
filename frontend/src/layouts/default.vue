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
  import { onMounted, ref } from 'vue'
  // import AppHeader from '@/components/AppHeader.vue'
  // import AppNavigation from '@/components/AppNavigation.vue'
  import { useChildrenStore } from '@/stores/children'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  // Use the children store
  const childrenStore = useChildrenStore()

  const activeTab = ref('')

  const handleNavChange = (tabName: string) => {
    activeTab.value = tabName
  }

  const hideComponent = ['/login', '/addChild', '/signup']
  const chatbotPage = ['/chatbot']

  onMounted(() => {
    if (childrenStore.children.length === 0) {
      childrenStore.loadChildren()
    }
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
