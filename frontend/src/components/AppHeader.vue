<template>
  <v-app-bar
    app
    color="white"
    elevation="1"
    height="72"
    class="app-header"
  >
    <v-container fluid class="d-flex align-center justify-space-between pa-0">
      <!-- Child selector section -->
      <div class="d-flex align-center">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="text-none pa-2 child-selector-btn"
              height="56"
            >
              <v-avatar size="40" class="mr-3">
                <v-img :src="currentChild.avatar"></v-img>
              </v-avatar>
              <div class="d-flex flex-column align-start mr-2">
                <span class="text-body-1 font-weight-medium text-left">{{ currentChild.name }}</span>
                <span class="text-caption text-grey text-left">{{ currentChild.age }} years old</span>
              </div>
              <v-icon size="20" class="ml-2">mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list min-width="200">
            <v-list-item
              v-for="child in children"
              :key="child.id"
              @click="selectChild(child)"
              :active="child.id === currentChild.id"
            >
              <template v-slot:prepend>
                <v-avatar size="32">
                  <v-img :src="child.avatar"></v-img>
                </v-avatar>
              </template>
              <v-list-item-title>{{ child.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ child.age }} years old</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Growth data section -->
      <div class="d-flex align-center">
        <div class="d-flex align-center mr-6">
          <span class="text-body-2 text-grey mr-3">Height</span>
          <div class="growth-value-header">
            <span class="text-body-1 font-weight-medium">
              {{ currentChild.growth?.height || '100' }}cm
            </span>
            <v-btn
              icon
              size="x-small"
              variant="text"
              class="ml-2"
              @click="openGrowthDialog"
            >
              <v-icon size="16">mdi-pencil</v-icon>
            </v-btn>
          </div>
        </div>

        <div class="d-flex align-center">
          <span class="text-body-2 text-grey mr-3">Weight</span>
          <div class="growth-value-header">
            <span class="text-body-1 font-weight-medium">
              {{ currentChild.growth?.weight || '20' }}kg
            </span>
            <v-btn
              icon
              size="x-small"
              variant="text"
              class="ml-2"
              @click="openGrowthDialog"
            >
              <v-icon size="16">mdi-pencil</v-icon>
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

<style scoped>
.app-header {
  border-bottom: 1px solid #e0e0e0;
}

.child-selector-btn {
  border-radius: 12px !important;
  min-width: 200px;
}

.child-selector-btn:hover {
  background-color: #f5f5f5 !important;
}

.growth-value-header {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  min-width: 80px;
}

.growth-value-header:hover {
  background-color: #e9ecef;
}
</style>
