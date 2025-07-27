import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import axios from 'axios'
import { useChildrenStore } from './children'
import { timestampToDateString, dateToString } from '@/utils/dateUtils'

interface MealPercentages {
  [mealType: string]: number
}

interface MealStats {
  consumption: number  // Total consumption percentage
  count: number       // Number of meals
  avgConsumption: number  // Average consumption per meal
}

interface MealStatistics {
  [mealType: string]: MealStats
}

export interface MealsData {
  percentages: MealPercentages
  statistics: MealStatistics
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
  invalidateCache: (date?: string) => void
  refreshMealsForDate: (date: string) => Promise<void>
}

export const useMealsStore = defineStore('meals', (): MealsStoreInterface => {
  // State variables
  const mealsCache = ref<MealsByDateCache>({})
  const loadingState = ref<boolean>(false)
  const errorMessage = ref<string | null>(null)

  // Date utilities are now imported from shared utils

  // Dynamic meal time category mapping from database
  let mealTimeCategoryMap: { [key: number]: string } = {}

  // Load meal time categories from database
  const loadMealTimeCategories = async (): Promise<void> => {
    try {
      const { useLookupData } = await import('@/composables/useLookupData')
      const { mealTimeCategories, fetchMealTimeCategories } = useLookupData()

      if (mealTimeCategories.value.length === 0) {
        await fetchMealTimeCategories()
      }

      // Build dynamic mapping from database
      mealTimeCategoryMap = {}
      mealTimeCategories.value.forEach(category => {
        mealTimeCategoryMap[category.id] = category.value
      })

      console.log('🔄 Loaded meal time categories:', mealTimeCategoryMap)
    } catch (error) {
      console.error('Error loading meal time categories:', error)
      // Fallback to hardcoded mapping
      mealTimeCategoryMap = {
        1: 'breakfast',
        2: 'lunch',
        3: 'dinner'
      }
    }
  }

  // Utility: Map meal time category ID to name (now dynamic)
  const getMealTimeName = (categoryId: number): string => {
    return mealTimeCategoryMap[categoryId] || 'unknown'
  }

  // Process meal data into smart statistics
  const processMealData = (meals: any[]): { percentages: MealPercentages, statistics: MealStatistics } => {
    // console.log(`🔄 Processing ${meals.length} meals...`)

    const mealStats: { [key: string]: { total: number, count: number, meals: number[] } } = {}

    meals.forEach((meal, index) => {
      const timeName = getMealTimeName(meal.meal_time_category)
      const consumption = meal.consumption_level || 0

      // console.log(`  📋 Meal ${index + 1}: ${timeName} = ${consumption}%`)

      if (timeName === 'unknown') {
        console.warn(`⚠️ Unknown meal time category: ${meal.meal_time_category}`)
        return
      }

      if (!mealStats[timeName]) {
        mealStats[timeName] = { total: 0, count: 0, meals: [] }
      }

      mealStats[timeName].total += consumption
      mealStats[timeName].count += 1
      mealStats[timeName].meals.push(consumption)
    })

    const percentages: MealPercentages = {}
    const statistics: MealStatistics = {}

    Object.entries(mealStats).forEach(([timeName, stats]) => {
      const avgConsumption = stats.total / stats.count

      // For backward compatibility, use average consumption as the main percentage
      percentages[timeName] = Math.round(avgConsumption)

      // Detailed statistics
      statistics[timeName] = {
        consumption: Math.round(stats.total),
        count: stats.count,
        avgConsumption: Math.round(avgConsumption)
      }

      // console.log(`  🎯 ${timeName}: ${stats.count} meals, avg ${avgConsumption}%, total ${stats.total}%`)
    })

    console.log(`🎯 Final percentages:`, percentages)
    console.log(`📊 Final statistics:`, statistics)

    return { percentages, statistics }
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
    // console.log(`🚀 Fetching meals for date: ${targetDate}`)

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
          // console.log(`❌ Meal ${meal.id}: ${meal.check_in} → ${mealDate} ≠ ${targetDate}`)
        } else {
          // console.log(`✅ Meal ${meal.id}: ${meal.check_in} → ${mealDate} = ${targetDate}`)
        }

        return matches
      })

      // console.log(`📅 Found ${mealsForDate.length} meals for ${targetDate}`)

      // Load meal time categories from database
      await loadMealTimeCategories()

      // Process the data with smart statistics
      const { percentages, statistics } = processMealData(mealsForDate)
      const { refusedItems, preferences } = extractMealInfo(mealsForDate)

      // Cache the result
      mealsCache.value[targetDate] = {
        percentages,
        statistics,
        refusedItems,
        preferences
      }

      // console.log(`✅ Cached data for ${targetDate}:`, mealsCache.value[targetDate])

      // Force reactivity update
      mealsCache.value = { ...mealsCache.value }

    } catch (error) {
      console.error(`❌ Error fetching meals:`, error)
      errorMessage.value = error instanceof Error ? error.message : 'Unknown error'

      // Set empty data on error
      mealsCache.value[targetDate] = {
        percentages: {},
        statistics: {},
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

    // console.log(`🔍 Getting meals for ${dateString}`)
    // console.log(`🗂️ Available cached dates:`, Object.keys(mealsCache.value))

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
        percentages: {},
        statistics: {},
        refusedItems: [],
        preferences: []
      }
    }

    console.log(`📤 Returning cached data for ${dateString}:`, cachedData)
    return cachedData
  })

  // Get meal count for a date (now shows total meal instances, not just meal types)
  const getMealCount = computed(() => (dateInput: string | Date): number | string => {
    const meals = getMealsForDate.value(dateInput)

    // Count total number of meal instances from statistics
    const totalMealCount = Object.values(meals.statistics).reduce((total, stats) => total + stats.count, 0)

    // Return dash if no meals have data
    if (totalMealCount === 0) {
      return '-'
    }

    return totalMealCount
  })

  // Update meals for a date
  const updateMealsForDate = async (date: string, mealsData: MealsData): Promise<void> => {
    mealsCache.value[date] = mealsData
  }

  // Invalidate cache for specific date or all dates
  const invalidateCache = (date?: string) => {
    if (date) {
      delete mealsCache.value[date]
      console.log(`🗑️ Invalidated meals cache for ${date}`)
    } else {
      mealsCache.value = {}
      console.log(`🗑️ Cleared entire meals cache`)
    }
    // Force reactivity update
    mealsCache.value = { ...mealsCache.value }
  }

  // Force refresh for specific date
  const refreshMealsForDate = async (date: string): Promise<void> => {
    console.log(`🔄 Force refreshing meals data for ${date}`)
    invalidateCache(date)
    await fetchMealsForDate(date)
  }

  return {
    mealsCache,
    loadingState,
    errorMessage,
    getMealsForDate,
    fetchMealsForDate,
    updateMealsForDate,
    getMealCount,
    invalidateCache,
    refreshMealsForDate,
  }
})
