import { computed, onMounted } from 'vue'
import { useLookupData } from './useLookupData'

// Fallback data for form options
const fallbackGenderOptions = [
  { id: 1, value: '', label: 'Select a gender', disabled: true },
  { id: 2, value: 'male', label: 'Male' },
  { id: 3, value: 'female', label: 'Female' },
  { id: 4, value: 'other', label: 'Other' },
  { id: 5, value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const fallbackRelationshipOptions = [
  { id: 1, value: 'mother', label: 'Mother' },
  { id: 2, value: 'father', label: 'Father' },
  { id: 3, value: 'grandfather', label: 'Grandfather' },
  { id: 4, value: 'grandmother', label: 'Grandmother' },
  { id: 5, value: 'nanny_babysitter', label: 'Nanny/Babysitter' },
  { id: 6, value: 'aunt', label: 'Aunt' },
  { id: 7, value: 'uncle', label: 'Uncle' },
  { id: 8, value: 'guardian', label: 'Guardian' },
  { id: 9, value: 'other', label: 'Other' },
]

const fallbackAccessLevels = [
  { id: 1, value: 'full', label: 'Full Access' },
  { id: 2, value: 'partial', label: 'Partial Access' },
]

export function useFormOptions () {
  const {
    fetchGenderOptions,
    fetchRelationshipTypes,
    fetchAccessLevels,
    genderOptions,
    relationshipTypes,
    accessLevels,
    isLoading,
    getError,
  } = useLookupData()

  // Gender options with default "Select" option
  const genderOptionsWithDefault = computed(() => {
    if (genderOptions.value.length === 0) {
      return fallbackGenderOptions
    }

    return [
      { id: 0, value: '', label: 'Select a gender', disabled: true },
      ...genderOptions.value,
    ]
  })

  // Relationship options (no default needed)
  const relationshipOptions = computed(() => {
    if (relationshipTypes.value.length === 0) {
      return fallbackRelationshipOptions
    }

    return relationshipTypes.value
  })

  // Access level options for sharing
  const accessLevelOptions = computed(() => {
    if (accessLevels.value.length === 0) {
      return fallbackAccessLevels
    }

    return accessLevels.value
  })

  // Loading states
  const isGenderLoading = computed(() => isLoading.value('genderOptions'))
  const isRelationshipLoading = computed(() => isLoading.value('relationshipTypes'))
  const isAccessLevelLoading = computed(() => isLoading.value('accessLevels'))

  // Error states
  const genderError = computed(() => getError.value('genderOptions'))
  const relationshipError = computed(() => getError.value('relationshipTypes'))
  const accessLevelError = computed(() => getError.value('accessLevels'))

  // Overall loading state
  const isLoadingOptions = computed(() =>
    isGenderLoading.value || isRelationshipLoading.value || isAccessLevelLoading.value
  )

  // Load all form-related lookup data
  const loadFormOptions = async () => {
    await Promise.allSettled([
      fetchGenderOptions(),
      fetchRelationshipTypes(),
      fetchAccessLevels(),
    ])
  }

  // Helper functions to get labels by values
  const getGenderLabel = (genderValue: string): string => {
    const option = genderOptions.value.find(opt => opt.value === genderValue)
    return option?.label || genderValue
  }

  const getRelationshipLabel = (relationshipValue: string): string => {
    const option = relationshipTypes.value.find(opt => opt.value === relationshipValue)
    return option?.label || relationshipValue
  }

  const getAccessLevelLabel = (accessValue: string): string => {
    const option = accessLevels.value.find(opt => opt.value === accessValue)
    return option?.label || accessValue
  }

  // Auto-load on mount
  onMounted(() => {
    loadFormOptions()
  })

  return {
    // Options
    genderOptions: genderOptionsWithDefault,
    relationshipOptions,
    accessLevelOptions,

    // Loading states
    isGenderLoading,
    isRelationshipLoading,
    isAccessLevelLoading,
    isLoading: isLoadingOptions,

    // Error states
    genderError,
    relationshipError,
    accessLevelError,

    // Helper functions
    getGenderLabel,
    getRelationshipLabel,
    getAccessLevelLabel,

    // Actions
    loadFormOptions,
  }
}
