// src/stores/sleep.ts - Following your meals/poop store pattern exactly
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import axios from 'axios'
import { useChildrenStore } from './children'
import { timestampToDateString, dateToString } from '@/utils/dateUtils'

export interface SleepData {
  nightHours: number
  napHours: number
  wakeCount: number
  lastUpdated: string
  totalHours: number
  sleepSessions: number
}

interface SleepByDateCache {
  [dateKey: string]: SleepData
}

interface SleepStoreInterface {
  sleepCache: Ref<SleepByDateCache>
  loadingState: Ref<boolean>
  errorMessage: Ref<string | null>
  getSleepForDate: ComputedRef<(date: string | Date) => SleepData>
  fetchSleepForDate: (date: string) => Promise<void>
  updateSleepForDate: (date: string, sleepData: SleepData) => Promise<void>
  invalidateCache: (date?: string) => void
  refreshSleepForDate: (date: string) => Promise<void>
}

export const useSleepStore = defineStore('sleep', (): SleepStoreInterface => {
  // State variables
  const sleepCache = ref<SleepByDateCache>({})
  const loadingState = ref<boolean>(false)
  const errorMessage = ref<string | null>(null)

  // Date utilities are now imported from shared utils

  // Process sleep data into your format
  const processSleepData = (sleepRecords: any[]): SleepData => {
    console.log(`🔄 Processing ${sleepRecords.length} sleep records...`)
    
    if (sleepRecords.length === 0) {
      return {
        nightHours: 0,
        napHours: 0,
        wakeCount: 0,
        lastUpdated: '',
        totalHours: 0,
        sleepSessions: 0
      }
    }

    let totalNightHours = 0
    let totalNapHours = 0

    sleepRecords.forEach((sleep, index) => {
      const startTime = new Date(sleep.start_time)
      const endTime = new Date(sleep.end_time)
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) // hours
      const startHour = startTime.getHours()
      
      // Simple classification: afternoon (12-18) = nap, otherwise = night sleep
      if (startHour >= 12 && startHour <= 18) {
        totalNapHours += duration
        console.log(`  😴 Sleep ${index + 1}: NAP = ${duration.toFixed(1)}h (${startHour}:00)`)
      } else {
        totalNightHours += duration
        console.log(`  🌙 Sleep ${index + 1}: NIGHT = ${duration.toFixed(1)}h (${startHour}:00)`)
      }
    })

    const result = {
      nightHours: Math.round(totalNightHours * 10) / 10,
      napHours: Math.round(totalNapHours * 10) / 10,
      wakeCount: Math.max(0, sleepRecords.length - 1), // Interruptions between sessions
      lastUpdated: new Date().toISOString(),
      totalHours: Math.round((totalNightHours + totalNapHours) * 10) / 10,
      sleepSessions: sleepRecords.length
    }
    
    console.log(`🎯 Final sleep data:`, result)
    return result
  }

  // Cache management
  const invalidateCache = (date?: string) => {
    if (date) {
      delete sleepCache.value[date]
      console.log(`🗑️ Invalidated cache for ${date}`)
    } else {
      sleepCache.value = {}
      console.log(`🗑️ Cleared entire sleep cache`)
    }
  }

  // Force refresh for specific date
  const refreshSleepForDate = async (date: string): Promise<void> => {
    console.log(`🔄 Force refreshing sleep data for ${date}`)
    delete sleepCache.value[date]
    await fetchSleepForDate(date)
  }

  // Main fetch function
  const fetchSleepForDate = async (targetDate: string): Promise<void> => {
    console.log(`🚀 Fetching sleep for date: ${targetDate}`)
    
    // Don't fetch if already cached
    if (sleepCache.value[targetDate]) {
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
      
      // Fetch all sleep records for the child (last 60 days to match your pattern)
      const response = await axios.get(`http://127.0.0.1:8000/sleeptime/${childrenStore.currentChild.id}?days=60`)
      const allSleepRecords = response.data || []
      
      console.log(`📊 API returned ${allSleepRecords.length} total sleep records`)
      
      // Debug: Show sample of sleep dates
      const sampleSleep = allSleepRecords.slice(0, 3).map((sleep: any) => ({
        id: sleep.id,
        check_in: sleep.check_in,
        converted_date: timestampToDateString(sleep.check_in)
      }))
      console.log(`🔍 Sample sleep dates:`, sampleSleep)
      
      // Filter sleep records for target date
      const sleepForDate = allSleepRecords.filter((sleep: any) => {
        const sleepDate = timestampToDateString(sleep.check_in)
        const matches = sleepDate === targetDate
        
        if (!matches) {
          console.log(`❌ Sleep ${sleep.id}: ${sleep.check_in} → ${sleepDate} ≠ ${targetDate}`)
        } else {
          console.log(`✅ Sleep ${sleep.id}: ${sleep.check_in} → ${sleepDate} = ${targetDate}`)
        }
        
        return matches
      })

      console.log(`📅 Found ${sleepForDate.length} sleep records for ${targetDate}`)

      // Process the data
      const processedData = processSleepData(sleepForDate)

      // Cache the result
      sleepCache.value[targetDate] = processedData

      console.log(`✅ Cached sleep data for ${targetDate}:`, sleepCache.value[targetDate])
      
      // Force reactivity update
      sleepCache.value = { ...sleepCache.value }

    } catch (error) {
      console.error(`❌ Error fetching sleep data:`, error)
      errorMessage.value = error instanceof Error ? error.message : 'Unknown error'
      
      // Set empty data on error
      sleepCache.value[targetDate] = {
        nightHours: 0,
        napHours: 0,
        wakeCount: 0,
        lastUpdated: '',
        totalHours: 0,
        sleepSessions: 0
      }
    } finally {
      loadingState.value = false
    }
  }

  // Get sleep for a specific date
  const getSleepForDate = computed(() => (dateInput: string | Date): SleepData => {
    const dateString = dateInput instanceof Date ? dateToString(dateInput) : dateInput
    
    console.log(`🔍 Getting sleep for ${dateString}`)
    console.log(`🗂️ Available cached dates:`, Object.keys(sleepCache.value))
    
    // Check if we have cached data
    const cachedData = sleepCache.value[dateString]
    
    if (!cachedData) {
      console.log(`📥 Not cached, triggering fetch for ${dateString}`)
      
      // Trigger fetch but don't await it
      fetchSleepForDate(dateString).then(() => {
        console.log(`🔄 Fetch completed for ${dateString}, data should now be available`)
      })
      
      // Return empty data while loading
      return {
        nightHours: 0,
        napHours: 0,
        wakeCount: 0,
        lastUpdated: '',
        totalHours: 0,
        sleepSessions: 0
      }
    }
    
    console.log(`📤 Returning cached sleep data for ${dateString}:`, cachedData)
    return cachedData
  })

  // Update sleep for a date (placeholder for now)
  const updateSleepForDate = async (date: string, sleepData: SleepData): Promise<void> => {
    sleepCache.value[date] = sleepData
    console.log(`✅ Updated sleep data for ${date}:`, sleepData)
  }

  return {
    sleepCache,
    loadingState,
    errorMessage,
    getSleepForDate,
    fetchSleepForDate,
    updateSleepForDate,
    invalidateCache,
    refreshSleepForDate,
  }
})