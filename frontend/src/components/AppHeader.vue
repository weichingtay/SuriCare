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
        
        <!-- Growth data cards moved here -->
        <div class="growth-cards">
          <div class="growth-card combined-card" @click="openGrowthDialog">
            <!-- Metric Pairs: icon + (label+value) -->
            <div class="metric-pair height-pair">
              <v-icon size="20">mdi-human-male-height</v-icon>
              <div class="metric-info">
                <span class="growth-label">Height</span>
                <span class="growth-value">{{ currentChild.growth?.height || '100' }}cm</span>
              </div>
            </div>

            <div class="metric-pair weight-pair">
              <v-icon size="20">mdi-weight-kilogram</v-icon>
              <div class="metric-info">
                <span class="growth-label">Weight</span>
                <span class="growth-value">{{ currentChild.growth?.weight || '20' }}kg</span>
              </div>
            </div>

            <div class="metric-pair head-pair">
              <v-icon size="20">mdi-head</v-icon>
              <div class="metric-info">
                <span class="growth-label">Head Circ.</span>
                <span class="growth-value">{{ currentChild.growth?.headCircumference || '45' }}cm</span>
              </div>
            </div>

            <v-btn
              icon
              size="x-small"
              variant="text"
              class="growth-edit-btn"
              @click.stop="openGrowthDialog"
            >
              <v-icon size="14" color="rgba(0,0,0,0.6)">mdi-pencil</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Right section: Now empty -->
      <div class="right-section">
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

