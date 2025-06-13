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
        <div >
          <v-menu class="dropdown-menu">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="elevated"
                class="child-selector-btn"
                height="48"
                style="justify-content: flex-start"
              >
                <v-avatar size="32" class="child-avatar" style="margin-right: 12px">
                  <v-img :src="currentChild.avatar"></v-img>
                </v-avatar>
                <div class="child-info" style="flex: 1; text-align: left">
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

<!-- STYLES -->
<style lang="scss" scoped>



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
