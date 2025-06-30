<template>
  <v-navigation-drawer
    app
    class="navigation-drawer"
    color="transparent"
    elevation="0"
    permanent
    rail
    rail-width="100"
  >
    <!-- Glassmorphism background -->
    <div class="nav-background" />

    <!-- Logo section at top of sidebar -->
    <template #prepend>
      <div class="logo-section">
        <div class="logo-container" style="cursor: pointer;" @click="goHome">
          <v-avatar class="logo-avatar" rounded="lg">
            <v-img src="@/assets/logo.jpg" />
            <div class="logo-glow" />
          </v-avatar>
          <!-- <div class="brand-text">
            <span class="brand-name">SuriCare</span>
          </div> -->
        </div>
      </div>
    </template>

    <!-- Navigation menu items -->
    <v-list class="navigation-list" density="compact" nav>
      <v-list-item
        v-for="item in navigationItems"
        :key="item.value"
        class="nav-item"
        :class="{ 'nav-item-active': activeTab === item.value }"
        :value="item.value"
        @click="handleNavClick(item.value)"
      >
        <template #default>
          <div class="nav-content">
            <div class="nav-icon-wrapper" :class="{ 'nav-icon-active': activeTab === item.value }">
              <v-icon
                :color="activeTab === item.value ? navIconActiveColor : navIconInactiveColor"
                :size="navIconSize"
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
    <!-- Account section at bottom -->
    <template #append>
      <div class="account-section">
        <AccountDialog v-model="showAccountDialog" />

        <v-list-item
          class="nav-item account-item"
          @click="showAccountDialog = true"
        >
          <template #default>
            <div class="nav-content">
              <div class="nav-icon-wrapper account-icon">
                <v-icon :color="navIconInactiveColor" :size="navIconSize">mdi-account</v-icon>
              </div>
              <div class="nav-label nav-label-inactive">Account</div>
            </div>
          </template>
        </v-list-item>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useCssVar } from '@vueuse/core'
  import { useRouter } from 'vue-router'
  import { useRoute } from 'vue-router'
  import { ref } from 'vue'
  import AccountDialog from './AccountDialog.vue'

  const showAccountDialog = ref(false)

  // Router
  const router = useRouter()
  const route = useRoute()

  // Props
  const props = defineProps({
    activeTab: {
      type: String,
      default: 'home',
    },
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
      route: '/',
    },
    {
      value: 'checkin',
      label: 'History',
      icon: 'mdi-clipboard-check',
      route: '/checkin',
    },
    {
      value: 'dashboard',
      label: 'Dashboard',
      icon: 'mdi-chart-line',
      route: '/dashboard',
    },
    {
      value: 'chatbot',
      label: 'Chatbot',
      icon: 'mdi-chat',
      route: '/chatbot',
    },
    {
      value: 'guidance',
      label: 'Guidance',
      icon: 'mdi-book-open-variant',
      route: '/guidance',
    },
  ]

  const currentPage = computed(() => {
    const match = navigationItems.find(item => item.route === route.path)
    return match?.value ?? ''
  })

  const activeTab = computed(() => {
    return props.activeTab || currentPage.value
  })

  // Methods
  const handleNavClick = tabName => {
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
