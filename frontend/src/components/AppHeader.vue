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
</style>
