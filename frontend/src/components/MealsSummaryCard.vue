<template>
  <BaseSummaryCard
    title="Meal"
    icon="mdi-silverware-fork-knife"
    :main-value="mealCount"
    unit="meals"
    :status-note="statusNote"
    :status-class="statusClass"
    @check-in="handleCheckIn"
  >
    <template #breakdown>
      <div class="meal-breakdown">
        <div class="breakdown-item" v-for="meal in mealBreakdown" :key="meal.name">
          <div class="meal-icon-group">
            <span class="breakdown-value">{{ meal.percentage }}%</span>
            <div class="pie-chart-icon">
              <svg width="12" height="12" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" fill="#f5f5f5" stroke="#e0e0e0" stroke-width="2"/>
                <path
                  :d="getPieSlicePath(meal.percentage)"
                  fill="#333"
                  stroke="#333"
                  stroke-width="1"
                  :class="{ 'filled': meal.percentage > 0 }"
                />
              </svg>
            </div>
          </div>
          <span class="breakdown-label">{{ meal.name }}</span>
        </div>
      </div>
    </template>
  </BaseSummaryCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseSummaryCard from './BaseSummaryCard.vue'

const props = defineProps({
  mealsData: {
    type: Object,
    default: () => ({
      percentages: { breakfast: 10, lunch: 40, dinner: 90 },
      refusedItems: ['yogurt'],
      preferences: ['noodles']
    })
  }
})

const mealBreakdown = computed(() => [
  { name: 'Breakfast', percentage: props.mealsData?.percentages?.breakfast || 10 },
  { name: 'Lunch', percentage: props.mealsData?.percentages?.lunch || 40 },
  { name: 'Dinner', percentage: props.mealsData?.percentages?.dinner || 90 }
])

const mealCount = computed(() => {
  const { breakfast, lunch, dinner } = props.mealsData?.percentages || {}
  let count = 0
  if (breakfast > 0) count++
  if (lunch > 0) count++
  if (dinner > 0) count++
  return Math.max(count, 1)
})

const statusNote = computed(() => {
  if (props.mealsData?.refusedItems?.length > 0) {
    return `Jennie ate poorly today, only wanted ${props.mealsData.refusedItems.join(', ')}`
  }
  return "Good eating day overall"
})

const statusClass = computed(() => {
  return props.mealsData?.refusedItems?.length > 0 ? 'status-negative' : 'status-positive'
})

const getPieSlicePath = (percentage) => {
  if (percentage <= 0) return ''
  if (percentage >= 100) return 'M 8,2 A 6,6 0 1,1 7.99,2 Z'

  const angle = (percentage / 100) * 2 * Math.PI
  const x = 8 + 6 * Math.sin(angle)
  const y = 8 - 6 * Math.cos(angle)
  const largeArcFlag = angle > Math.PI ? 1 : 0

  return `M 8,8 L 8,2 A 6,6 0 ${largeArcFlag},1 ${x},${y} Z`
}

const handleCheckIn = () => {
  console.log('Meal check-in clicked')
}
</script>

<style scoped>
.meal-breakdown {
  display: flex;
  gap: 24px;
}

.breakdown-item {
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

.pie-chart-icon .filled {
  fill: #333 !important;
}

.breakdown-value {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.breakdown-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}
</style>

