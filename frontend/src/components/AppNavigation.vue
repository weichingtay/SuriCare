<template>
  <v-navigation-drawer
    permanent
    rail
    rail-width="110"
    color="white"
    elevation="0"
    app
  >
    <!-- Logo section at top of sidebar -->
    <template v-slot:prepend>
      <div class="pa-3 text-center">
        <v-avatar size="80" rounded="lg">
          <v-img src="@/assets/logo.jpg" />
        </v-avatar>
      </div>
    </template>

    <!-- Navigation menu items -->
    <v-list density="compact" nav>
      <!-- Home -->
      <v-list-item
        value="home"
        class="nav-item"
        :class="{ 'nav-item-active': activeTab === 'home' }"
        @click="handleNavClick('home')"
      >
        <template v-slot:default>
          <div class="text-center">
            <v-icon size="24" :color="activeTab === 'home' ? 'pink' : 'grey'">
              mdi-home
            </v-icon>
            <div class="text-caption mt-1" :class="activeTab === 'home' ? 'text-pink' : 'text-grey'">
              Home
            </div>
          </div>
        </template>
      </v-list-item>

      <!-- Check-in -->
      <v-list-item
        value="checkin"
        class="nav-item"
        :class="{ 'nav-item-active': activeTab === 'checkin' }"
        @click="handleNavClick('checkin')"
      >
        <template v-slot:default>
          <div class="text-center">
            <v-icon size="24" :color="activeTab === 'checkin' ? 'pink' : 'grey'">
              mdi-clipboard-check
            </v-icon>
            <div class="text-caption mt-1" :class="activeTab === 'checkin' ? 'text-pink' : 'text-grey'">
              Check-in
            </div>
          </div>
        </template>
      </v-list-item>

      <!-- Dashboard -->
      <v-list-item
        value="dashboard"
        class="nav-item"
        :class="{ 'nav-item-active': activeTab === 'dashboard' }"
        @click="handleNavClick('dashboard')"
      >
        <template v-slot:default>
          <div class="text-center">
            <v-icon size="24" :color="activeTab === 'dashboard' ? 'pink' : 'grey'">
              mdi-chart-line
            </v-icon>
            <div class="text-caption mt-1" :class="activeTab === 'dashboard' ? 'text-pink' : 'text-grey'">
              Dashboard
            </div>
          </div>
        </template>
      </v-list-item>

      <!-- Chatbot -->
      <v-list-item
        value="chatbot"
        class="nav-item"
        :class="{ 'nav-item-active': activeTab === 'chatbot' }"
        @click="handleNavClick('chatbot')"
      >
        <template v-slot:default>
          <div class="text-center">
            <v-icon size="24" :color="activeTab === 'chatbot' ? 'pink' : 'grey'">
              mdi-chat
            </v-icon>
            <div class="text-caption mt-1" :class="activeTab === 'chatbot' ? 'text-pink' : 'text-grey'">
              Chatbot
            </div>
          </div>
        </template>
      </v-list-item>

      <!-- Guidance -->
      <v-list-item
        value="guidance"
        class="nav-item"
        :class="{ 'nav-item-active': activeTab === 'guidance' }"
        @click="handleNavClick('guidance')"
      >
        <template v-slot:default>
          <div class="text-center">
            <v-icon size="24" :color="activeTab === 'guidance' ? 'pink' : 'grey'">
              mdi-book-open-variant
            </v-icon>
            <div class="text-caption mt-1" :class="activeTab === 'guidance' ? 'text-pink' : 'text-grey'">
              Guidance
            </div>
          </div>
        </template>
      </v-list-item>
    </v-list>

    <!-- Account section at bottom -->
    <template v-slot:append>
      <div class="pa-2 text-center">
        <v-icon icon="mdi-account" size="24" color="grey"></v-icon>
        <div class="text-caption mt-1 text-grey">Account</div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Props
const props = defineProps({
  activeTab: {
    type: String,
    default: 'home'
  }
})

// Emits
const emit = defineEmits(['nav-change'])

// Methods
const handleNavClick = (tabName) => {
  emit('nav-change', tabName)
}
</script>

