import { computed, ref } from 'vue'
import { supabase } from '@/plugins/supabase'

// Types for all lookup data
export interface LookupOption {
  id: number
  value: string
  label: string
  icon?: string
  percentage?: number
}

export interface MealCategory extends LookupOption {
  category: string
}

export interface MealTimeCategory extends LookupOption {
  time_category: string
}

export interface PoopColor extends LookupOption {
  category: string
}

export interface PoopConsistency extends LookupOption {
  category: string
}

export interface SymptomType extends LookupOption {
  icon: string
}

export interface ConsumptionLevel extends LookupOption {
  percentage: number
}

export interface GenderOption extends LookupOption {}
export interface RelationshipType extends LookupOption {}
export interface AccessLevel extends LookupOption {}

// Cache for lookup data
const lookupCache = ref<{
  mealCategories: MealCategory[]
  mealTimeCategories: MealTimeCategory[]
  poopColors: PoopColor[]
  poopConsistencies: PoopConsistency[]
  genderOptions: GenderOption[]
  relationshipTypes: RelationshipType[]
  symptomTypes: SymptomType[]
  accessLevels: AccessLevel[]
  consumptionLevels: ConsumptionLevel[]
}>({
  mealCategories: [],
  mealTimeCategories: [],
  poopColors: [],
  poopConsistencies: [],
  genderOptions: [],
  relationshipTypes: [],
  symptomTypes: [],
  accessLevels: [],
  consumptionLevels: [],
})

// Loading states for each lookup type
const loadingStates = ref<{
  [key: string]: boolean
}>({})

// Error states for each lookup type
const errorStates = ref<{
  [key: string]: string | null
}>({})

// Generic function to fetch lookup data
async function fetchLookupData<T> (
  tableName: string,
  cacheKey: keyof typeof lookupCache.value,
  transformer?: (data: unknown[]) => T[]
): Promise<T[]> {
  // Return cached data if available
  if (lookupCache.value[cacheKey].length > 0) {
    return lookupCache.value[cacheKey] as T[]
  }

  // Set loading state
  loadingStates.value[cacheKey] = true
  errorStates.value[cacheKey] = null

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('id')

    if (error) {
      throw new Error(`Failed to fetch ${tableName}: ${error.message}`)
    }

    // Transform data if transformer provided, otherwise use default transformation
    const transformedData = transformer ? transformer(data || []) : transformDefault(data || [])

    // Cache the results
    ;(lookupCache.value[cacheKey] as unknown[]) = transformedData

    return transformedData as T[]
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    errorStates.value[cacheKey] = errorMessage
    console.error(`Error fetching ${tableName}:`, errorMessage)

    // Return empty array on error
    return []
  } finally {
    loadingStates.value[cacheKey] = false
  }
}

// Default transformer for lookup data
function transformDefault (data: unknown[]): LookupOption[] {
  return data.map(item => ({
    id: item.id,
    value: item.value || item.category || item.time_category,
    label: item.label || item.category || item.time_category,
    icon: item.icon,
    percentage: item.percentage,
  }))
}

// Specific transformers for different table structures
function transformMealCategories (data: unknown[]): MealCategory[] {
  return data.map(item => ({
    id: item.id,
    value: item.category,
    label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    category: item.category,
  }))
}

function transformMealTimeCategories (data: unknown[]): MealTimeCategory[] {
  return data.map(item => ({
    id: item.id,
    value: item.time_category,
    label: item.time_category.charAt(0).toUpperCase() + item.time_category.slice(1),
    time_category: item.time_category,
  }))
}

function transformPoopColors (data: unknown[]): PoopColor[] {
  return data.map(item => ({
    id: item.id,
    value: item.category,
    label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    category: item.category,
  }))
}

function transformPoopConsistencies (data: unknown[]): PoopConsistency[] {
  return data.map(item => ({
    id: item.id,
    value: item.category,
    label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    category: item.category,
  }))
}

// Main composable
export function useLookupData () {
  // Fetch functions for each lookup type
  const fetchMealCategories = () =>
    fetchLookupData<MealCategory>('meal_category', 'mealCategories', transformMealCategories)

  const fetchMealTimeCategories = () =>
    fetchLookupData<MealTimeCategory>('meal_time_category', 'mealTimeCategories', transformMealTimeCategories)

  const fetchPoopColors = () =>
    fetchLookupData<PoopColor>('poop_color', 'poopColors', transformPoopColors)

  const fetchPoopConsistencies = () =>
    fetchLookupData<PoopConsistency>('poop_consistency', 'poopConsistencies', transformPoopConsistencies)

  const fetchGenderOptions = () =>
    fetchLookupData<GenderOption>('gender_options', 'genderOptions')

  const fetchRelationshipTypes = () =>
    fetchLookupData<RelationshipType>('relationship_types', 'relationshipTypes')

  const fetchSymptomTypes = () =>
    fetchLookupData<SymptomType>('symptom_types', 'symptomTypes')

  const fetchAccessLevels = () =>
    fetchLookupData<AccessLevel>('access_levels', 'accessLevels')

  const fetchConsumptionLevels = () =>
    fetchLookupData<ConsumptionLevel>('consumption_levels', 'consumptionLevels')

  // Computed getters for cached data
  const mealCategories = computed(() => lookupCache.value.mealCategories)
  const mealTimeCategories = computed(() => lookupCache.value.mealTimeCategories)
  const poopColors = computed(() => lookupCache.value.poopColors)
  const poopConsistencies = computed(() => lookupCache.value.poopConsistencies)
  const genderOptions = computed(() => lookupCache.value.genderOptions)
  const relationshipTypes = computed(() => lookupCache.value.relationshipTypes)
  const symptomTypes = computed(() => lookupCache.value.symptomTypes)
  const accessLevels = computed(() => lookupCache.value.accessLevels)
  const consumptionLevels = computed(() => lookupCache.value.consumptionLevels)

  // Loading state getters
  const isLoading = computed(() => (key: string) => loadingStates.value[key] || false)
  const getError = computed(() => (key: string) => errorStates.value[key] || null)

  // Clear cache function (useful for refreshing data)
  const clearCache = (cacheKey?: keyof typeof lookupCache.value) => {
    if (cacheKey) {
      (lookupCache.value[cacheKey] as unknown[]) = []
    } else {
      // Clear all cache
      Object.keys(lookupCache.value).forEach(key => {
        (lookupCache.value[key as keyof typeof lookupCache.value] as unknown[]) = []
      })
    }
  }

  // Preload all lookup data
  const preloadAllLookupData = async () => {
    await Promise.allSettled([
      fetchMealCategories(),
      fetchMealTimeCategories(),
      fetchPoopColors(),
      fetchPoopConsistencies(),
      fetchGenderOptions(),
      fetchRelationshipTypes(),
      fetchSymptomTypes(),
      fetchAccessLevels(),
      fetchConsumptionLevels(),
    ])
  }

  return {
    // Fetch functions
    fetchMealCategories,
    fetchMealTimeCategories,
    fetchPoopColors,
    fetchPoopConsistencies,
    fetchGenderOptions,
    fetchRelationshipTypes,
    fetchSymptomTypes,
    fetchAccessLevels,
    fetchConsumptionLevels,

    // Cached data
    mealCategories,
    mealTimeCategories,
    poopColors,
    poopConsistencies,
    genderOptions,
    relationshipTypes,
    symptomTypes,
    accessLevels,
    consumptionLevels,

    // Utility functions
    isLoading,
    getError,
    clearCache,
    preloadAllLookupData,
  }
}
