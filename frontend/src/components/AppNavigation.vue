<template>
  <v-navigation-drawer
    permanent
    rail
    rail-width="110"
    color="transparent"
    elevation="0"
    app
    class="navigation-drawer"
  >
    <!-- Glassmorphism background -->
    <div class="nav-background"></div>

    <!-- Logo section at top of sidebar -->
    <template v-slot:prepend>
      <div class="logo-section">
        <div class="logo-container" @click="goHome" style="cursor: pointer;">
          <v-avatar  rounded="lg" class="logo-avatar">
            <v-img src="@/assets/logo.jpg" />
            <div class="logo-glow"></div>
          </v-avatar>
          <!-- <div class="brand-text">
            <span class="brand-name">SuriCare</span>
          </div> -->
        </div>
      </div>
    </template>

    <!-- Navigation menu items -->
    <v-list density="compact" nav class="navigation-list">
      <v-list-item
        v-for="item in navigationItems"
        :key="item.value"
        :value="item.value"
        class="nav-item"
        :class="{ 'nav-item-active': activeTab === item.value }"
        @click="handleNavClick(item.value)"
      >
        <template v-slot:default>
          <div class="nav-content">
            <div class="nav-icon-wrapper" :class="{ 'nav-icon-active': activeTab === item.value }">
              <v-icon
                :size="navIconSize"
                :color="activeTab === item.value ? navIconActiveColor : navIconInactiveColor"
              >
                {{ item.icon }}
              </v-icon>
            </div>
            <div class="nav-label" :class="activeTab === item.value ? 'nav-label-active' : 'nav-label-inactive'">
              {{ item.label }}
            </div>
          </div>
        </template>
      </v-list-item>
    </v-list>

    <!-- Account section at bottom -->
    <template v-slot:append>
      <div class="account-section">
        <v-list-item class="nav-item account-item">
          <template v-slot:default>
            <div class="nav-content">
              <div class="nav-icon-wrapper account-icon">
                <v-icon :size="navIconSize" :color="navIconInactiveColor">mdi-account</v-icon>
              </div>
              <div class="nav-label nav-label-inactive">Account</div>
            </div>
          </template>
        </v-list-item>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useCssVar } from '@vueuse/core'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Props
const props = defineProps({
  activeTab: {
    type: String,
    default: 'home'
  }
})

// Emits
const emit = defineEmits(['nav-change'])

// Get CSS variables
const navIconSize = useCssVar('--nav-icon-size')
const navIconActiveColor = useCssVar('--nav-icon-active-color')
const navIconInactiveColor = useCssVar('--nav-icon-inactive-color')

// Navigation items configuration
const navigationItems = [
  {
    value: 'home',
    label: 'Home',
    icon: 'mdi-home',
    route: '/'
  },
  {
    value: 'checkin',
    label: 'Check-in',
    icon: 'mdi-clipboard-check',
    route: '/checkin'
  },
  {
    value: 'dashboard',
    label: 'Dashboard',
    icon: 'mdi-chart-line',
    route: '/dashboard'
  },
  {
    value: 'chatbot',
    label: 'Chatbot',
    icon: 'mdi-chat',
    route: '/chatbot'
  },
  {
    value: 'guidance',
    label: 'Guidance',
    icon: 'mdi-book-open-variant',
    route: '/guidance'
  }
]

// Methods
const handleNavClick = (tabName) => {
  const selectedItem = navigationItems.find(item => item.value === tabName)
  if (selectedItem) {
    router.push(selectedItem.route)
  }
  emit('nav-change', tabName)
}

const goHome = () => {
  router.push('/')
  emit('nav-change', 'home')
}
</script>

<style lang="css" scoped>
:deep(.v-list-item__overlay) {
  opacity: 0 !important;
}
</style>
