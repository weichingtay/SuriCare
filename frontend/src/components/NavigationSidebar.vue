<!-- NavigationSidebar.vue -->
<template>
  <v-navigation-drawer
    permanent
    rail
    rail-width="80"
    color="white"
    elevation="2"
  >
    <!-- Logo section -->
    <template v-slot:prepend>
      <div class="pa-2 text-center">
        <v-img 
          :src="logoUrl"
          height="40"
          class="mb-2"
          contain
        />
      </div>
    </template>

    <!-- Navigation menu items -->
    <v-list density="compact" nav>
      <v-list-item
        v-for="item in navigationItems"
        :key="item.value"
        :value="item.value"
        class="nav-item"
      >
        <template v-slot:default>
          <div class="text-center">
            <v-icon size="25">{{ item.icon }}</v-icon>
            <div class="text-caption mt-1" style="font-size: 11px !important;">{{ item.text }}</div>
          </div>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import logoImage from '../assets/suricare-full-logo.jpg'

const logoUrl = logoImage

const navigationItems = [
  { value: 'home', icon: 'mdi-home', text: 'Home' },
  { value: 'checkin', icon: 'mdi-clipboard-check', text: 'Check-In' },
  { value: 'dashboard', icon: 'mdi-chart-line', text: 'Dashboard' },
  { value: 'chatbot', icon: 'mdi-chat', text: 'Chatbot' },
  { value: 'guidance', icon: 'mdi-book-open-variant', text: 'Guidance' }
]
</script>

<style scoped>
.nav-item {
  min-height: 30px !important;
}

:deep(.v-navigation-drawer) {
  position: fixed !important;
}

:deep(.v-navigation-drawer--rail) {
  width: 90px !important;
}
</style> 