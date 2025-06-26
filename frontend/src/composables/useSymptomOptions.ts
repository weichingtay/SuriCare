import { computed, onMounted } from 'vue'
import { useLookupData } from './useLookupData'

// Fallback data for symptom options
const fallbackSymptomOptions = [
  { id: 1, value: 'cough', label: 'Cough', icon: 'mdi-account-voice' },
  { id: 2, value: 'fever', label: 'Fever', icon: 'mdi-thermometer' },
  { id: 3, value: 'cold', label: 'Cold', icon: 'mdi-weather-snowy' },
  { id: 4, value: 'rash', label: 'Rash', icon: 'mdi-circle-outline' },
  { id: 5, value: 'other', label: 'Other', icon: 'mdi-dots-horizontal' },
]

export function useSymptomOptions () {
  const {
    fetchSymptomTypes,
    symptomTypes,
    isLoading,
    getError,
  } = useLookupData()

  // Symptom options with icons
  const symptomOptions = computed(() => {
    if (symptomTypes.value.length === 0) {
      return fallbackSymptomOptions
    }

    return symptomTypes.value.map(item => ({
      ...item,
      // Ensure icon is present, fallback to default if not
      icon: item.icon || 'mdi-medical-bag',
    }))
  })

  // Loading state
  const isSymptomLoading = computed(() => isLoading.value('symptomTypes'))

  // Error state
  const symptomError = computed(() => getError.value('symptomTypes'))

  // Load symptom options
  const loadSymptomOptions = async () => {
    await fetchSymptomTypes()
  }

  // Helper function to get symptom icon by value
  const getSymptomIcon = (symptomValue: string): string => {
    const option = symptomTypes.value.find(opt => opt.value === symptomValue)
    return option?.icon || 'mdi-medical-bag'
  }

  // Helper function to get symptom label by value
  const getSymptomLabel = (symptomValue: string): string => {
    const option = symptomTypes.value.find(opt => opt.value === symptomValue)
    return option?.label || symptomValue
  }

  // Auto-load on mount
  onMounted(() => {
    loadSymptomOptions()
  })

  return {
    // Options
    symptomOptions,

    // Loading state
    isLoading: isSymptomLoading,

    // Error state
    error: symptomError,

    // Helper functions
    getSymptomIcon,
    getSymptomLabel,

    // Actions
    loadSymptomOptions,
  }
}
