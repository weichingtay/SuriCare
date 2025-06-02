<!-- ChildStats.vue -->
<template>
  <div class="d-flex align-center child-stats">
    <div class="d-flex gap-6">
      <div class="stat-item">
        <div class="text-caption text-medium-emphasis">Height</div>
        <div class="d-flex align-center stat-value">
          <span class="text-subtitle-1 font-weight-medium">95</span>
          <span class="text-caption text-medium-emphasis ml-1">cm</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="text-caption text-medium-emphasis">Weight</div>
        <div class="d-flex align-center stat-value">
          <span class="text-subtitle-1 font-weight-medium">15.5</span>
          <span class="text-caption text-medium-emphasis ml-1">kg</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="text-caption text-medium-emphasis">Age</div>
        <div class="d-flex align-center stat-value">
          <span class="text-subtitle-1 font-weight-medium">{{ child.age }}</span>
          <span class="text-caption text-medium-emphasis ml-1">y/o</span>
        </div>
      </div>
    </div>
    
    <div class="d-flex align-center ml-6">
      <!-- Last update indicator -->
      <div class="last-update-indicator mr-3" :class="updateStatus">
        <span class="text-caption">Last update: 2w ago</span>
        <v-tooltip activator="parent" location="bottom">
          Child details were last updated 2 weeks ago.<br>
          It's recommended to update measurements monthly.
        </v-tooltip>
      </div>

      <!-- Update button -->
      <v-btn
        variant="tonal"
        size="small"
        color="primary"
        class="update-btn"
        @click="handleUpdate"
      >
        <v-icon
          size="small"
          class="mr-1"
        >
          mdi-pencil
        </v-icon>
        <span class="update-text">Update Details</span>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  child: {
    type: Object,
    required: true
  }
})

// Placeholder: This would be calculated based on actual last update time
const updateStatus = computed(() => {
  const weeksSinceUpdate = 2 // Placeholder value
  if (weeksSinceUpdate <= 2) return 'status-good'
  if (weeksSinceUpdate <= 4) return 'status-warning'
  return 'status-alert'
})

const handleUpdate = () => {
  // TODO: Implement update functionality
  console.log('Update child details clicked')
}
</script>

<style scoped>
.child-stats {
  height: 100%;
  padding: 0 8px;
}

.stat-item {
  min-width: 70px;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -1.5rem;
  top: 25%;
  height: 50%;
  width: 1px;
  background: rgba(0, 0, 0, 0.12);
}

.stat-value {
  margin-top: 2px;
}

.update-btn {
  border-radius: 8px;
  font-weight: 500;
}

.update-text {
  font-size: 0.875rem;
  letter-spacing: 0;
  text-transform: none;
}

.last-update-indicator {
  padding: 4px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.status-good {
  background: rgba(76, 175, 80, 0.1);
  color: rgb(46, 125, 50);
}

.status-warning {
  background: rgba(255, 152, 0, 0.1);
  color: rgb(230, 81, 0);
}

.status-alert {
  background: rgba(244, 67, 54, 0.1);
  color: rgb(211, 47, 47);
}
</style> 