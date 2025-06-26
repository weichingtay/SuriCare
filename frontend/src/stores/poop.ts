import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

export interface PoopData {
  count: number
  unusual: number
  normal: number
  lastUpdated: string
}

interface PoopByDate {
  [date: string]: PoopData
}

interface PoopStore {
  poopByDate: Ref<PoopByDate>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  getPoopForDate: ComputedRef<(date: string) => PoopData>
  fetchPoopForDate: (date: string) => Promise<void>
  updatePoopForDate: (date: string, poopData: PoopData) => Promise<void>
}

export const usePoopStore = defineStore('poop', (): PoopStore => {
  // State
  const poopByDate = ref<PoopByDate>({})
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // HACK: This will eventually be connected to our database
  // Mock data generator for development
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateMockPoopData = (date: string): PoopData => ({
    count: Math.floor(Math.random() * 4) + 1, // 1-4 times
    unusual: Math.random() > 0.7 ? 1 : 0, // 30% chance of unusual
    normal: Math.floor(Math.random() * 3) + 1, // 1-3 normal
    lastUpdated: new Date().toISOString(),
  })

  // Getters
  const getPoopForDate = computed(() => (date: string): PoopData => {
    return poopByDate.value[date] || generateMockPoopData(date)
  })

  // Actions
  const fetchPoopForDate = async (date: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const response = await axios.get<PoopData>(`/api/poop/${date}`)
      // poopByDate.value[date] = response.data

      // Using mock data for now
      poopByDate.value[date] = generateMockPoopData(date)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error fetching poop data:', err)
    } finally {
      isLoading.value = false
    }
  }

  const updatePoopForDate = async (date: string, poopData: PoopData): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // await axios.put<PoopData>(`/api/poop/${date}`, poopData)
      // poopByDate.value[date] = poopData

      // Using mock data for now
      poopByDate.value[date] = poopData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error updating poop data:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    poopByDate,
    isLoading,
    error,
    getPoopForDate,
    fetchPoopForDate,
    updatePoopForDate,
  }
})
