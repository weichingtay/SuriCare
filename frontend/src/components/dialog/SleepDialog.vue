<template>
  <BaseCheckInDialog
    icon="mdi-sleep"
    icon-color="#000000"
    :loading="checkinStore.isLoading"
    :model-value="modelValue"
    :notes="checkinStore.sleepData.notes"
    subtitle="How did Jennie Sleep?"
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

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update:modelValue', 'close', 'saved'])

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

  // Initialize local state from store when dialog opens
  const initializeFromStore = () => {
    const storeData = checkinStore.sleepData
    
    // Convert store string times to Date objects for the picker
    if (storeData.bedTime) {
      const [hours, minutes] = storeData.bedTime.split(':')
      localBedTime.value = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes))
    } else {
      localBedTime.value = null
    }
    
    if (storeData.awakeTime) {
      const [hours, minutes] = storeData.awakeTime.split(':')
      localAwakeTime.value = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes))
    } else {
      localAwakeTime.value = null
    }
    
    errors.value = {}
  }

  // Watch for dialog open/close
  watch(() => props.modelValue, (newValue) => {
    if (newValue) {
      initializeFromStore()
      checkinStore.clearError()
    }
  })

  // Watch for local time changes and sync to store
  watch(localBedTime, (newValue) => {
    if (bedTimeTimeout) clearTimeout(bedTimeTimeout)
    bedTimeTimeout = setTimeout(() => {
      // Update the store's sleepData directly
      checkinStore.sleepData.bedTime = timeToString(newValue)
      if (newValue && errors.value.bedTime) {
        delete errors.value.bedTime
      }
    }, 100)
  })

  watch(localAwakeTime, (newValue) => {
    if (awakeTimeTimeout) clearTimeout(awakeTimeTimeout)
    awakeTimeTimeout = setTimeout(() => {
      // Update the store's sleepData directly
      checkinStore.sleepData.awakeTime = timeToString(newValue)
      if (newValue && errors.value.awakeTime) {
        delete errors.value.awakeTime
      }
    }, 100)
  })

  const updateNotes = (notes: string) => {
    checkinStore.sleepData.notes = notes
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
        // Clear the store form
        checkinStore.clearSleepForm()
      })
    }
  }

  const handleClose = () => {
    errors.value = {}
    localBedTime.value = null
    localAwakeTime.value = null
    checkinStore.clearSleepForm()
    checkinStore.clearError()
    emit('close')
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      // Save using the store method
      const savedEntry = await checkinStore.saveSleep({
        bedTime: timeToString(localBedTime.value),
        awakeTime: timeToString(localAwakeTime.value),
        notes: checkinStore.sleepData.notes,
      })

      console.log('Sleep data saved successfully:', savedEntry)
      
      // Clear form and close dialog
      errors.value = {}
      localBedTime.value = null
      localAwakeTime.value = null
      
      // Emit saved event for parent component
      emit('saved', savedEntry)
      emit('update:modelValue', false)
      
    } catch (error) {
      console.error('Failed to save sleep data:', error)
      // Error is already handled by the store, just log it here
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