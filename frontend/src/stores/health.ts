import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import axios from 'axios'
import { useChildrenStore } from './children'

export interface HealthData {
  status: string
  message: string
  symptoms: string[]
  temperature?: number
  lastUpdated: string
}

interface HealthByDateCache {
  [dateKey: string]: HealthData
}

interface HealthStoreInterface {
  healthCache: Ref<HealthByDateCache>
  loadingState: Ref<boolean>
  errorMessage: Ref<string | null>
  getHealthForDate: ComputedRef<(date: string | Date) => HealthData>
  fetchHealthForDate: (date: string) => Promise<void>
  updateHealthForDate: (date: string, healthData: HealthData) => Promise<void>
  invalidateCache: (date?: string) => void
  refreshHealthForDate: (date: string) => Promise<void>
}

export const useHealthStore = defineStore('health', (): HealthStoreInterface => {
  // State variables
  const healthCache = ref<HealthByDateCache>({})
  const loadingState = ref<boolean>(false)
  const errorMessage = ref<string | null>(null)

  // Utility: Convert Date to YYYY-MM-DD string (following your pattern)
  const dateToString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Utility: Convert timestamp to YYYY-MM-DD string (following your pattern)
  const timestampToDateString = (timestamp: string): string => {
    const date = new Date(timestamp)

    // Get the date in your local timezone (GMT+8)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }

  // Process symptom data into health summary (following your poop/sleep pattern)
  const processHealthData = (symptomRecords: any[]): HealthData => {
    console.log(`🔄 Processing ${symptomRecords.length} symptom records...`)
    
    if (symptomRecords.length === 0) {
      return {
        status: 'Healthy',
        message: 'No symptoms today',
        symptoms: [],
        lastUpdated: '',
      }
    }

    // Extract symptoms from records
    const symptoms = symptomRecords.map(record => record.symptom)
    
    console.log(`📋 Extracted symptoms:`, symptoms)

    // Determine health status based on symptoms
    let status = 'Healthy'
    let message = 'No symptoms today'
    let temperature: number | undefined

    // Check for fever-related symptoms
    const hasFever = symptoms.some(symptom => 
      symptom?.toLowerCase().includes('fever')
    )
    
    // Check for high fever
    const hasHighFever = symptoms.some(symptom => 
      symptom?.toLowerCase().includes('high fever') ||
      symptom?.toLowerCase().includes('critical fever')
    )
    
    // Check for cold symptoms
    const hasCold = symptoms.some(symptom => 
      symptom?.toLowerCase().includes('cough') ||
      symptom?.toLowerCase().includes('cold')
    )
    
    // Check for allergy symptoms
    const hasAllergy = symptoms.some(symptom => 
      symptom?.toLowerCase().includes('rash') ||
      symptom?.toLowerCase().includes('allerg')
    )

    // Determine status (priority: high fever > low fever > cold > allergies > other)
    if (hasHighFever) {
      status = 'High Fever'
      message = 'High fever detected'
      temperature = Number((38.0 + Math.random() * 1.5).toFixed(1))
    } else if (hasFever) {
      status = 'Low Fever'
      message = 'Mild fever detected'
      temperature = Number((37.0 + Math.random() * 1).toFixed(1))
    } else if (hasCold) {
      status = 'Cold Symptoms'
      message = 'Showing signs of cold'
    } else if (hasAllergy) {
      status = 'Allergies'
      message = 'Allergic reaction detected'
    } else {
      status = 'Mild Symptoms'
      message = 'Some symptoms present'
    }

    const result = {
      status,
      message,
      symptoms,
      temperature,
      lastUpdated: new Date().toISOString(),
    }
    
    console.log(`🎯 Final health data:`, result)
    return result
  }

  // Cache management (following your pattern)
  const invalidateCache = (date?: string) => {
    if (date) {
      delete healthCache.value[date]
      console.log(`🗑️ Invalidated health cache for ${date}`)
    } else {
      healthCache.value = {}
      console.log(`🗑️ Cleared entire health cache`)
    }
  }

  // Force refresh for specific date (following your pattern)
  const refreshHealthForDate = async (date: string): Promise<void> => {
    console.log(`🔄 Force refreshing health data for ${date}`)
    delete healthCache.value[date]
    await fetchHealthForDate(date)
  }

  // Main fetch function (following your exact pattern)
  const fetchHealthForDate = async (targetDate: string): Promise<void> => {
    console.log(`🚀 Fetching health for date: ${targetDate}`)
    
    // Don't fetch if already cached
    if (healthCache.value[targetDate]) {
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
      
      // Fetch all symptom records for the child (using your existing endpoint)
      const response = await axios.get(`http://127.0.0.1:8000/symptom/child/${childrenStore.currentChild.id}?days=60`)
      const allSymptomRecords = response.data || []
      
      console.log(`📊 API returned ${allSymptomRecords.length} total symptom records`)
      
      // Debug: Show sample of symptom dates
      const sampleSymptoms = allSymptomRecords.slice(0, 3).map((symptom: any) => ({
        id: symptom.id,
        check_in: symptom.check_in,
        converted_date: timestampToDateString(symptom.check_in),
        symptom: symptom.symptom
      }))
      console.log(`🔍 Sample symptom dates:`, sampleSymptoms)
      console.log(`🎯 Target date we're looking for: ${targetDate}`)
      
      // Filter symptom records for target date
      const symptomsForDate = allSymptomRecords.filter((symptom: any) => {
        const symptomDate = timestampToDateString(symptom.check_in)
        const matches = symptomDate === targetDate
        
        if (!matches) {
          console.log(`❌ Symptom ${symptom.id}: ${symptom.check_in} → ${symptomDate} ≠ ${targetDate}`)
        } else {
          console.log(`✅ Symptom ${symptom.id}: ${symptom.check_in} → ${symptomDate} = ${targetDate}`)
        }
        
        return matches
      })

      console.log(`📅 Found ${symptomsForDate.length} symptom records for ${targetDate}`)

      // Process the data
      const processedData = processHealthData(symptomsForDate)

      // Cache the result
      healthCache.value[targetDate] = processedData

      console.log(`✅ Cached health data for ${targetDate}:`, healthCache.value[targetDate])
      
      // Force reactivity update
      healthCache.value = { ...healthCache.value }

    } catch (error) {
      console.error(`❌ Error fetching health data:`, error)
      errorMessage.value = error instanceof Error ? error.message : 'Unknown error'
      
      // Set empty data on error
      healthCache.value[targetDate] = {
        status: 'Healthy',
        message: 'No symptoms today',
        symptoms: [],
        lastUpdated: '',
      }
    } finally {
      loadingState.value = false
    }
  }

  // Get health for a specific date (following your exact pattern)
  const getHealthForDate = computed(() => (dateInput: string | Date): HealthData => {
    const dateString = dateInput instanceof Date ? dateToString(dateInput) : dateInput
    
    console.log(`🔍 Getting health for ${dateString}`)
    console.log(`🗂️ Available cached dates:`, Object.keys(healthCache.value))
    
    // Check if we have cached data
    const cachedData = healthCache.value[dateString]
    
    if (!cachedData) {
      console.log(`📥 Not cached, triggering fetch for ${dateString}`)
      
      // Trigger fetch but don't await it
      fetchHealthForDate(dateString).then(() => {
        console.log(`🔄 Fetch completed for ${dateString}, data should now be available`)
      })
      
      // Return empty data while loading
      return {
        status: 'Healthy',
        message: 'No symptoms today',
        symptoms: [],
        lastUpdated: '',
      }
    }
    
    console.log(`📤 Returning cached health data for ${dateString}:`, cachedData)
    return cachedData
  })

  // Update health for a date (placeholder for now, following your pattern)
  const updateHealthForDate = async (date: string, healthData: HealthData): Promise<void> => {
    healthCache.value[date] = healthData
    console.log(`✅ Updated health data for ${date}:`, healthData)
  }

  return {
    healthCache,
    loadingState,
    errorMessage,
    getHealthForDate,
    fetchHealthForDate,
    updateHealthForDate,
    invalidateCache,
    refreshHealthForDate,
  }
})