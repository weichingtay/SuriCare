<template>
  <BaseCheckInDialog
    icon="mdi-sleep"
    icon-color="#000000"
    :loading="loading"
    :model-value="modelValue"
    :notes="notes"
    subtitle="How did Jennie Sleep?"
    title="Sleep"
    width="800px"
    @close="handleClose"
    @save="handleSave"
    @update:model-value="handleDialogUpdate"
    @update:notes="$emit('update:notes', $event)"
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
              :disabled="loading"
              format="HH:mm"
              :is-24="true"
              placeholder="Awake Time"
              time-picker
            >
              <template #trigger>
                <v-text-field
                  :disabled="loading"
                  :error="!!errors.bedTime"
                  hide-details
                  placeholder="Bed time"
                  readonly
                  :value="formatTime(localBedTime)"
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
              :disabled="loading"
              format="HH:mm"
              :is-24="true"
              placeholder="Awake time"
              time-picker
            >
              <template #trigger>
                <v-text-field
                  :disabled="loading"
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


      </div>
    </template>
  </BaseCheckInDialog>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch } from 'vue'
  import BaseCheckInDialog from '@/components/dialog/BaseCheckInDialog.vue'
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
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
    loading: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['check-in', 'save', 'close', 'update:notes', 'update:bedTime', 'update:awakeTime', 'update:modelValue'])

  const localBedTime = ref(null)
  const localAwakeTime = ref(null)

  const errors = ref({})

  let bedTimeTimeout: ReturnType<typeof setTimeout> | null = null
  let awakeTimeTimeout: ReturnType<typeof setTimeout> | null = null

  // Format time for display
  const formatTime = (time: string | Date | null) => {
    if (!time) return ''
    if (typeof time === 'string') return time
    if (time instanceof Date) {
      return time.toTimeString().slice(0, 5)
    }
    return ''
  }

  // Convert time to string format
  const timeToString = (time: string | Date | null) => {
    if (!time) return ''
    if (typeof time === 'string') return time
    if (time instanceof Date) {
      return time.toTimeString().slice(0, 5)
    }
    return ''
  }

  // Computed sleep duration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sleepDuration = computed(() => {
    const bedTimeStr = timeToString(localBedTime.value)
    const awakeTimeStr = timeToString(localAwakeTime.value)

    if (!bedTimeStr || !awakeTimeStr) return null

    try {
      const bedTime = new Date(`2000-01-01 ${bedTimeStr}`)
      const awakeTime = new Date(`2000-01-01 ${awakeTimeStr}`)

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
      errors.value = 'Invalid time'
      return null
    }
  })

  watch(() => props.modelValue, newValue => {
    if (newValue) {
      localBedTime.value = props.bedTime || null
      localAwakeTime.value = props.awakeTime || null
      errors.value = {}
    }
  }, { immediate: true })

  watch(() => props.bedTime, newValue => {
    if (props.modelValue) {
      localBedTime.value = newValue || null
    }
  })

  watch(() => props.awakeTime, newValue => {
    if (props.modelValue) {
      localAwakeTime.value = newValue || null
    }
  })

  watch(localBedTime, newValue => {
    if (bedTimeTimeout) clearTimeout(bedTimeTimeout)
    bedTimeTimeout = setTimeout(() => {
      emit('update:bedTime', timeToString(newValue))
      if (newValue && errors.value.bedTime) {
        delete errors.value.bedTime
      }
    }, 100)
  })

  watch(localAwakeTime, newValue => {
    if (awakeTimeTimeout) clearTimeout(awakeTimeTimeout)
    awakeTimeTimeout = setTimeout(() => {
      emit('update:awakeTime', timeToString(newValue))
      if (newValue && errors.value.awakeTime) {
        delete errors.value.awakeTime
      }
    }, 100)
  })

  const clearError = (field: string) => {
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

  // Validation
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
      })
    }
  }

  const handleClose = () => {
    errors.value = {}
    localBedTime.value = null
    localAwakeTime.value = null
    emit('close')
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    const sleepData = {
      bedTime: timeToString(localBedTime.value),
      awakeTime: timeToString(localAwakeTime.value),
      notes: props.notes,
    }

    errors.value = {}
    emit('save', sleepData)
  }
</script>

<style scoped>
.sleep-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
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
}

.section-label {
    font-size: 12px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
}

.custom-date-picker {
    width: 100%;
}

.error-message {
    color: #d32f2f;
    font-size: 12px;
    margin-top: 8px;
}

.sleep-duration {
    text-align: center;
}


</style>
