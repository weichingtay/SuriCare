<template>
  <v-card class="meals-summary-card" elevation="0">
    <!-- Card Header -->
    <div class="card-header">
      <div class="d-flex align-center">
        <v-icon color="error" size="20" class="mr-2">mdi-silverware-fork-knife</v-icon>
        <span class="card-title">Meal</span>
      </div>
      <v-btn 
        size="x-small" 
        variant="flat" 
        color="error" 
        class="check-in-btn"
      >
        Check In
      </v-btn>
    </div>

    <!-- Card Content -->
    <v-card-text class="card-content pa-0">
      <!-- Main Value -->
      <div class="main-value">
        {{ mealCount }} <span class="unit">meals</span>
      </div>

      <!-- Meal Breakdown with Pie Chart Icons -->
      <div class="meal-breakdown">
        <div class="meal-item">
          <div class="meal-icon-group">
            <span class="percentage">{{ mealsData?.percentages?.breakfast || 10 }}%</span>
            <div class="pie-chart-icon">
              <svg width="12" height="12" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="2"/>
                <path 
                  :d="getPieSlicePath(mealsData?.percentages?.breakfast || 0)" 
                  fill="#333"
                  stroke="#333"
                  stroke-width="1"
                  :class="{ 'filled': (mealsData?.percentages?.breakfast || 0) > 0 }"
                />
              </svg>
            </div>
          </div>
          <span class="meal-label">Breakfast</span>
        </div>

        <div class="meal-item">
          <div class="meal-icon-group">
            <span class="percentage">{{ mealsData?.percentages?.lunch || 40 }}%</span>
            <div class="pie-chart-icon">
              <svg width="12" height="12" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="2"/>
                <path 
                  :d="getPieSlicePath(mealsData?.percentages?.lunch || 0)" 
                  fill="#333"
                  stroke="#333"
                  stroke-width="1"
                  :class="{ 'filled': (mealsData?.percentages?.lunch || 0) > 0 }"
                />
              </svg>
            </div>
          </div>
          <span class="meal-label">Lunch</span>
        </div>

        <div class="meal-item">
          <div class="meal-icon-group">
            <span class="percentage">{{ mealsData?.percentages?.dinner || 90 }}%</span>
            <div class="pie-chart-icon">
              <svg width="12" height="12" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="2"/>
                <path 
                  :d="getPieSlicePath(mealsData?.percentages?.dinner || 0)" 
                  fill="#333"
                  stroke="#333"
                  stroke-width="1"
                  :class="{ 'filled': (mealsData?.percentages?.dinner || 0) > 0 }"
                />
              </svg>
            </div>
          </div>
          <span class="meal-label">Dinner</span>
        </div>
      </div>

      <!-- Status Note -->
      <div class="status-note">
        {{ statusNote }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mealsData: {
    type: Object,
    default: () => ({
      percentages: {
        breakfast: 10,
        lunch: 40,
        dinner: 90
      },
      refusedItems: ['yogurt'],
      preferences: ['noodles']
    })
  }
})

// Calculate total meal count based on which meals were attempted
const mealCount = computed(() => {
  if (!props.mealsData?.percentages) return 3
  
  const { breakfast, lunch, dinner } = props.mealsData.percentages
  let count = 0
  if (breakfast > 0) count++
  if (lunch > 0) count++
  if (dinner > 0) count++
  
  return Math.max(count, 1) // At least 1 meal shown
})

// Generate status note based on meal data
const statusNote = computed(() => {
  if (props.mealsData?.refusedItems?.length > 0) {
    return `Jennie ate poorly today, only wanted ${props.mealsData.refusedItems.join(', ')}`
  }
  return "Good eating day overall"
})

// Generate SVG path for pie chart slice
const getPieSlicePath = (percentage) => {
  if (percentage <= 0) return ''
  if (percentage >= 100) {
    // Full circle
    return 'M 8,2 A 6,6 0 1,1 7.99,2 Z'
  }
  
  // Calculate angle in radians
  const angle = (percentage / 100) * 2 * Math.PI
  const x = 8 + 6 * Math.sin(angle)
  const y = 8 - 6 * Math.cos(angle)
  
  // Large arc flag for angles > 180 degrees
  const largeArcFlag = angle > Math.PI ? 1 : 0
  
  return `M 8,8 L 8,2 A 6,6 0 ${largeArcFlag},1 ${x},${y} Z`
}
</script>

<style scoped>
.meals-summary-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.check-in-btn {
  font-size: 10px !important;
  padding: 4px 8px !important;
  height: 24px !important;
  min-width: auto !important;
  text-transform: none !important;
}

.card-content {
  padding: 0 !important;
}

.main-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  line-height: 1;
  margin-bottom: 16px;
}

.unit {
  font-size: 14px;
  font-weight: 400;
  color: #666;
}

.meal-breakdown {
  margin-bottom: 12px;
  display: flex;
  gap: 24px;
}

.meal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.meal-icon-group {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.pie-chart-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-chart-icon svg {
  display: block;
}

.pie-chart-icon .filled {
  fill: #333 !important;
}

.percentage {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.meal-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.status-note {
  font-size: 12px;
  color: #f44336;
  margin-top: 8px;
  line-height: 1.3;
}
</style>