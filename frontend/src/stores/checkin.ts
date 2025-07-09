// src/stores/checkin.ts - Enhanced version following chat.ts store patterns
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { useAuthStore } from './auth'
import { useChildrenStore } from './children'

// TypeScript Interfaces (keeping your existing ones)
export interface SymptomsData {
  symptoms: string[]
  photo: File | null
  otherSymptom?: string
  notes: string
}

export interface SymptomType {
  id: number
  value: string
  label: string
  icon?: string
}

export interface PoopData {
  color: string
  texture: string
  notes: string
}

export interface SleepData {
  bedTime: string
  awakeTime: string
  notes: string
}

export interface MealData {
  mealTime: string
  consumptionLevel: string
  mealCategory: string
  subCategory: string
  customMeal: string
  notes: string
}

export interface GrowthData {
  weight: string
  height: string
  headCircumference: string
  notes: string
}

export interface CheckinEntry {
  id: number
  timestamp: string
  childId?: number
  serverSaved?: boolean
  serverId?: number
}

export interface SymptomsEntry extends CheckinEntry, SymptomsData {}
export interface PoopEntry extends CheckinEntry, PoopData {}
export interface SleepEntry extends CheckinEntry, SleepData {}
export interface MealEntry extends CheckinEntry, MealData {}
export interface GrowthEntry extends CheckinEntry, GrowthData {}

interface CheckinState {
  symptomsData: SymptomsData
  poopData: PoopData
  sleepData: SleepData
  mealData: MealData
  growthData: GrowthData
  history: {
    symptoms: SymptomsEntry[]
    poop: PoopEntry[]
    sleep: SleepEntry[]
    meal: MealEntry[]
    growth: GrowthEntry[]
  }
}

