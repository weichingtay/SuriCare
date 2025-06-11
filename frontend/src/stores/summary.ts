import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useChildrenStore } from './children'

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
  meals: {
    count: number
    percentages: {
      breakfast: number
      lunch: number
      dinner: number
    }
    refusedItems: string[]
    preferences: string[]
  }
  health: {
    status: string
    message: string
  }
}

export const useSummaryStore = defineStore('summary', () => {
  // TODO: This will eventually be connected to our database
  // The data should be fetched based on:
  // - Current selected child ID
  // - Selected date
  // - Real-time updates from check-ins
  
  const childrenStore = useChildrenStore()
  
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
    },
    meals: {
      count: 3,
      percentages: {
        breakfast: 10,
        lunch: 40,
        dinner: 90,
      },
      refusedItems: ['yogurt'],
      preferences: ['noodles', 'tofu'],
    },
    health: {
      status: 'Healthy',
      message: 'No symptoms today',
    },
  })

  // Actions
  const loadSummaryForDate = async (date: Date, childId: number) => {
    // TODO: Replace with actual API call
    // const response = await api.getSummary(childId, date)
    // summaryData.value = response.data
    
    console.log(`Loading summary for child ${childId} on ${date.toISOString()}`)
    
    // For now, just update the child age in sleep data
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

  const updateMealData = (percentages: SummaryData['meals']['percentages'], refusedItems: string[], preferences: string[]) => {
    // TODO: Send to database
    summaryData.value.meals = {
      ...summaryData.value.meals,
      percentages,
      refusedItems,
      preferences,
      count: Object.values(percentages).filter(p => p > 0).length,
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

  const updateHealthData = (status: string, message: string) => {
    // TODO: Send to database
    summaryData.value.health = {
      status,
      message,
    }
  }

  return {
    // State
    summaryData,
    
    // Actions
    loadSummaryForDate,
    updateSleepData,
    updateMealData,
    updatePoopData,
    updateHealthData,
  }
}) 