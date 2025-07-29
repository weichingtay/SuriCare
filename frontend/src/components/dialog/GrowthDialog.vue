<template>
  <BaseCheckInDialog
    icon="mdi-ruler"
    icon-color="#c85862"
    :loading="loading"
    max-width="841px"
    :model-value="modelValue"
    :notes="localNotes"
    :subtitle="`How is ${currentChild.name} growing?`"
    title="Growth"
    @close="handleClose"
    @save="handleSave"
    @update:model-value="handleDialogUpdate"
    @update:notes="updateNotes"
  >
    <template #custom-content>
      <div class="growth-content">
        <!-- Growth Measurements Row -->
        <div class="growth-measurements">

          <!-- Height Input -->
          <div class="measurement-field">
            <label class="section-label">Height</label>
            <v-text-field
              v-model="localHeight"
              class="measurement-input"
              :disabled="loading"
              :error="!!errors.height"
              hide-details
              placeholder="Input height here"
              suffix="cm"
              variant="outlined"
              @focus="clearError('height')"
              @input="clearError('height')"
            >
              <template #prepend-inner>
                <v-icon color="grey-darken-1" size="20">
                  mdi-human-male-height
                </v-icon>
              </template>
            </v-text-field>
            <div v-if="errors.height" class="error-message">
              {{ errors.height }}
            </div>
          </div>
          <!-- Weight Input -->
          <div class="measurement-field">
            <label class="section-label">Weight</label>
            <v-text-field
              v-model="localWeight"
              class="measurement-input"
              :disabled="loading"
              :error="!!errors.weight"
              hide-details
              placeholder="Input weight here"
              suffix="kg"
              variant="outlined"
              @focus="clearError('weight')"
              @input="clearError('weight')"
            >
              <template #prepend-inner>
                <v-icon color="grey-darken-1" size="20">
                  mdi-weight-kilogram
                </v-icon>
              </template>
            </v-text-field>
            <div v-if="errors.weight" class="error-message">
              {{ errors.weight }}
            </div>
          </div>

          <!-- Head Circumference Input -->
          <div class="measurement-field">
            <label class="section-label">Head Circumference</label>
            <v-text-field
              v-model="localHeadCircumference"
              class="measurement-input"
              :disabled="loading"
              :error="!!errors.headCircumference"
              hide-details
              placeholder="Input head circumference"
              suffix="cm"
              variant="outlined"
              @focus="clearError('headCircumference')"
              @input="clearError('headCircumference')"
            >
              <template #prepend-inner>
                <v-icon color="grey-darken-1" size="20">
                  mdi-head
                </v-icon>
              </template>
            </v-text-field>
            <div v-if="errors.headCircumference" class="error-message">
              {{ errors.headCircumference }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseCheckInDialog>
</template>

<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue'
  import BaseCheckInDialog from '@/components/dialog/BaseCheckInDialog.vue'
  import { useCheckinStore } from '@/stores/checkin'

  const props = defineProps({
    // Dialog Control
    modelValue: {
      type: Boolean,
      default: false,
    },
currentChild: {
    type: Object,
    default: () => ({ name: 'Child' })
  },
    // Growth Measurements
    weight: {
      type: [String, Number],
      default: '',
    },
    height: {
      type: [String, Number],
      default: '',
    },
    headCircumference: {
      type: [String, Number],
      default: '',
    },

    // Notes
    notes: {
      type: String,
      default: '',
    },

    // State
    loading: {
      type: Boolean,
      default: false,
    },

    // NEW: Add editing mode support
    isEditing: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits([
    'update:modelValue',
    'update:weight',
    'update:height',
    'update:headCircumference',
    'update:notes',
    'save',
    'close',
  ])

  const checkinStore = useCheckinStore()

  // Local reactive variables for measurements
  const localWeight = ref('')
  const localHeight = ref('')
  const localHeadCircumference = ref('')
  const localNotes = ref('')
  const errors = ref({})

  // Initialize local values when dialog opens
  watch(() => props.modelValue, newValue => {
    if (newValue) {
      console.log('📏 Growth dialog opened, isEditing:', props.isEditing)
      console.log('📏 Props:', {
        weight: props.weight,
        height: props.height,
        headCircumference: props.headCircumference,
        notes: props.notes
      })

      // Reset form when opening dialog
      localWeight.value = props.weight?.toString() || ''
      localHeight.value = props.height?.toString() || ''
      localHeadCircumference.value = props.headCircumference?.toString() || ''
      localNotes.value = props.notes || ''

      // Clear all errors when opening
      errors.value = {}
    }
  }, { immediate: true })

  // Watch for prop changes and update local values (for editing mode)
  watch(() => props.weight, newValue => {
    if (props.modelValue) {
      localWeight.value = newValue?.toString() || ''
    }
  })

  watch(() => props.height, newValue => {
    if (props.modelValue) {
      localHeight.value = newValue?.toString() || ''
    }
  })

  watch(() => props.headCircumference, newValue => {
    if (props.modelValue) {
      localHeadCircumference.value = newValue?.toString() || ''
    }
  })

  watch(() => props.notes, newValue => {
    if (props.modelValue) {
      localNotes.value = newValue || ''
    }
  })

  // Watch for changes and emit to parent with debouncing
  let weightTimeout = null
  let heightTimeout = null
  let headTimeout = null

  watch(localWeight, newValue => {
    if (weightTimeout) clearTimeout(weightTimeout)
    weightTimeout = setTimeout(() => {
      if (props.isEditing) {
        emit('update:weight', newValue)
      }
    }, 100)
  })

  watch(localHeight, newValue => {
    if (heightTimeout) clearTimeout(heightTimeout)
    heightTimeout = setTimeout(() => {
      if (props.isEditing) {
        emit('update:height', newValue)
      }
    }, 100)
  })

  watch(localHeadCircumference, newValue => {
    if (headTimeout) clearTimeout(headTimeout)
    headTimeout = setTimeout(() => {
      if (props.isEditing) {
        emit('update:headCircumference', newValue)
      }
    }, 100)
  })

  const updateNotes = (notes: string) => {
    localNotes.value = notes
    if (props.isEditing) {
      emit('update:notes', notes)
    }
  }

  // Clear specific error when user starts typing
  const clearError = field => {
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

  // Validation methods
  const validateWeight = () => {
    if (!localWeight.value || localWeight.value.toString().trim() === '') {
      errors.value.weight = 'Please enter weight'
      return false
    }

    const weightNum = parseFloat(localWeight.value)
    if (isNaN(weightNum) || weightNum <= 0) {
      errors.value.weight = 'Please enter a valid weight'
      return false
    }

    delete errors.value.weight
    return true
  }

  const validateHeight = () => {
    if (!localHeight.value || localHeight.value.toString().trim() === '') {
      errors.value.height = 'Please enter height'
      return false
    }

    const heightNum = parseFloat(localHeight.value)
    if (isNaN(heightNum) || heightNum <= 0) {
      errors.value.height = 'Please enter a valid height'
      return false
    }

    delete errors.value.height
    return true
  }

  const validateHeadCircumference = () => {
    if (!localHeadCircumference.value || localHeadCircumference.value.toString().trim() === '') {
      errors.value.headCircumference = 'Please enter head circumference'
      return false
    }

    const circumferenceNum = parseFloat(localHeadCircumference.value)
    if (isNaN(circumferenceNum) || circumferenceNum <= 0) {
      errors.value.headCircumference = 'Please enter a valid head circumference'
      return false
    }

    delete errors.value.headCircumference
    return true
  }

  const validateForm = () => {
    // Clear all errors first
    errors.value = {}

    const isWeightValid = validateWeight()
    const isHeightValid = validateHeight()
    const isHeadCircumferenceValid = validateHeadCircumference()

    return isWeightValid && isHeightValid && isHeadCircumferenceValid
  }

  // Handle dialog events
  const handleDialogUpdate = value => {
    emit('update:modelValue', value)
    if (!value) {
      // Clear errors and reset form when dialog is closed
      nextTick(() => {
        errors.value = {}
        localWeight.value = ''
        localHeight.value = ''
        localHeadCircumference.value = ''
        localNotes.value = ''
      })
    }
  }

  const handleClose = () => {
    // Clear errors and reset form when closing
    errors.value = {}
    localWeight.value = ''
    localHeight.value = ''
    localHeadCircumference.value = ''
    localNotes.value = ''
    emit('close')
  }

  // Handle save action
  const handleSave = async () => {
    console.log('📏 Growth dialog handleSave clicked!')
    console.log('🔍 isEditing:', props.isEditing)

    if (!validateForm()) {
      console.log('❌ Growth validation failed')
      return
    }

    const growthData = {
      weight: localWeight.value,
      height: localHeight.value,
      headCircumference: localHeadCircumference.value,
      notes: localNotes.value,
    }

    console.log('📏 Growth data to save:', growthData)
    errors.value = {}

    if (props.isEditing) {
      // 🖊️ EDIT MODE: Just emit to parent timeline, don't call store
      console.log('📝 Edit mode: emitting save to timeline')
      emit('save', growthData)
    } else {
      // ➕ CREATE MODE: Call store to create new entry (normal check-in)
      console.log('➕ Create mode: calling checkinStore.saveGrowth for new entry')

      try {
        await checkinStore.saveGrowth(growthData)
        console.log('✅ Growth save completed successfully!')

        // Dialog will close automatically on success
        emit('close')
      } catch (error) {
        // Error is handled by the store, just show it if needed
        console.error('Failed to save growth data:', error)
      }
    }
  }
</script>

<style scoped>
.growth-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* Growth Measurements Container - Inline Layout */
.growth-measurements {
    display: flex;
    gap: 32px;
}

/* Individual Measurement Field */
.measurement-field {
    flex: 1;
    min-width: 278px;
    display: flex;
    flex-direction: column;
}

/* Measurement Labels */
.section-label {
    font-size: 12px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Measurement Input Styling */
.measurement-input {
    min-width: 160px; /* Ensure placeholder text fits */
}

.error-message {
    color: #d32f2f;
    font-size: 12px;
    margin-top: 8px;
}
</style>
