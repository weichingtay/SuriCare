<template>
  <v-app class="custom-app">
    <!-- Background -->
    <div class="app-background"></div>

    <!-- Navigation sidebar -->
    <AppNavigation
      :activeTab="activeTab"
      @nav-change="handleNavChange"
      v-if="!hideComponent.includes(route.name)"
    />

    <!-- Header -->
    <AppHeader
      :currentChild="childrenStore.currentChild"
      :children="childrenStore.children"
      @child-selected="childrenStore.selectChild"
      v-if="!hideComponent.includes(route.name)"
    />

    <v-main
      class="custom-main"
      v-if="!hideComponent.includes(route.name)"
    >
      <div class="chatbot-content" v-if="chatbotPage.includes(route.name)">
        <router-view />
      </div>
    
      <div class="custom-main-content" v-else>
        <router-view />
      </div>
    </v-main>

    <v-main
      class="custom-main-wo-header-nav"
      v-else
    >
      <router-view />
    </v-main>

    <!-- Growth dialog now handled inside AppHeader component -->

    <!-- <AppFooter /> -->
  </v-app>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  // import AppHeader from '@/components/AppHeader.vue'
  // import AppNavigation from '@/components/AppNavigation.vue'
  import { useChildrenStore } from '@/stores/children'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  // Use the children store
  const childrenStore = useChildrenStore()

  const activeTab = ref('home')

  const handleNavChange = (tabName: string) => {
    activeTab.value = tabName
  }

  const hideComponent = ['/login', '/addChild']
  const chatbotPage = ['/chatbot']
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
