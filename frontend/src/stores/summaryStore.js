import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSummaryStore = defineStore('summary', () => {
  // State
  const selectedDate = ref(new Date('2025-06-01'))
  const summaryData = ref({
    sleep: {
      nightHours: 8,
      napHours: 1,
      wakeCount: 1,
      childAge: 3
    },
    poop: {
      count: 1,
      unusual: 0,
      normal: 1
    },
    meals: {
      count: 3,
      percentages: {
        breakfast: 50,
        lunch: 70,
        dinner: 65
      },
      refusedItems: ['vegetables'],
      preferences: ['noodles', 'tofu']
    },
    health: {
      status: 'Healthy',
      message: 'No symptoms today'
    }
  })

  // Sample data storage
  const sampleDataByDate = {
    '1-2025-05-30': {
      sleep: { nightHours: 9, napHours: 1, wakeCount: 1, childAge: 3 },
      poop: { count: 2, unusual: 0, normal: 2 },
      meals: {
        count: 3,
        percentages: { breakfast: 90, lunch: 90, dinner: 75 },
        refusedItems: [],
        preferences: ['noodles', 'apple']
      },
      health: { status: 'Healthy', message: 'No symptoms today' }
    },
    // ... other sample data can be added here
  }

  // Actions
  function setSelectedDate(date) {
    selectedDate.value = date
  }

  function loadDataForDate(date, childId) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateKey = `${year}-${month}-${day}`
    const dataKey = `${childId}-${dateKey}`

    if (sampleDataByDate[dataKey]) {
      summaryData.value = { ...sampleDataByDate[dataKey] }
    } else {
      summaryData.value = generateRandomData()
    }
  }

  // Helper function to generate random data
  function generateRandomData() {
    if (Math.random() < 0.2) {
      return {
        sleep: { noData: true },
        poop: { noData: true },
        meals: { noData: true },
        health: { noData: true }
      }
    }

    return {
      sleep: {
        nightHours: Math.floor(Math.random() * 4) + 7,
        napHours: Math.random() < 0.7 ? 1.5 : 0,
        wakeCount: Math.floor(Math.random() * 3),
        childAge: 3
      },
      poop: {
        count: Math.floor(Math.random() * 3) + 1,
        unusual: Math.random() > 0.7 ? 1 : 0,
        normal: Math.floor(Math.random() * 3) + 1
      },
      meals: {
        count: 3,
        percentages: {
          breakfast: Math.floor(Math.random() * 70) + 30,
          lunch: Math.floor(Math.random() * 70) + 30,
          dinner: Math.floor(Math.random() * 70) + 30
        },
        refusedItems: Math.random() > 0.5 ? ['vegetables'] : [],
        preferences: ['pasta', 'fruits']
      },
      health: {
        status: Math.random() > 0.8 ? 'Mild symptoms' : 'Healthy',
        message: Math.random() > 0.8 ? 'Slight runny nose' : 'No symptoms today'
      }
    }
  }

  // Getters
  const getCurrentSummary = computed(() => summaryData.value)
  const getSelectedDate = computed(() => selectedDate.value)

  return {
    // State
    summaryData,
    selectedDate,

    // Actions
    setSelectedDate,
    loadDataForDate,

    // Getters
    getCurrentSummary,
    getSelectedDate
  }
}) 