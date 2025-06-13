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
        <div class="logo-container">
          <v-avatar size="56" rounded="lg" class="logo-avatar">
            <v-img src="@/assets/logo.jpg" />
            <div class="logo-glow"></div>
          </v-avatar>
          <div class="brand-text">
            <span class="brand-name">SuriCare</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Navigation menu items -->
    <v-list density="compact" nav class="navigation-list">
      <!-- Home -->
      <v-list-item
        value="home"
        class="nav-item"
        :class="{ 'nav-item-active': activeTab === 'home' }"
        @click="handleNavClick('home')"
      >
        <template v-slot:default>
          <div class="nav-content">
            <div class="nav-icon-wrapper" :class="{ 'nav-icon-active': activeTab === 'home' }">
              <v-icon size="24" :color="activeTab === 'home' ? '#2c1810' : 'rgba(44, 24, 16, 0.6)'">
                mdi-home
              </v-icon>
            </div>
            <div class="nav-label" :class="activeTab === 'home' ? 'nav-label-active' : 'nav-label-inactive'">
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
          <div class="nav-content">
            <div class="nav-icon-wrapper" :class="{ 'nav-icon-active': activeTab === 'checkin' }">
              <v-icon size="24" :color="activeTab === 'checkin' ? '#2c1810' : 'rgba(44, 24, 16, 0.6)'">
                mdi-clipboard-check
              </v-icon>
            </div>
            <div class="nav-label" :class="activeTab === 'checkin' ? 'nav-label-active' : 'nav-label-inactive'">
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
          <div class="nav-content">
            <div class="nav-icon-wrapper" :class="{ 'nav-icon-active': activeTab === 'dashboard' }">
              <v-icon size="24" :color="activeTab === 'dashboard' ? '#2c1810' : 'rgba(44, 24, 16, 0.6)'">
                mdi-chart-line
              </v-icon>
            </div>
            <div class="nav-label" :class="activeTab === 'dashboard' ? 'nav-label-active' : 'nav-label-inactive'">
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
          <div class="nav-content">
            <div class="nav-icon-wrapper" :class="{ 'nav-icon-active': activeTab === 'chatbot' }">
              <v-icon size="24" :color="activeTab === 'chatbot' ? '#2c1810' : 'rgba(44, 24, 16, 0.6)'">
                mdi-chat
              </v-icon>
            </div>
            <div class="nav-label" :class="activeTab === 'chatbot' ? 'nav-label-active' : 'nav-label-inactive'">
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
          <div class="nav-content">
            <div class="nav-icon-wrapper" :class="{ 'nav-icon-active': activeTab === 'guidance' }">
              <v-icon size="24" :color="activeTab === 'guidance' ? '#2c1810' : 'rgba(44, 24, 16, 0.6)'">
                mdi-book-open-variant
              </v-icon>
            </div>
            <div class="nav-label" :class="activeTab === 'guidance' ? 'nav-label-active' : 'nav-label-inactive'">
              Guidance
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
                <v-icon size="24" color="rgba(44, 24, 16, 0.6)">mdi-account</v-icon>
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

<style lang="scss" scoped>

.navigation-drawer {
  height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 1000 !important;
  overflow: hidden !important;
}

.nav-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.9) 50%,
    rgba(255, 255, 255, 0.95) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 182, 193, 0.1);
  z-index: 1;
}

.nav-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    rgba(255, 182, 193, 0.03) 0%,
    rgba(255, 160, 180, 0.02) 50%,
    rgba(255, 140, 165, 0.03) 100%
  );
}

.logo-section {
  padding: 20px 12px;
  text-align: center;
  position: relative;
  z-index: 2;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-avatar {
  position: relative;
  border: 2px solid rgba(255, 182, 193, 0.2);
  margin-bottom: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-avatar:hover {
  transform: scale(1.05);
  border-color: rgba(255, 182, 193, 0.4);
}

.logo-glow {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 12px;
  background: linear-gradient(45deg, rgba(255, 182, 193, 0.2), rgba(255, 160, 180, 0.3));
  z-index: -1;
  animation: logoGlow 3s ease-in-out infinite alternate;
}

@keyframes logoGlow {
  0% { opacity: 0.5; transform: scale(1); }
  100% { opacity: 0.8; transform: scale(1.02); }
}

.brand-text {
  text-align: center;
}

.brand-name {
  font-family: 'Fredoka', cursive !important;
  font-size: 2.0vh !important;
  font-weight: 600 !important;
  color: #2c1810 !important;
  letter-spacing: 0.5px !important;
}

.navigation-list {
  flex: 1 !important;
  overflow-y: auto !important;
  min-height: 0 !important;
  padding: 4px 8px !important;
  position: relative !important;
  z-index: 2 !important;
}

.nav-item {
  min-height: 60px !important;
  margin-bottom: 6px !important;
  border-radius: 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
  position: relative !important;
  overflow: hidden !important;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 182, 193, 0.1) 0%,
    rgba(255, 160, 180, 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item-active {
  background: rgba(255, 182, 193, 0.2) !important;
  border: 2px solid rgba(255, 182, 193, 0.4) !important;
  box-shadow: 0 4px 15px rgba(255, 182, 193, 0.2) !important;
}

.nav-item-active::before {
  opacity: 0 !important;
}

.nav-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  position: relative;
  z-index: 2;
  width: 100%;
}

.nav-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
}

.nav-icon-active {
  background: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
  border: 2px solid rgba(255, 182, 193, 0.3) !important;
  transform: scale(1.05) !important;
}

.nav-item:hover .nav-icon-wrapper:not(.nav-icon-active) {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.02);
}

.nav-label {
  font-family: 'Inter', sans-serif !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  text-align: center !important;
  letter-spacing: 0.2px !important;
  transition: all 0.2s ease !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 102px !important;
  padding: 0 2px !important;
}

.nav-label-active {
  color: #2c1810 !important;
  font-weight: 600 !important;
}

.nav-label-inactive {
  color: rgba(44, 24, 16, 0.7) !important;
}

.nav-item:hover .nav-label-inactive {
  color: rgba(44, 24, 16, 0.9) !important;
}

.account-section {
  padding: 12px 8px 20px 8px;
  position: relative;
  z-index: 2;
}

.account-item {
  min-height: 56px !important;
  margin-bottom: 0 !important;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.account-item:hover {
  opacity: 1;
}

.account-icon {
  background: rgba(44, 24, 16, 0.05) !important;
}

// Remove default Vuetify list item styles
:deep(.v-list-item__content) {
  padding: 0 !important;
}

:deep(.v-list-item__prepend) {
  width: auto !important;
}

:deep(.v-list-item--density-compact.v-list-item--one-line) {
  min-height: auto !important;
}
</style>

