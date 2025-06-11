<template>
  <v-app-bar
    app
    color="transparent"
    elevation="0"
    height="72"
    class="app-header"
  >
    <!-- Glassmorphism background overlay -->
    <div class="header-background"></div>
    
    <v-container fluid class="header-container">
      <!-- Left section: Welcome message and child selector in one row -->
      <div class="left-section">
        <!-- Welcome text -->
        <div class="welcome-content">
          <h1 class="welcome-text">Welcome, Wei Ching</h1>
          <p class="welcome-subtitle">Let's check on your little one today</p>
        </div>
        
        <!-- Child selector -->
        <div class="child-selector-wrapper">
          <v-menu class="dropdown-menu">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="elevated"
                class="child-selector-btn"
                height="48"
              >
                <v-avatar size="32" class="child-avatar">
                  <v-img :src="currentChild.avatar"></v-img>
                </v-avatar>
                <div class="child-info">
                  <span class="child-name">{{ currentChild.name }}</span>
                  <span class="child-age">{{ currentChild.age }} years old</span>
                </div>
                <v-icon size="16" class="dropdown-icon">mdi-chevron-down</v-icon>
              </v-btn>
            </template>

            <v-list class="child-dropdown">
              <v-list-item
                v-for="child in children"
                :key="child.id"
                @click="selectChild(child)"
                :active="child.id === currentChild.id"
                class="child-dropdown-item"
              >
                <template v-slot:prepend>
                  <v-avatar size="32" class="dropdown-avatar">
                    <v-img :src="child.avatar"></v-img>
                  </v-avatar>
                </template>
                <v-list-item-title class="dropdown-name">{{ child.name }}</v-list-item-title>
                <v-list-item-subtitle class="dropdown-age">{{ child.age }} years old</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <!-- Right section: Growth data cards -->
      <div class="right-section">
        <div class="growth-cards">
          <div class="growth-card height-card" @click="openGrowthDialog">
            <div class="growth-icon height-icon">
              <v-icon size="20" color="white">mdi-human-male-height</v-icon>
            </div>
            <div class="growth-content">
              <span class="growth-label">Height</span>
              <span class="growth-value">{{ currentChild.growth?.height || '100' }}cm</span>
            </div>
            <v-btn
              icon
              size="x-small"
              variant="text"
              class="growth-edit-btn"
              @click.stop="openGrowthDialog"
            >
              <v-icon size="14" color="rgba(255,255,255,0.8)">mdi-pencil</v-icon>
            </v-btn>
          </div>

          <div class="growth-card weight-card" @click="openGrowthDialog">
            <div class="growth-icon weight-icon">
              <v-icon size="20" color="white">mdi-weight-kilogram</v-icon>
            </div>
            <div class="growth-content">
              <span class="growth-label">Weight</span>
              <span class="growth-value">{{ currentChild.growth?.weight || '20' }}kg</span>
            </div>
            <v-btn
              icon
              size="x-small"
              variant="text"
              class="growth-edit-btn"
              @click.stop="openGrowthDialog"
            >
              <v-icon size="14" color="rgba(255,255,255,0.8)">mdi-pencil</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Props
const props = defineProps({
  currentChild: {
    type: Object,
    required: true
  },
  children: {
    type: Array,
    required: true
  }
})

// Emits
const emit = defineEmits(['child-selected', 'open-growth-dialog'])

// Methods
const selectChild = (child) => {
  emit('child-selected', child)
}

const openGrowthDialog = () => {
  emit('open-growth-dialog')
}
</script>

<style lang="scss" scoped>
@import '@/styles/settings.scss';

.app-header {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 182, 193, 0.2);
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 182, 193, 0.9) 0%,
    rgba(255, 160, 180, 0.7) 50%,
    rgba(255, 140, 165, 0.5) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1;
}

.header-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='5' cy='5' r='3'/%3E%3Ccircle cx='35' cy='35' r='3'/%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.4;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  position: relative;
  z-index: 2;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.welcome-text {
  font-family: 'Manrope', sans-serif !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  color: #2c1810 !important;
  margin: 0 !important;
  line-height: 1.2 !important;
  letter-spacing: -0.02em !important;
}

.welcome-subtitle {
  font-family: 'Inter', sans-serif !important;
  font-size: 12px !important;
  font-weight: 400 !important;
  color: rgba(44, 24, 16, 0.7) !important;
  margin: 2px 0 0 0 !important;
  line-height: 1.3 !important;
}

.child-selector-wrapper {
  // No additional margin needed
}

.child-selector-btn {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 14px !important;
  min-width: 180px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  padding: 0 16px !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}

.child-selector-btn:hover {
  background: rgba(255, 255, 255, 1) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12) !important;
}

.child-avatar {
  border: 2px solid rgba(255, 182, 193, 0.3);
  flex-shrink: 0;
}

.child-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.child-name {
  font-family: 'Fredoka', cursive !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #2c1810 !important;
  line-height: 1.2 !important;
}

.child-age {
  font-family: 'Inter', sans-serif !important;
  font-size: 11px !important;
  font-weight: 400 !important;
  color: rgba(44, 24, 16, 0.6) !important;
  line-height: 1.2 !important;
}

.dropdown-icon {
  color: rgba(44, 24, 16, 0.5) !important;
  transition: transform 0.2s ease !important;
  flex-shrink: 0;
}

.child-selector-btn:hover .dropdown-icon {
  transform: rotate(180deg) !important;
}

.child-dropdown {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 14px !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12) !important;
  min-width: 200px !important;
  margin-top: 4px !important;
}

.child-dropdown-item {
  border-radius: 10px !important;
  margin: 4px 6px !important;
  transition: all 0.2s ease !important;
}

.child-dropdown-item:hover {
  background: rgba(255, 182, 193, 0.1) !important;
}

.child-dropdown-item.v-list-item--active {
  background: rgba(255, 182, 193, 0.2) !important;
  color: #d87179 !important;
}

.dropdown-avatar {
  border: 2px solid rgba(255, 182, 193, 0.3);
}

.dropdown-name {
  font-family: 'Fredoka', cursive !important;
  font-weight: 500 !important;
  color: #2c1810 !important;
}

.dropdown-age {
  font-family: 'Inter', sans-serif !important;
  color: rgba(44, 24, 16, 0.6) !important;
}

.right-section {
  display: flex;
  align-items: center;
}

.growth-cards {
  display: flex;
  gap: 12px;
}

.growth-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  min-width: 120px;
  height: 48px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.growth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.height-card::before {
  background: linear-gradient(135deg, rgba(102, 187, 255, 0.15), rgba(102, 187, 255, 0.08));
}

.weight-card::before {
  background: linear-gradient(135deg, rgba(255, 142, 198, 0.15), rgba(255, 142, 198, 0.08));
}

.growth-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.growth-card:hover::before {
  opacity: 1;
}

.growth-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.height-icon {
  background: linear-gradient(135deg, #66BBFF, #4FA8E8);
  box-shadow: 0 4px 15px rgba(102, 187, 255, 0.3);
}

.weight-icon {
  background: linear-gradient(135deg, #FF8EC6, #E574B0);
  box-shadow: 0 4px 15px rgba(255, 142, 198, 0.3);
}

.growth-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  z-index: 1;
}

.growth-label {
  font-family: 'Inter', sans-serif !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  color: rgba(44, 24, 16, 0.7) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  margin-bottom: 1px;
}

.growth-value {
  font-family: 'Manrope', sans-serif !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  color: #2c1810 !important;
  line-height: 1.2 !important;
}

.growth-edit-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.growth-card:hover .growth-edit-btn {
  opacity: 1;
}
</style>
