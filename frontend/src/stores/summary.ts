import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useChildrenStore } from './children'
import { useMealsStore } from './meals'
import { useHealthStore } from './health'
import type { MealsData } from './meals'

export interface SummaryData {
  sleep: {
    nightHours: number
    napHours: number
    wakeCount: number
    childAge: number
  }
  poop: {
    count: number
    unusual: number
    normal: number
  }
}

export const useSummaryStore = defineStore('summary', () => {
  // TODO: This will eventually be connected to our database
  // The data should be fetched based on:
  // - Current selected child ID
  // - Selected date
  // - Real-time updates from check-ins
  
  const childrenStore = useChildrenStore()
  const mealsStore = useMealsStore()
  const healthStore = useHealthStore()
  
  // Mock summary data - replace with API calls
  const summaryData = ref<SummaryData>({
    sleep: {
      nightHours: 5,
      napHours: 7,
      wakeCount: 1,
      childAge: childrenStore.currentChild.age,
    },
    poop: {
      count: 2,
      unusual: 0,
      normal: 1,
    }
  })

  // Computed properties to get data from individual stores
  const mealsData = computed(() => {
    const currentDate = new Date().toISOString().split('T')[0]
    return mealsStore.getMealsForDate(currentDate)
  })

  const healthData = computed(() => {
    const currentDate = new Date().toISOString().split('T')[0]
    return healthStore.getHealthForDate(currentDate)
  })

  // Actions
  const loadSummaryForDate = async (date: Date, childId: number) => {
    const dateStr = date.toISOString().split('T')[0]
    
    // Load data from individual stores
    await Promise.all([
      mealsStore.fetchMealsForDate(dateStr),
      healthStore.fetchHealthForDate(dateStr)
    ])
    
    // Update other summary data
    summaryData.value.sleep.childAge = childrenStore.currentChild.age
  }

  const updateSleepData = (nightHours: number, napHours: number, wakeCount: number) => {
    // TODO: Send to database
    summaryData.value.sleep = {
      ...summaryData.value.sleep,
      nightHours,
      napHours,
      wakeCount,
    }
  }

  const updatePoopData = (count: number, unusual: number) => {
    // TODO: Send to database
    summaryData.value.poop = {
      count,
      unusual,
      normal: count - unusual,
    }
  }

  return {
    // State
    summaryData,
    mealsData,
    healthData,
    
    // Actions
    loadSummaryForDate,
    updateSleepData,
    updatePoopData,
  }
}) 