<!-- SummaryCard.vue -->
<template>
  <v-card elevation="1" class="h-100">
    <v-card-text>
      <div class="d-flex flex-column h-100">
        <!-- Card Header -->
        <div class="d-flex align-center mb-4">
          <v-icon :color="iconColor" size="32" class="mr-3">{{ icon }}</v-icon>
          <span class="text-h6 font-weight-medium">{{ title }}</span>
        </div>

        <!-- No Data State -->
        <div v-if="noData" class="text-center my-4">
          <p class="text-body-2 text-grey">No data available for this period</p>
        </div>

        <!-- Data Content -->
        <div v-else class="flex-grow-1">
          <!-- Main Metrics -->
          <div class="d-flex flex-wrap gap-4 mb-4">
            <div 
              v-for="(metric, index) in primaryMetrics" 
              :key="index"
              class="metric-item text-center"
            >
              <div class="text-h4 font-weight-bold" :class="getMetricColor(metric)">
                {{ metric.value }}
              </div>
              <div class="text-caption text-medium-emphasis">{{ metric.label }}</div>
            </div>
          </div>

          <!-- Secondary Metrics -->
          <div v-if="secondaryMetrics?.length" class="d-flex flex-wrap gap-3 mb-4">
            <div 
              v-for="(metric, index) in secondaryMetrics" 
              :key="index"
              class="secondary-metric d-flex align-center"
            >
              <div class="metric-circle" :class="getMetricColor(metric)">
                {{ metric.value }}
              </div>
              <span class="text-caption text-medium-emphasis ml-2">{{ metric.label }}</span>
            </div>
          </div>

          <!-- Meal Progress Circles (Only for Meals card) -->
          <div v-if="title === 'Meals' && hasMealPercentages" class="meal-progress mb-4">
            <div class="d-flex justify-space-between">
              <div v-for="meal in mealPercentages" :key="meal.label" class="text-center">
                <v-progress-circular
                  :model-value="meal.value"
                  :color="getProgressColor(meal.value)"
                  :size="50"
                  :width="5"
                >
                  {{ meal.value }}%
                </v-progress-circular>
                <div class="text-caption mt-1">{{ meal.label }}</div>
              </div>
            </div>
          </div>

          <!-- Additional Info -->
          <div v-if="additionalInfo" class="mt-auto pt-2">
            <template v-for="(info, index) in additionalInfo" :key="index">
              <div class="d-flex align-center text-body-2 mb-1">
                <v-icon :color="info.color || 'grey'" size="small" class="mr-2">{{ info.icon }}</v-icon>
                <span :class="info.color ? 'text-medium-emphasis' : ''">{{ info.text }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  metrics: {
    type: Array,
    default: () => []
  },
  additionalInfo: {
    type: Array,
    default: () => []
  },
  noData: {
    type: Boolean,
    default: false
  }
})

// Split metrics into primary and secondary
const primaryMetrics = computed(() => {
  if (props.title === 'Meals') {
    return props.metrics.slice(0, 1) // Only show total meals count as primary
  }
  return props.metrics.slice(0, 2) // First two metrics are primary
})

const secondaryMetrics = computed(() => {
  if (props.title === 'Meals') {
    return [] // Meals will use progress circles instead
  }
  return props.metrics.slice(2)
})

// Meal percentages handling
const hasMealPercentages = computed(() => {
  return props.title === 'Meals' && props.metrics.some(m => m.label.toLowerCase().includes('breakfast'))
})

const mealPercentages = computed(() => {
  if (!hasMealPercentages.value) return []
  return props.metrics
    .filter(m => ['Breakfast', 'Lunch', 'Dinner'].includes(m.label))
    .map(m => ({
      label: m.label,
      value: parseInt(m.value) || 0
    }))
})

// Helper functions
const getMetricColor = (metric) => {
  if (props.title === 'Health') {
    return metric.value === 'Healthy' ? 'text-success' : 'text-warning'
  }
  return 'text-primary'
}

const getProgressColor = (value) => {
  if (value >= 80) return 'success'
  if (value >= 50) return 'warning'
  return 'error'
}
</script>

<style scoped>
.metric-item {
  min-width: 80px;
}

.gap-4 {
  gap: 1rem;
}

.gap-3 {
  gap: 0.75rem;
}

.secondary-metric {
  min-width: 70px;
}

.metric-circle {
  background-color: var(--v-theme-surface-variant);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.meal-progress {
  max-width: 300px;
  margin: 0 auto;
}

/* Theme-based text colors */
.text-primary {
  color: rgb(var(--v-theme-primary));
}

.text-success {
  color: rgb(var(--v-theme-success));
}

.text-warning {
  color: rgb(var(--v-theme-warning));
}

.text-error {
  color: rgb(var(--v-theme-error));
}
</style> 