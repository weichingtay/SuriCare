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
      <div class="pa-3 text-center">
        <v-img 
          width="50" 
          height="50" 
          class="ml-2" 
          :src="logoUrl"
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
const logoUrl = "https://uccb0214b5a8c4d3dfa90c64ab26.previews.dropboxusercontent.com/p/thumb/ACrOe3_DrJ1cwNxA3AD9pdhTUVbvPLhaavkY114wKWApZzD-LW7Xr7tAtoTRAGpo6OblVMTAc9Vg70-18mlXMXESnClylzP6XbCSzihZpJaMSQxw4wKO0jB8JSIWY1doPe8ztk8FK0ehMhEy-bqPequjh030VrWvA67LyNXbBM8TyyAewn6clpc9Y6E9WoLXAkTaRKQ2KLNUZJutViP74130f68qjpMWSDFcEQfzaxsaViVKC0fgYS2nfMkACNBOQU_q0fLjukhKZA929nwrpPspDIf264LTnJgbpDlAiGFlwAGBmb9vO5zOKDd3Uigi4vmy88TBvnWpeIiwiDwKteIMGIOFWDvdqhlU0IEDOFZuAeP_ylkmGbta07iH8G41bLQE-eefyDlLSdAG-j8GhCuI/p.jpeg"

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