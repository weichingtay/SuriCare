import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

export interface SleepData {
  nightHours: number
  napHours: number
  wakeCount: number
  lastUpdated: string
}

interface SleepByDate {
  [date: string]: SleepData
}

interface SleepStore {
  sleepByDate: Ref<SleepByDate>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  getSleepForDate: ComputedRef<(date: string) => SleepData>
  fetchSleepForDate: (date: string) => Promise<void>
  updateSleepForDate: (date: string, sleepData: SleepData) => Promise<void>
}

export const useSleepStore = defineStore('sleep', (): SleepStore => {
  // State
  const sleepByDate = ref<SleepByDate>({})
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // HACK: This will eventually be connected to our database
  // Mock data generator for development
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateMockSleepData = (date: string): SleepData => ({
    nightHours: Math.floor(Math.random() * 4) + 5, // 5-8 hours
    napHours: Math.floor(Math.random() * 3) + 2, // 2-4 hours
    wakeCount: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0, // 30% chance of wake-ups
    lastUpdated: new Date().toISOString(),
  })

  // Getters
  const getSleepForDate = computed(() => (date: string): SleepData => {
    return sleepByDate.value[date] || generateMockSleepData(date)
  })

  // Actions
  const fetchSleepForDate = async (date: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const response = await axios.get<SleepData>(`/api/sleep/${date}`)
      // sleepByDate.value[date] = response.data

      // Using mock data for now
      sleepByDate.value[date] = generateMockSleepData(date)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error fetching sleep data:', err)
    } finally {
      isLoading.value = false
    }
  }

  const updateSleepForDate = async (date: string, sleepData: SleepData): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // await axios.put<SleepData>(`/api/sleep/${date}`, sleepData)
      // sleepByDate.value[date] = sleepData

      // Using mock data for now
      sleepByDate.value[date] = sleepData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error updating sleep data:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    sleepByDate,
    isLoading,
    error,
    getSleepForDate,
    fetchSleepForDate,
    updateSleepForDate,
  }
})
