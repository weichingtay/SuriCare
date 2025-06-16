import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import axios from 'axios'

export interface HealthData {
  status: string
  message: string
  symptoms: string[]
  temperature?: number
  lastUpdated: string
}

interface HealthByDate {
  [date: string]: HealthData
}

interface HealthStore {
  healthByDate: Ref<HealthByDate>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  getHealthForDate: ComputedRef<(date: string) => HealthData>
  fetchHealthForDate: (date: string) => Promise<void>
  updateHealthForDate: (date: string, healthData: HealthData) => Promise<void>
}

// Possible health statuses and their corresponding messages
const healthStatuses = [
  { status: 'Healthy', message: 'No symptoms today' },
  { status: 'Low Fever', message: 'Mild fever detected' },
  { status: 'High Fever', message: 'High fever detected' },
  { status: 'Cold Symptoms', message: 'Showing signs of cold' },
  { status: 'Allergies', message: 'Allergic reaction detected' }
]

// Possible symptoms
const possibleSymptoms = [
  'Fever',
  'Cough',
  'Runny Nose',
  'Sore Throat',
  'Rash',
  'Fatigue',
  'Loss of Appetite',
  'Vomiting',
  'Diarrhea',
  'Ear Pain'
]

export const useHealthStore = defineStore('health', (): HealthStore => {
  // State
  const healthByDate = ref<HealthByDate>({})
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Mock data generator for development
  // HACK: TEMPORARY RANDOMIZER WHILE DATABASE IS BEING DEVELOPED
  const generateMockHealthData = (date: string): HealthData => {
    // 70% chance of being healthy
    const isHealthy = Math.random() > 0.9
    
    if (isHealthy) {
      return {
        status: 'Healthy',
        message: 'No symptoms today',
        symptoms: [],
        lastUpdated: new Date().toISOString()
      }
    }

    // Generate random health status
    const statusIndex = Math.floor(Math.random() * (healthStatuses.length - 1)) + 1 // Skip 'Healthy'
    const selectedStatus = healthStatuses[statusIndex]
    
    // Generate random symptoms (1-3 symptoms)
    const numSymptoms = Math.floor(Math.random() * 3) + 1
    const selectedSymptoms = possibleSymptoms
      .sort(() => Math.random() - 0.5)
      .slice(0, numSymptoms)

    // Add temperature if fever is present
    const temperature = selectedStatus.status.includes('Fever')
      ? Number((36.5 + Math.random() * 3).toFixed(1)) // Random temperature between 36.5 and 39.5
      : undefined

    return {
      ...selectedStatus,
      symptoms: selectedSymptoms,
      temperature,
      lastUpdated: new Date().toISOString()
    }
  }

  // Getters
  const getHealthForDate = computed(() => (date: string): HealthData => {
    return healthByDate.value[date] || generateMockHealthData(date)
  })

  // Actions
  const fetchHealthForDate = async (date: string): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get<HealthData>(`/api/health/${date}`)
      // healthByDate.value[date] = response.data
      
      // Using mock data for now
      healthByDate.value[date] = generateMockHealthData(date)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error fetching health data:', err)
    } finally {
      isLoading.value = false
    }
  }

  const updateHealthForDate = async (date: string, healthData: HealthData): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Replace with actual API call
      // await axios.put<HealthData>(`/api/health/${date}`, healthData)
      // healthByDate.value[date] = healthData
      
      // Using mock data for now
      healthByDate.value[date] = healthData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error updating health data:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    healthByDate,
    isLoading,
    error,
    getHealthForDate,
    fetchHealthForDate,
    updateHealthForDate
  }
}) 