export const useCheckinStore = defineStore('checkin', () => {
  const authStore = useAuthStore()

  // State (keeping your existing structure)
  const symptomsData = ref<SymptomsData>({
    symptoms: [],
    photo: null,
    otherSymptom: '',
    notes: '',
  })

  const poopData = ref<PoopData>({
    color: '',
    texture: '',
    notes: '',
  })

  const sleepData = ref<SleepData>({
    bedTime: '',
    awakeTime: '',
    notes: '',
  })

  const mealData = ref<MealData>({
    mealTime: '',
    consumptionLevel: '',
    mealCategory: '',
    subCategory: '',
    customMeal: '',
    notes: '',
  })

  const growthData = ref<GrowthData>({
    weight: '',
    height: '',
    headCircumference: '',
    notes: '',
  })

  const history = ref<{
    symptoms: SymptomsEntry[]
    poop: PoopEntry[]
    sleep: SleepEntry[]
    meal: MealEntry[]
    growth: GrowthEntry[]
  }>({
    symptoms: [],
    poop: [],
    sleep: [],
    meal: [],
    growth: [],
  })

  // State for backend integration (following chat.ts patterns)
  const isLoading = ref<boolean>(false)
  const isSyncing = ref<boolean>(false)
  const error = ref<string | null>(null)
  const lastSyncTime = ref<string | null>(null)

  // Computed properties (keeping your existing ones)
  const latestSymptoms = computed((): SymptomsEntry | null => history.value.symptoms[0] || null)
  const latestPoop = computed((): PoopEntry | null => history.value.poop[0] || null)
  const latestSleep = computed((): SleepEntry | null => history.value.sleep[0] || null)
  const latestMeal = computed((): MealEntry | null => history.value.meal[0] || null)
  const latestGrowth = computed((): GrowthEntry | null => history.value.growth[0] || null)

  const todaysEntries = computed(() => {
    const today = new Date().toDateString()
    return {
      symptoms: history.value.symptoms.filter(entry =>
        new Date(entry.timestamp).toDateString() === today
      ),
      poop: history.value.poop.filter(entry =>
        new Date(entry.timestamp).toDateString() === today
      ),
      sleep: history.value.sleep.filter(entry =>
        new Date(entry.timestamp).toDateString() === today
      ),
      meal: history.value.meal.filter(entry =>
        new Date(entry.timestamp).toDateString() === today
      ),
      growth: history.value.growth.filter(entry =>
        new Date(entry.timestamp).toDateString() === today
      ),
    }
  })

  const totalCounts = computed(() => ({
    symptoms: history.value.symptoms.length,
    poop: history.value.poop.length,
    sleep: history.value.sleep.length,
    meal: history.value.meal.length,
    growth: history.value.growth.length,
  }))

  const unsyncedEntries = computed(() => {
    const allEntries = [
      ...history.value.symptoms,
      ...history.value.poop,
      ...history.value.sleep,
      ...history.value.meal,
      ...history.value.growth,
    ]
    return allEntries.filter(entry => !entry.serverSaved)
  })

  // Helper functions (following chat.ts patterns)
  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const getApiUrl = (endpoint: string): string => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    return `${baseUrl}${endpoint}`
  }

  const makeApiCall = async <T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    const authHeaders = authStore.getAuthHeaders()
    // Filter out undefined values from auth headers
    const cleanAuthHeaders = Object.fromEntries(
      Object.entries(authHeaders).filter(([_, value]) => value !== undefined)
    )
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...cleanAuthHeaders,
      ...(options.headers as Record<string, string> || {})
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }


  //SAVE SYMPTOM
   // Save Symptom using POST /symptom/ (NEW IMPLEMENTATION)
  const saveSymptomsToBackend = async (data: SymptomsData): Promise<{ success: boolean; id?: number }> => {
    if (!authStore.isAuthenticated) {
      setError('User not authenticated')
      return { success: false }
    }

    const childrenStore = useChildrenStore()
    if (!childrenStore.currentChild) {
      setError('No child selected')
      return { success: false }
    }

    try {
      clearError()

      // Handle photo upload if present
      let photoUrl = ''
      if (data.photo) {
        photoUrl = await uploadPhotoToCloud(data.photo)
      }

      // Prepare symptoms string
      let symptomString = data.symptoms.join(', ')
      
      // Add other symptom if specified
      if (data.symptoms.includes('other') && data.otherSymptom) {
        // Replace 'other' with the actual description
        symptomString = symptomString.replace('other', data.otherSymptom)
      }

      const payload = {
        child_id: childrenStore.currentChild.id,
        check_in: new Date().toISOString(),
        symptom: symptomString, // Combined symptoms string
        photo_url: photoUrl || '', // Empty string if no photo
        note: data.notes || null, // Note can be null
      }

      console.log('📦 Symptom payload:', payload)

      const result = await makeApiCall<any>(
        getApiUrl('/symptom/'),
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )

      console.log('✅ Symptom saved to backend:', result)
      return { success: true, id: result.id }

    } catch (err) {
      console.error('❌ Symptom save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save symptom data')
      return { success: false }
    }
  }


  // Save Growth using POST /growth (following chat.ts patterns)
  const saveGrowthToBackend = async (data: GrowthData): Promise<{ success: boolean; id?: number }> => {
    if (!authStore.isAuthenticated) {
      setError('User not authenticated')
      return { success: false }
    }

    const childrenStore = useChildrenStore()
    if (!childrenStore.currentChild) {
      setError('No child selected')
      return { success: false }
    }

    try {
      clearError()

      const payload = {
        child_id: childrenStore.currentChild.id,
        weight: parseFloat(data.weight),
        height: parseFloat(data.height),
        head_circumference: parseFloat(data.headCircumference),
        check_in: new Date().toISOString(),
        note: data.notes || null, // 'note' not 'notes'
      }

      console.log('📦 Growth payload:', payload)

      const result = await makeApiCall<any>(
        getApiUrl('/growth'),
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )

      console.log('✅ Growth saved to backend:', result)
      return { success: true, id: result.id }

    } catch (err) {
      console.error('❌ Growth save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save growth data')
      return { success: false }
    }
  }

  // Save Meal using POST /meal/ (following chat.ts patterns)
  const saveMealToBackend = async (data: MealData): Promise<{ success: boolean; id?: number }> => {
    if (!authStore.isAuthenticated) {
      setError('User not authenticated')
      return { success: false }
    }

    const childrenStore = useChildrenStore()
    if (!childrenStore.currentChild) {
      setError('No child selected')
      return { success: false }
    }

    try {
      clearError()

      // Need to get the actual IDs from the lookup data
      const { useLookupData } = await import('@/composables/useLookupData')
      const { 
        mealTimeCategories, 
        mealCategories, 
        fetchMealTimeCategories, 
        fetchMealCategories 
      } = useLookupData()

      // Ensure lookup data is loaded
      if (mealTimeCategories.value.length === 0) {
        await fetchMealTimeCategories()
      }
      if (mealCategories.value.length === 0) {
        await fetchMealCategories()
      }

      console.log('🔍 Lookup data loaded:', {
        mealTimeCategories: mealTimeCategories.value,
        mealCategories: mealCategories.value,
        searchingForMealTime: data.mealTime,
        searchingForCategory: data.mealCategory
      })

      // Find the IDs for the selected values using the 'value' field from your transformer
      const mealTimeId = mealTimeCategories.value.find(item => item.value === data.mealTime)?.id
      const mealCategoryId = mealCategories.value.find(item => item.value === data.mealCategory)?.id

      console.log('🔍 ID lookup results:', {
        mealTimeId,
        mealCategoryId,
        searchTerms: { mealTime: data.mealTime, mealCategory: data.mealCategory }
      })

      // If we can't find IDs, there might be a mismatch between frontend values and database values
      if (!mealTimeId) {
        console.warn('⚠️ Could not find meal time ID for:', data.mealTime)
        console.log('Available meal times:', mealTimeCategories.value.map(item => item.value))
      }
      if (!mealCategoryId) {
        console.warn('⚠️ Could not find meal category ID for:', data.mealCategory)
        console.log('Available meal categories:', mealCategories.value.map(item => item.value))
      }

      const payload = {
        child_id: childrenStore.currentChild.id,
        meal_time_category: mealTimeId || null,
        consumption_level: parseFloat(data.consumptionLevel), // DB expects double precision
        meal_category: mealCategoryId || null,
        others: data.mealCategory === 'others' ? data.customMeal : null, // 'others' field for custom meals
        check_in: new Date().toISOString(),
        note: data.notes || null, // 'note' not 'notes'
      }

      console.log('📦 Meal payload:', payload)

      const result = await makeApiCall<any>(
        getApiUrl('/meal/'),
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )

      console.log('✅ Meal saved to backend:', result)
      return { success: true, id: result.id }

    } catch (err) {
      console.error('❌ Meal save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save meal data')
      return { success: false }
    }
  }

  // Save Poop using POST /poop/ (following chat.ts patterns)
