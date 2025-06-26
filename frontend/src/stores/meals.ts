import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

interface MealPercentages {
  breakfast: number
  lunch: number
  dinner: number
}

export interface MealsData {
  percentages: MealPercentages
  refusedItems: string[]
  preferences: string[]
}

interface MealsByDate {
  [date: string]: MealsData
}

interface MealsStore {
  mealsByDate: Ref<MealsByDate>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  getMealsForDate: ComputedRef<(date: string) => MealsData>
  fetchMealsForDate: (date: string) => Promise<void>
  updateMealsForDate: (date: string, mealsData: MealsData) => Promise<void>
  getMealCount: ComputedRef<(date: string) => number>
}

export const useMealsStore = defineStore('meals', (): MealsStore => {
  // State
  const mealsByDate = ref<MealsByDate>({})
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Mock data generator for development
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateMockMealsData = (date: string): MealsData => ({
    percentages: {
      breakfast: Math.floor(Math.random() * 100),
      lunch: Math.floor(Math.random() * 100),
      dinner: Math.floor(Math.random() * 100),
    },
    refusedItems: Math.random() > 0.7 ? ['yogurt', 'vegetables', 'chicken'] : [],
    preferences: ['noodles', 'rice', 'chicken'],
  })

  // Getters
  const getMealsForDate = computed(() => (date: string): MealsData => {
    return mealsByDate.value[date] || generateMockMealsData(date)
  })

  // Add a computed property for meal count
  const getMealCount = computed(() => (date: string): number => {
    const meals = getMealsForDate.value(date)
    return Object.values(meals.percentages).filter(p => p > 0).length
  })

  // Actions
  const fetchMealsForDate = async (date: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const response = await axios.get<MealsData>(`/api/meals/${date}`)
      // mealsByDate.value[date] = response.data

      // Using mock data for now
      mealsByDate.value[date] = generateMockMealsData(date)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error fetching meals:', err)
    } finally {
      isLoading.value = false
    }
  }

  const updateMealsForDate = async (date: string, mealsData: MealsData): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // await axios.put<MealsData>(`/api/meals/${date}`, mealsData)
      // mealsByDate.value[date] = mealsData

      // Using mock data for now
      mealsByDate.value[date] = mealsData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error updating meals:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    mealsByDate,
    isLoading,
    error,
    getMealsForDate,
    fetchMealsForDate,
    updateMealsForDate,
    getMealCount,
  }
})
