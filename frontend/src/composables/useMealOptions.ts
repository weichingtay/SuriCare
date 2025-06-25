import { computed, onMounted } from 'vue'
import { useLookupData } from './useLookupData'

// Fallback data (used if database lookup fails)
const fallbackMealTimeOptions = [
  { id: 1, value: 'breakfast', label: 'Breakfast', icon: 'mdi-weather-sunny' },
  { id: 2, value: 'lunch', label: 'Lunch', icon: 'mdi-white-balance-sunny' },
  { id: 3, value: 'dinner', label: 'Dinner', icon: 'mdi-weather-night' }
]

const fallbackConsumptionOptions = [
  { id: 1, value: '0', label: '0% (Refused)', percentage: 0 },
  { id: 2, value: '25', label: '25% (Partial)', percentage: 25 },
  { id: 3, value: '50', label: '50% (Partial)', percentage: 50 },
  { id: 4, value: '75', label: '75% (Partial)', percentage: 75 },
  { id: 5, value: '100', label: '100% (Full)', percentage: 100 }
]

const fallbackMealCategoryOptions = [
  { id: 1, value: 'milk', label: 'Milk', icon: 'mdi-cup' },
  { id: 2, value: 'solid', label: 'Solid', icon: 'mdi-food-apple' },
  { id: 3, value: 'mixed', label: 'Mixed', icon: 'mdi-bowl-mix' },
  { id: 4, value: 'others', label: 'Others', icon: 'mdi-dots-horizontal' }
]

const fallbackMilkSubCategories = [
  { id: 1, value: 'breast_milk', label: 'Breast Milk' },
  { id: 2, value: 'formula', label: 'Formula' }
]

export function useMealOptions() {
  const {
    fetchMealCategories,
    fetchMealTimeCategories,
    fetchConsumptionLevels,
    mealCategories,
    mealTimeCategories,
    consumptionLevels,
    isLoading,
    getError
  } = useLookupData()

  // Enhanced meal time options with icons
  const mealTimeOptions = computed(() => {
    if (mealTimeCategories.value.length === 0) {
      return fallbackMealTimeOptions
    }

    return mealTimeCategories.value.map(item => ({
      ...item,
      icon: item.value === 'breakfast' ? 'mdi-weather-sunny' :
            item.value === 'lunch' ? 'mdi-white-balance-sunny' :
            item.value === 'dinner' ? 'mdi-weather-night' :
            'mdi-silverware-fork-knife'
    }))
  })

  // Enhanced meal category options with icons
  const mealCategoryOptions = computed(() => {
    if (mealCategories.value.length === 0) {
      return fallbackMealCategoryOptions
    }

    return mealCategories.value.map(item => ({
      ...item,
      icon: item.value === 'milk' ? 'mdi-cup' :
            item.value === 'solid' ? 'mdi-food-apple' :
            item.value === 'mixed' ? 'mdi-bowl-mix' :
            'mdi-dots-horizontal'
    }))
  })

  // Consumption level options
  const consumptionOptions = computed(() => {
    if (consumptionLevels.value.length === 0) {
      return fallbackConsumptionOptions
    }

    return consumptionLevels.value
  })

  // Static milk subcategories (these don't need to be in database)
  const milkSubCategories = computed(() => fallbackMilkSubCategories)

  // Loading states
  const isMealTimeLoading = computed(() => isLoading.value('mealTimeCategories'))
  const isMealCategoryLoading = computed(() => isLoading.value('mealCategories'))
  const isConsumptionLoading = computed(() => isLoading.value('consumptionLevels'))

  // Error states
  const mealTimeError = computed(() => getError.value('mealTimeCategories'))
  const mealCategoryError = computed(() => getError.value('mealCategories'))
  const consumptionError = computed(() => getError.value('consumptionLevels'))

  // Overall loading state
  const isLoadingOptions = computed(() => 
    isMealTimeLoading.value || isMealCategoryLoading.value || isConsumptionLoading.value
  )

  // Load all meal-related lookup data
  const loadMealOptions = async () => {
    await Promise.allSettled([
      fetchMealCategories(),
      fetchMealTimeCategories(),
      fetchConsumptionLevels()
    ])
  }

  // Auto-load on mount
  onMounted(() => {
    loadMealOptions()
  })

  return {
    // Options
    mealTimeOptions,
    mealCategoryOptions,
    consumptionOptions,
    milkSubCategories,
    
    // Loading states
    isMealTimeLoading,
    isMealCategoryLoading,
    isConsumptionLoading,
    isLoading: isLoadingOptions,
    
    // Error states
    mealTimeError,
    mealCategoryError,
    consumptionError,
    
    // Actions
    loadMealOptions
  }
}