const savePoopToBackend = async (data: PoopData): Promise<{ success: boolean; id?: number }> => {
    if (!authStore.isAuthenticated) {
      setError('User not authenticated')
      return { success: false }
    }

    const childrenStore = useChildrenStore()
    if (!childrenStore.currentChild) {
      setError('No child selected')
      return { success: false }
    }

    try {
      clearError()

      // Need to get the actual IDs from the lookup data
      const { useLookupData } = await import('@/composables/useLookupData')
      const { 
    poopColors, 
    poopTextures, 
    fetchPoopColors, 
    fetchPoopTextures 
  } = useLookupData()

  console.log('🔍 Debugging savePoopToBackend:')
  console.log('poopColors:', poopColors)
  console.log('poopTextures:', poopTextures)
  console.log('fetchPoopColors:', fetchPoopColors)
  console.log('fetchPoopTextures:', fetchPoopTextures)

 if (!poopColors) {
    console.error('❌ poopColors is undefined!')
    throw new Error('poopColors is undefined')
  }
  if (!poopTextures) {
    console.error('❌ poopTextures is undefined!')
    throw new Error('poopTextures is undefined')
  }

  console.log('✅ Both poopColors and poopTextures are defined')

  // Now try accessing .value
  console.log('🔍 About to access poopColors.value...')
  console.log('poopColors.value:', poopColors.value)
  
  console.log('🔍 About to access poopTextures.value...')
  console.log('poopTextures.value:', poopTextures.value)

      // Ensure lookup data is loaded
      if (poopColors.value.length === 0) {
        await fetchPoopColors()
      }
      if (poopTextures.value.length === 0) {
        await fetchPoopTextures()
      }

      // Find the IDs for the selected values
      const colorId = poopColors.value.find(item => item.value === data.color)?.id || null
      const textureId = poopTextures.value.find(item => item.value === data.texture)?.id || null

      const payload = {
        child_id: childrenStore.currentChild.id,
        color: colorId, // Foreign key to poop_color table
        texture: textureId, // Foreign key to poop_texture table
        check_in: new Date().toISOString(),
        note: data.notes || '', // Note is NOT NULL in your schema
      }

      console.log('📦 Poop payload:', payload)

      const result = await makeApiCall<any>(
        getApiUrl('/poop/'),
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )

      console.log('✅ Poop saved to backend:', result)
      return { success: true, id: result.id }

    } catch (err) {
      console.error('❌ Poop save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save poop data')
      return { success: false }
    }
  }

  // Save Sleep using POST /sleeptime/ (following chat.ts patterns)
  const saveSleepToBackend = async (data: SleepData): Promise<{ success: boolean; id?: number }> => {
    if (!authStore.isAuthenticated) {
      setError('User not authenticated')
      return { success: false }
    }

    const childrenStore = useChildrenStore()
    if (!childrenStore.currentChild) {
      setError('No child selected')
      return { success: false }
    }

    try {
      clearError()

      // Convert time strings to full timestamps
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const startTime = `${today}T${data.bedTime}:00.000Z`
      const endTime = `${today}T${data.awakeTime}:00.000Z`

      const payload = {
        child_id: childrenStore.currentChild.id,
        start_time: startTime, // Your DB uses start_time/end_time, not bed_time/awake_time
        end_time: endTime,
        check_in: new Date().toISOString(),
        note: data.notes || null, // 'note' not 'notes'
      }

      console.log('📦 Sleep payload:', payload)

      const result = await makeApiCall<any>(
        getApiUrl('/sleeptime/'),
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )

      console.log('✅ Sleep saved to backend:', result)
      return { success: true, id: result.id }

    } catch (err) {
      console.error('❌ Sleep save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save sleep data')
      return { success: false }
    }
  }

  
  //saveSymptom
  // Save symptoms (NEW IMPLEMENTATION)
  const saveSymptoms = async (data: SymptomsData): Promise<SymptomsEntry> => {
    isLoading.value = true

    const entry: SymptomsEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      childId: useChildrenStore().currentChild?.id,
      serverSaved: false,
      ...data,
    }

    try {
      history.value.symptoms.unshift(entry)
      clearSymptomsForm()

      const backendResult = await saveSymptomsToBackend(data)
      
      if (backendResult.success) {
        entry.serverSaved = true
        entry.serverId = backendResult.id
      }

      console.log('✅ Symptoms data saved:', entry)
      return entry

    } catch (err) {
      console.error('❌ Error saving symptoms data:', err)
      return entry
    } finally {
      isLoading.value = false
    }
  }
 

 

  const savePoop = async (data: PoopData): Promise<PoopEntry> => {
    isLoading.value = true

    const entry: PoopEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      childId: useChildrenStore().currentChild?.id,
      serverSaved: false,
      ...data,
    }

    try {
      history.value.poop.unshift(entry)
      clearPoopForm()

      const backendResult = await savePoopToBackend(data)
      
      if (backendResult.success) {
        entry.serverSaved = true
        entry.serverId = backendResult.id
      }

      console.log('✅ Poop data saved:', entry)
      return entry

    } catch (err) {
      console.error('❌ Error saving poop data:', err)
      return entry
    } finally {
      isLoading.value = false
    }
  }

  const saveSleep = async (data: SleepData): Promise<SleepEntry> => {
    isLoading.value = true

    const entry: SleepEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      childId: useChildrenStore().currentChild?.id,
      serverSaved: false,
      ...data,
    }

    try {
      history.value.sleep.unshift(entry)
      clearSleepForm()

      const backendResult = await saveSleepToBackend(data)
      
      if (backendResult.success) {
        entry.serverSaved = true
        entry.serverId = backendResult.id
      }

      console.log('✅ Sleep data saved:', entry)
      return entry

    } catch (err) {
      console.error('❌ Error saving sleep data:', err)
      return entry
    } finally {
      isLoading.value = false
    }
  }

  

  const saveMeal = async (data: MealData): Promise<MealEntry> => {
    isLoading.value = true

    const entry: MealEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      childId: useChildrenStore().currentChild?.id,
      serverSaved: false,
      ...data,
    }

    try {
      history.value.meal.unshift(entry)
      clearMealForm()

      const backendResult = await saveMealToBackend(data)
      
      if (backendResult.success) {
        entry.serverSaved = true
        entry.serverId = backendResult.id
      }

      console.log('✅ Meal data saved:', entry)
      return entry

    } catch (err) {
      console.error('❌ Error saving meal data:', err)
      return entry
    } finally {
      isLoading.value = false
    }
  }

  const saveGrowth = async (data: GrowthData): Promise<GrowthEntry> => {
    isLoading.value = true

    const entry: GrowthEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      childId: useChildrenStore().currentChild?.id,
      serverSaved: false,
      ...data,
    }

    try {
      history.value.growth.unshift(entry)
      clearGrowthForm()

      const backendResult = await saveGrowthToBackend(data)
      
      if (backendResult.success) {
        entry.serverSaved = true
        entry.serverId = backendResult.id
        
        // Update children store with latest growth data
        const childrenStore = useChildrenStore()
        childrenStore.updateChildGrowth(
          childrenStore.currentChild.id,
          parseFloat(data.height),
          parseFloat(data.weight),
          parseFloat(data.headCircumference)
        )
      }

      console.log('✅ Growth data saved:', entry)
      return entry

    } catch (err) {
      console.error('❌ Error saving growth data:', err)
      return entry
    } finally {
      isLoading.value = false
    }
  }

   //save symptom to backend
  



  // Clear form methods (keeping your existing ones)
  const clearSymptomsForm = (): void => {
    symptomsData.value = {
      symptoms: [],
      photo: null,
      otherSymptom: '',
      notes: '',
    }
  }

  const clearPoopForm = (): void => {
    poopData.value = {
      color: '',
      texture: '',
      notes: '',
    }
  }

  const clearSleepForm = (): void => {
    sleepData.value = {
      bedTime: '',
      awakeTime: '',
      notes: '',
    }
  }

  const clearMealForm = (): void => {
    mealData.value = {
      mealTime: '',
      consumptionLevel: '',
      mealCategory: '',
      subCategory: '',
      customMeal: '',
      notes: '',
    }
  }

  const clearGrowthForm = (): void => {

    growthData.value = {
      weight: '',
      height: '',
      headCircumference: '',
      notes: '',
    }
  }

  // Delete entry methods (keeping your existing ones)
  const deleteEntry = (type: 'symptoms' | 'poop' | 'sleep' | 'meal' | 'growth', id: number): boolean => {
    const index = history.value[type].findIndex(entry => entry.id === id)
    if (index > -1) {
      history.value[type].splice(index, 1)
      console.log(`✅ Deleted ${type} entry:`, id)
      return true
    }
    return false
  }

  // Clear history methods (keeping your existing ones)
  const clearAllHistory = (): void => {
    history.value = {
      symptoms: [],
      poop: [],
      sleep: [],
      meal: [],
      growth: [],
    }
    console.log('✅ All history cleared')
  }

  const clearTodaysEntries = (): void => {
    const today = new Date().toDateString()

    Object.keys(history.value).forEach(key => {
      const historyKey = key as keyof typeof history.value
      history.value[historyKey] = history.value[historyKey].filter(entry =>
        new Date(entry.timestamp).toDateString() !== today
      )
    })

    console.log('✅ Today\'s entries cleared')
  }

  // Export/Import methods (keeping your existing ones)
  const exportData = (): string => {
    return JSON.stringify({
      history: history.value,
      exportDate: new Date().toISOString(),
    }, null, 2)
  }

  const importData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData)
      if (data.history) {
        history.value = data.history
        console.log('✅ Data imported successfully')
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Failed to import data:', error)
      return false
    }
  }

  return {
    // State
    symptomsData: readonly(symptomsData),
    poopData: readonly(poopData),
    sleepData: readonly(sleepData),
    mealData: readonly(mealData),
    growthData: readonly(growthData),
    history: readonly(history),
    isLoading: readonly(isLoading),
    isSyncing: readonly(isSyncing),
    error: readonly(error),
    lastSyncTime: readonly(lastSyncTime),

    // Computed
    latestSymptoms,
    latestPoop,
    latestSleep,
    latestMeal,
    latestGrowth,
    todaysEntries,
    totalCounts,
    unsyncedEntries,

    // Actions
    saveSymptoms, 
    savePoop,
    saveSleep,
    saveMeal,
    saveGrowth,
    clearSymptomsForm,
    clearPoopForm,
    clearSleepForm,
    clearMealForm,
    clearGrowthForm,
    deleteEntry,
    clearAllHistory,
    clearTodaysEntries,
    exportData,
    importData,
    setError,
    clearError,
    
  }
})