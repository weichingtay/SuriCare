import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import axios from 'axios'
import { useChildrenStore } from './children'

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

interface MealsByDateCache {
  [dateKey: string]: MealsData
}

interface MealsStoreInterface {
  mealsCache: Ref<MealsByDateCache>
  loadingState: Ref<boolean>
  errorMessage: Ref<string | null>
  getMealsForDate: ComputedRef<(date: string | Date) => MealsData>
  fetchMealsForDate: (date: string) => Promise<void>
  updateMealsForDate: (date: string, mealsData: MealsData) => Promise<void>
  getMealCount: ComputedRef<(date: string | Date) => number | string>
}

export const useMealsStore = defineStore('meals', (): MealsStoreInterface => {
  // State variables
  const mealsCache = ref<MealsByDateCache>({})
  const loadingState = ref<boolean>(false)
  const errorMessage = ref<string | null>(null)

  // Utility: Convert Date to YYYY-MM-DD string
  const dateToString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Utility: Convert timestamp to YYYY-MM-DD string (handles both seconds and milliseconds)
  const timestampToDateString = (timestamp: number): string => {
    // If timestamp is in seconds (< 10 digits), convert to milliseconds
    const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp
    
    // Create date and convert to your local timezone (China Standard Time)
    const date = new Date(ms)
    
    // Get the date in your local timezone (GMT+8)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }

  // Utility: Map meal time category ID to name
  const getMealTimeName = (categoryId: number): string => {
    const mapping: { [key: number]: string } = {
      1: 'breakfast',
      2: 'lunch',
      3: 'dinner'
    }
    return mapping[categoryId] || 'unknown'
  }

  // Process meal data into percentages
  const processMealPercentages = (meals: any[]): MealPercentages => {
    console.log(`🔄 Processing ${meals.length} meals...`)
    
    const percentages = { breakfast: 0, lunch: 0, dinner: 0 }
    
    meals.forEach((meal, index) => {
      const timeName = getMealTimeName(meal.meal_time_category)
      const consumption = meal.consumption_level || 0 // Convert 0.75 → 75
      
      console.log(`  📋 Meal ${index + 1}: ${timeName} = ${consumption}%`)
      
      if (timeName === 'breakfast') percentages.breakfast = Math.max(percentages.breakfast, consumption)
      else if (timeName === 'lunch') percentages.lunch = Math.max(percentages.lunch, consumption)
      else if (timeName === 'dinner') percentages.dinner = Math.max(percentages.dinner, consumption)
    })
    
    console.log(`🎯 Final percentages:`, percentages)
    return percentages
  }

  // Extract meal information (refused items, preferences)
  const extractMealInfo = (meals: any[]): { refusedItems: string[], preferences: string[] } => {
    const refusedItems: string[] = []
    const preferences: string[] = []
    
    meals.forEach(meal => {
      const consumption = (meal.consumption_level || 0) * 100
      
      if (consumption === 0 && meal.note) {
        refusedItems.push(meal.note)
      }
      
      if (consumption >= 75) {
        // Could add meal category preferences here if needed
      }
    })
    
    return { 
      refusedItems: [...new Set(refusedItems)], 
      preferences: [...new Set(preferences)] 
    }
  }

  // Main fetch function
  const fetchMealsForDate = async (targetDate: string): Promise<void> => {
    console.log(`🚀 Fetching meals for date: ${targetDate}`)
    
    // Don't fetch if already cached
    if (mealsCache.value[targetDate]) {
      console.log(`📋 Already cached for ${targetDate}`)
      return
    }

    loadingState.value = true
    errorMessage.value = null

    try {
      const childrenStore = useChildrenStore()
      
      if (!childrenStore.currentChild) {
        console.warn('⚠️ No current child selected')
        return
      }

      console.log(`🌐 Calling API for child ${childrenStore.currentChild.id}`)
      
      // Fetch all meals for the child
const response = await axios.get(`http://127.0.0.1:8000/meal/child/${childrenStore.currentChild.id}?days=60`)
      const allMeals = response.data || []
      
      console.log(`📊 API returned ${allMeals.length} total meals`)
      
      // Debug: Show sample of meal dates
      const sampleMeals = allMeals.slice(0, 3).map((meal: any) => ({
        id: meal.id,
        check_in: meal.check_in,
        converted_date: timestampToDateString(meal.check_in)
      }))
      console.log(`🔍 Sample meal dates:`, sampleMeals)
      
      // Filter meals for target date
      const mealsForDate = allMeals.filter((meal: any) => {
        const mealDate = timestampToDateString(meal.check_in)
        const matches = mealDate === targetDate
        
        if (!matches) {
          console.log(`❌ Meal ${meal.id}: ${meal.check_in} → ${mealDate} ≠ ${targetDate}`)
        } else {
          console.log(`✅ Meal ${meal.id}: ${meal.check_in} → ${mealDate} = ${targetDate}`)
        }
        
        return matches
      })

      console.log(`📅 Found ${mealsForDate.length} meals for ${targetDate}`)

      // Process the data
      const percentages = processMealPercentages(mealsForDate)
      const { refusedItems, preferences } = extractMealInfo(mealsForDate)

      // Cache the result
      mealsCache.value[targetDate] = {
        percentages,
        refusedItems,
        preferences
      }

      console.log(`✅ Cached data for ${targetDate}:`, mealsCache.value[targetDate])
      
      // Force reactivity update
      mealsCache.value = { ...mealsCache.value }

    } catch (error) {
      console.error(`❌ Error fetching meals:`, error)
      errorMessage.value = error instanceof Error ? error.message : 'Unknown error'
      
      // Set empty data on error
      mealsCache.value[targetDate] = {
        percentages: { breakfast: 0, lunch: 0, dinner: 0 },
        refusedItems: [],
        preferences: []
      }
    } finally {
      loadingState.value = false
    }
  }

  // Get meals for a specific date
  const getMealsForDate = computed(() => (dateInput: string | Date): MealsData => {
    const dateString = dateInput instanceof Date ? dateToString(dateInput) : dateInput
    
    console.log(`🔍 Getting meals for ${dateString}`)
    console.log(`🗂️ Available cached dates:`, Object.keys(mealsCache.value))
    
    // Check if we have cached data
    const cachedData = mealsCache.value[dateString]
    
    if (!cachedData) {
      console.log(`📥 Not cached, triggering fetch for ${dateString}`)
      
      // Trigger fetch but don't await it
      fetchMealsForDate(dateString).then(() => {
        console.log(`🔄 Fetch completed for ${dateString}, data should now be available`)
      })
      
      // Return empty data while loading
      return {
        percentages: { breakfast: 0, lunch: 0, dinner: 0 },
        refusedItems: [],
        preferences: []
      }
    }
    
    console.log(`📤 Returning cached data for ${dateString}:`, cachedData)
    return cachedData
  })

  // Get meal count for a date
  const getMealCount = computed(() => (dateInput: string | Date): number | string => {
    const meals = getMealsForDate.value(dateInput)
    const mealCount = Object.values(meals.percentages).filter(p => p > 0).length
    
    // Return dash if no meals have data
    if (mealCount === 0) {
      return '-'
    }
    
    return mealCount
  })

  // Update meals for a date
  const updateMealsForDate = async (date: string, mealsData: MealsData): Promise<void> => {
    mealsCache.value[date] = mealsData
  }

  return {
    mealsCache,
    loadingState,
    errorMessage,
    getMealsForDate,
    fetchMealsForDate,
    updateMealsForDate,
    getMealCount,
  }
})