<template>
  <BaseCheckInDialog
    icon="mdi-sleep"
    icon-color="#000000"
    :loading="checkinStore.isLoading"
    :model-value="modelValue"
    :notes="checkinStore.sleepData.notes"
    :subtitle="`How did ${currentChild.name} Sleep?`"
    title="Sleep"
    width="800px"
    max-height="80vh"
    @close="handleClose"
    @save="handleSave"
    @update:model-value="handleDialogUpdate"
    @update:notes="updateNotes"
  >
    <template #custom-content>
      <div class="sleep-content">
        <!-- Sleep Time Inputs -->
        <div class="sleep-times">
          <!-- Bed Time -->
          <div class="time-field">
            <label class="section-label">
              Bed Time
            </label>
            <VueDatePicker
              v-model="localBedTime"
              class="custom-date-picker"
              :clearable="true"
              :disabled="checkinStore.isLoading"
              format="HH:mm"
              :is-24="true"
              placeholder="Bed Time"
              time-picker
              :enable-time-picker="true"
              auto-apply
            >
              <template #trigger>
                <v-text-field
                  :disabled="checkinStore.isLoading"
                  :error="!!errors.bedTime"
                  hide-details
                  placeholder="Bed time"
                  readonly
                  :model-value="formatTime(localBedTime)"
                  variant="outlined"
                  @click="clearError('bedTime')"
                >
                  <template #prepend-inner>
                    <v-icon color="black" size="20">
                      mdi-clock-outline
                    </v-icon>
                  </template>
                </v-text-field>
              </template>
            </VueDatePicker>
            <div v-if="errors.bedTime" class="error-message">
              {{ errors.bedTime }}
            </div>
          </div>

          <!-- Awake Time -->
          <div class="time-field">
            <label class="section-label">
              Awake Time
            </label>
            <VueDatePicker
              v-model="localAwakeTime"
              class="custom-date-picker"
              :clearable="true"
              :disabled="checkinStore.isLoading"
              format="HH:mm"
              :is-24="true"
              placeholder="Awake time"
              time-picker
              :enable-time-picker="true"
              auto-apply
            >
              <template #trigger>
                <v-text-field
                  :disabled="checkinStore.isLoading"
                  :error="!!errors.awakeTime"
                  hide-details
                  :model-value="formatTime(localAwakeTime)"
                  placeholder="Awake Time"
                  readonly
                  variant="outlined"
                  @click="clearError('awakeTime')"
                >
                  <template #prepend-inner>
                    <v-icon color="black" size="20">
                      mdi-clock-outline
                    </v-icon>
                  </template>
                </v-text-field>
              </template>
            </VueDatePicker>
            <div v-if="errors.awakeTime" class="error-message">
              {{ errors.awakeTime }}
            </div>
          </div>
        </div>

        <!-- Sleep Duration Display - Always visible -->
        <div class="sleep-duration">
          <label class="section-label">Sleep Duration</label>
          <div class="duration-display">
            {{ sleepDuration || '--' }}
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="checkinStore.error" class="error-display">
          <v-alert
            type="error"
            variant="outlined"
            closable
            @click:close="checkinStore.clearError()"
          >
            {{ checkinStore.error }}
          </v-alert>
        </div>
      </div>
    </template>
  </BaseCheckInDialog>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch } from 'vue'
  import BaseCheckInDialog from '@/components/dialog/BaseCheckInDialog.vue'
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  import { useCheckinStore } from '@/stores/checkin'
  import { useSleepStore } from '@/stores/sleep'

  const sleepStore = useSleepStore()

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    currentChild: {
    type: Object,
    default: () => ({ name: 'Child' })
  },
    // NEW: Add props for editing mode
    bedTime: {
      type: String,
      default: '',
    },
    awakeTime: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits([
    'update:modelValue', 
    'update:bedTime',
    'update:awakeTime', 
    'update:notes',
    'close', 
    'save'
  ])

  // Use the checkin store
  const checkinStore = useCheckinStore()

  const localBedTime = ref(null)
  const localAwakeTime = ref(null)
  const errors = ref({})

  let bedTimeTimeout: ReturnType<typeof setTimeout> | null = null
  let awakeTimeTimeout: ReturnType<typeof setTimeout> | null = null

  // Improved format time function
  const formatTime = (time: string | Date | null) => {
    if (!time) return ''
    
    // Handle string format (HH:mm)
    if (typeof time === 'string') {
      return time
    }
    
    // Handle Date object
    if (time instanceof Date) {
      // Make sure it's a valid date
      if (isNaN(time.getTime())) return ''
      
      // Format as HH:mm
      const hours = time.getHours().toString().padStart(2, '0')
      const minutes = time.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
    
    // Handle object with hours/minutes (some date pickers return this format)
    if (typeof time === 'object' && time !== null) {
      if ('hours' in time && 'minutes' in time) {
        const hours = String(time.hours).padStart(2, '0')
        const minutes = String(time.minutes).padStart(2, '0')
        return `${hours}:${minutes}`
      }
    }
    
    return ''
  }

  // Convert time to string format for store
  const timeToString = (time: string | Date | null) => {
    return formatTime(time)
  }

  // Convert string time to Date object for picker
  const stringToDate = (timeString: string) => {
    if (!timeString) return null
    const [hours, minutes] = timeString.split(':')
    const date = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes))
    return date
  }

  // Computed sleep duration
  const sleepDuration = computed(() => {
    const bedTimeStr = timeToString(localBedTime.value)
    const awakeTimeStr = timeToString(localAwakeTime.value)

    if (!bedTimeStr || !awakeTimeStr) return null

    try {
      const bedTime = new Date(`2000-01-01 ${bedTimeStr}`)
      const awakeTime = new Date(`2000-01-01 ${awakeTimeStr}`)

      // Handle overnight sleep
      if (awakeTime < bedTime) {
        awakeTime.setDate(awakeTime.getDate() + 1)
      }

      const duration = awakeTime.getTime() - bedTime.getTime()
      const hours = Math.floor(duration / (1000 * 60 * 60))
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`
      } else if (hours > 0) {
        return `${hours}h`
      } else if (minutes > 0) {
        return `${minutes}m`
      }
      return null
    } catch (error) {
      console.error('Error calculating sleep duration:', error)
      return null
    }
  })

  // Initialize local state from props (for editing) or store (for creating)
  const initializeFromData = () => {
    if (props.isEditing) {
      // EDITING MODE: Use props
      console.log('😴 Sleep dialog in EDIT mode, using props:', {
        bedTime: props.bedTime,
        awakeTime: props.awakeTime,
        notes: props.notes
      })
      
      localBedTime.value = props.bedTime ? stringToDate(props.bedTime) : null
      localAwakeTime.value = props.awakeTime ? stringToDate(props.awakeTime) : null
    } else {
      // CREATING MODE: Use store data
      console.log('😴 Sleep dialog in CREATE mode, using store')
      const storeData = checkinStore.sleepData
      
      if (storeData.bedTime) {
        localBedTime.value = stringToDate(storeData.bedTime)
      } else {
        localBedTime.value = null
      }
      
      if (storeData.awakeTime) {
        localAwakeTime.value = stringToDate(storeData.awakeTime)
      } else {
        localAwakeTime.value = null
      }
    }
    
    errors.value = {}
  }

  // Watch for dialog open/close and prop changes
  watch(() => props.modelValue, (newValue) => {
    if (newValue) {
      initializeFromData()
      if (!props.isEditing) {
        checkinStore.clearError()
      }
    }
  })

  // Watch for prop changes in editing mode
  watch(() => [props.bedTime, props.awakeTime], () => {
    if (props.isEditing && props.modelValue) {
      initializeFromData()
    }
  })

  // Watch for local time changes and sync
  watch(localBedTime, (newValue) => {
    if (bedTimeTimeout) clearTimeout(bedTimeTimeout)
    bedTimeTimeout = setTimeout(() => {
      const timeString = timeToString(newValue)
      
      if (props.isEditing) {
        // EDITING MODE: Emit to parent
        emit('update:bedTime', timeString)
      } else {
        // CREATING MODE: Update store
        checkinStore.sleepData.bedTime = timeString
      }
      
      if (newValue && errors.value.bedTime) {
        delete errors.value.bedTime
      }
    }, 100)
  })

  watch(localAwakeTime, (newValue) => {
    if (awakeTimeTimeout) clearTimeout(awakeTimeTimeout)
    awakeTimeTimeout = setTimeout(() => {
      const timeString = timeToString(newValue)
      
      if (props.isEditing) {
        // EDITING MODE: Emit to parent
        emit('update:awakeTime', timeString)
      } else {
        // CREATING MODE: Update store
        checkinStore.sleepData.awakeTime = timeString
      }
      
      if (newValue && errors.value.awakeTime) {
        delete errors.value.awakeTime
      }
    }, 100)
  })

  const updateNotes = (notes: string) => {
    if (props.isEditing) {
      // EDITING MODE: Emit to parent
      emit('update:notes', notes)
    } else {
      // CREATING MODE: Update store
      checkinStore.sleepData.notes = notes
    }
  }

  const clearError = (field: string) => {
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

  // Validation functions
  const validateBedTime = () => {
    if (!localBedTime.value) {
      errors.value.bedTime = 'Please select bed time'
      return false
    }

    delete errors.value.bedTime
    return true
  }

  const validateAwakeTime = () => {
    if (!localAwakeTime.value) {
      errors.value.awakeTime = 'Please select awake time'
      return false
    }

    delete errors.value.awakeTime
    return true
  }

  const validateForm = () => {
    errors.value = {}
    const isBedTimeValid = validateBedTime()
    const isAwakeTimeValid = validateAwakeTime()
    return isBedTimeValid && isAwakeTimeValid
  }

  const handleDialogUpdate = (value: boolean) => {
    emit('update:modelValue', value)
    if (!value) {
      nextTick(() => {
        errors.value = {}
        localBedTime.value = null
        localAwakeTime.value = null
        if (!props.isEditing) {
          // Only clear store in create mode
          checkinStore.clearSleepForm()
        }
      })
    }
  }

  const handleClose = () => {
    errors.value = {}
    localBedTime.value = null
    localAwakeTime.value = null
    if (!props.isEditing) {
      checkinStore.clearSleepForm()
      checkinStore.clearError()
    }
    emit('close')
  }

  const handleSave = async () => {
    console.log('😴 Sleep dialog handleSave clicked!')
    console.log('🔍 isEditing:', props.isEditing)
    
    if (!validateForm()) {
      console.log('❌ Sleep validation failed')
      return
    }

    const sleepData = {
      bedTime: timeToString(localBedTime.value),
      awakeTime: timeToString(localAwakeTime.value),
      notes: props.isEditing ? props.notes : checkinStore.sleepData.notes,
    }

    console.log('😴 Sleep data to save:', sleepData)
    errors.value = {}

    if (props.isEditing) {
      // 🖊️ EDIT MODE: Just emit to parent timeline, don't call store
      console.log('📝 Edit mode: emitting save to timeline')
      emit('save', sleepData)
    } else {
      // ➕ CREATE MODE: Call store to create new entry (normal check-in)
      console.log('➕ Create mode: calling checkinStore.saveSleep for new entry')
      
      try {
        // Save using the store method
        const savedEntry = await checkinStore.saveSleep(sleepData)

        console.log('Sleep data saved successfully:', savedEntry)
        
        // IMPORTANT: Refresh the sleep store for today's date
        const currentDate = new Date().toISOString().split('T')[0]
        await sleepStore.refreshSleepForDate(currentDate)

        // Clear form and close dialog
        errors.value = {}
        localBedTime.value = null
        localAwakeTime.value = null
        
        // Emit save event for parent component
        emit('save')
        emit('update:modelValue', false)
        
      } catch (error) {
        console.error('Failed to save sleep data:', error)
        // Error is already handled by the store, just log it here
      }
    }
  }
</script>

<style scoped>
.sleep-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: 200px;
}

.sleep-times {
    display: flex;
    gap: 24px;
}

.time-field {
    flex: 1;
    width: 288px;
    display: flex;
    flex-direction: column;
    position: relative;
}

.section-label {
    font-size: 12px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
}

.custom-date-picker {
    width: 100%;
    z-index: 9999;
}

:deep(.dp__menu) {
    z-index: 9999 !important;
}

.error-message {
    color: #d32f2f;
    font-size: 12px;
    margin-top: 8px;
}

.sleep-duration {
    text-align: center;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;
}

.duration-display {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-top: 4px;
}

.error-display {
    margin-top: 16px;
}
</style>