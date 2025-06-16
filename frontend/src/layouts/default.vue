<template>
  <v-app class="custom-app">
    <!-- Background -->
    <div class="app-background"></div>
    
    <!-- Navigation sidebar -->
    <AppNavigation 
      :activeTab="activeTab"
      @nav-change="handleNavChange"
    />
    
    <!-- Header -->
    <AppHeader 
      :currentChild="childrenStore.currentChild"
      :children="childrenStore.children"
      @child-selected="childrenStore.selectChild"
    />
    
    <v-main class="custom-main">
      <div class="custom-main-content">
        <router-view />
      </div>
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

// Use the children store
const childrenStore = useChildrenStore()

const activeTab = ref('home')

const handleNavChange = (tabName: string) => {
  activeTab.value = tabName
}
</script>

<style lang="scss" scoped>

</style>
