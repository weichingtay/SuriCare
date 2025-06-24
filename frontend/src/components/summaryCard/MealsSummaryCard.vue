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
                <circle cx="8" cy="8" r="6"/>
                <path
                  :d="getPieSlicePath(meal.percentage)"
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
import BaseSummaryCard from '@/components/summaryCard/BaseSummaryCard.vue'
import { useMeals } from '@/composables/useMeals'
import { useMealsStore } from '@/stores/meals'
import { storeToRefs } from 'pinia'

const props = defineProps({
  date: {
    type: String,
    required: true
  }
})

const mealsStore = useMealsStore()
const { getMealsForDate } = storeToRefs(mealsStore)
const mealsData = computed(() => getMealsForDate.value(props.date))

const {
  mealBreakdown,
  mealCount,
  statusNote,
  statusClass,
  getPieSlicePath
} = useMeals(mealsData)

const handleCheckIn = () => {
  emit('check-in') // Remove console.log, just emit
}

// Add emit to defineEmits if not already there
const emit = defineEmits(['check-in'])
</script>

<style scoped>
/* NOTE: Here because they are used to center the pie charts */
/* .breakdown-section {
  align-items: center;
  text-align: center;
}

.meal-breakdown {
  display: flex;
  gap: 24px;
  justify-content: center;
  width: 100%;
} */
</style>

