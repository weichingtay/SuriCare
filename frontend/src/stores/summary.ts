import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useChildrenStore } from './children'
import { useMealsStore } from './meals'
import { useHealthStore } from './health'
import { usePoopStore } from './poop'
import { useSleepStore } from './sleep'
// import type { MealsData } from './meals'
// import type { PoopData } from './poop'
// import type { SleepData } from './sleep'

export interface SummaryData {
  childAge: number
}

export const useSummaryStore = defineStore('summary', () => {
  // HACK: This will eventually be connected to our database
  // The data should be fetched based on:
  // - Current selected child ID
  // - Selected date
  // - Real-time updates from check-ins

  const childrenStore = useChildrenStore()
  const mealsStore = useMealsStore()
  const healthStore = useHealthStore()
  const poopStore = usePoopStore()
  const sleepStore = useSleepStore()

  // Mock summary data - replace with API calls
  const summaryData = ref<SummaryData>({
    childAge: 0,
  })

  // Helper to parse age string into a number (in months or years)
  const parseAge = (ageString: string): number => {
    const parts = ageString.split(' ');
    const value = parseInt(parts[0]);
    const unit = parts[1];
    if (unit.startsWith('month')) {
      return value; // Return months as is
    } else if (unit.startsWith('year')) {
      return value * 12; // Convert years to months
    }
    return 0; // Default or error case
  };

  const currentDate = new Date().toISOString().split('T')[0]

  // Computed properties to get data from individual stores
  const mealsData = computed(() => {
    return mealsStore.getMealsForDate(currentDate)
  })

  const healthData = computed(() => {
    return healthStore.getHealthForDate(currentDate)
  })

  const poopData = computed(() => {
    return poopStore.getPoopForDate(currentDate)
  })

  const sleepData = computed(() => {
    return sleepStore.getSleepForDate(currentDate)
  })

  // Actions
  const loadSummaryForDate = async (date: Date, // eslint-disable-next-line @typescript-eslint/no-unused-vars
    childId: number) => {
    const dateStr = date.toISOString().split('T')[0]

    // Load data from individual stores
    await Promise.all([
      mealsStore.fetchMealsForDate(dateStr),
      healthStore.fetchHealthForDate(dateStr),
      poopStore.fetchPoopForDate(dateStr),
      sleepStore.fetchSleepForDate(dateStr),
    ])

    // Update other summary data
    summaryData.value.childAge = parseAge(childrenStore.currentChild.age)
  }

  return {
    // State
    summaryData,
    mealsData,
    healthData,
    poopData,
    sleepData,

    // Actions
    loadSummaryForDate,
  }
})
