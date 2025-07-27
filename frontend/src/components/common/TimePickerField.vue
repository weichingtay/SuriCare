<template>
  <div class="time-field">
    <label class="section-label">
      {{ label }}
    </label>
    <VueDatePicker
      :model-value="modelValue"
      class="custom-date-picker"
      :clearable="true"
      :disabled="disabled"
      format="HH:mm"
      :is-24="true"
      :placeholder="placeholder"
      time-picker
      :enable-time-picker="true"
      auto-apply
      :enable-seconds="false"
      :minutes-increment="1"
      :hours-increment="1"
      :time-picker-inline="false"
      :close-on-scroll="false"
      @update:model-value="handleUpdate"
    >
      <template #trigger>
        <v-text-field
          :disabled="disabled"
          :error="hasError"
          hide-details
          :placeholder="placeholder"
          readonly
          :model-value="displayValue"
          variant="outlined"
          @click="clearError"
        >
          <template #prepend-inner>
            <v-icon color="black" size="20">
              mdi-clock-outline
            </v-icon>
          </template>
        </v-text-field>
      </template>
    </VueDatePicker>
    
    <!-- Quick time adjustment buttons -->
    <div class="time-controls">
      <!-- Left buttons (backward) -->
      <div class="time-controls-left">
        <v-btn
          size="x-small"
          variant="text"
          color="#D87179"
          @click="adjustTime(-60)"
          :disabled="disabled || !modelValue"
          class="adjust-btn"
        >
          -1h
        </v-btn>
        <v-btn
          size="x-small"
          variant="text"
          color="#D87179"
          @click="adjustTime(-30)"
          :disabled="disabled || !modelValue"
          class="adjust-btn"
        >
          -30m
        </v-btn>
      </div>

      <!-- Center "Now" button -->
      <v-btn
        size="large"
        variant="outlined"
        color="#D87179"
        @click="setCurrentTime"
        :disabled="disabled"
        class="now-btn-center"
      >
        Now
      </v-btn>

      <!-- Right buttons (forward) -->
      <div class="time-controls-right">
        <v-btn
          size="x-small"
          variant="text"
          color="#D87179"
          @click="adjustTime(30)"
          :disabled="disabled || !modelValue"
          class="adjust-btn"
        >
          +30m
        </v-btn>
        <v-btn
          size="x-small"
          variant="text"
          color="#D87179"
          @click="adjustTime(60)"
          :disabled="disabled || !modelValue"
          class="adjust-btn"
        >
          +1h
        </v-btn>
      </div>
    </div>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

interface Props {
  modelValue: Date | null
  label: string
  placeholder?: string
  disabled?: boolean
  errorMessage?: string
}

interface Emits {
  (e: 'update:modelValue', value: Date | null): void
  (e: 'clear-error'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select time',
  disabled: false,
  errorMessage: ''
})

const emit = defineEmits<Emits>()

const hasError = computed(() => !!props.errorMessage)

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  
  if (props.modelValue instanceof Date) {
    if (isNaN(props.modelValue.getTime())) return ''
    const hours = props.modelValue.getHours().toString().padStart(2, '0')
    const minutes = props.modelValue.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }
  
  return ''
})

const handleUpdate = (value: Date | null) => {
  emit('update:modelValue', value)
}

const clearError = () => {
  emit('clear-error')
}

const setCurrentTime = () => {
  const now = new Date()
  emit('update:modelValue', now)
  emit('clear-error')
}

const adjustTime = (minutes: number) => {
  if (!props.modelValue) return
  
  const newTime = new Date(props.modelValue.getTime())
  newTime.setMinutes(newTime.getMinutes() + minutes)
  
  // For awake time field, prevent going backwards in time if it would be before bed time
  if (props.label === 'Awake Time' && minutes < 0) {
    // We can't directly access bed time here, so we'll emit the time and let parent handle validation
    // For now, just ensure we don't go to negative hours
    if (newTime.getHours() < 0 || newTime < new Date(newTime.getFullYear(), newTime.getMonth(), newTime.getDate())) {
      return // Don't allow going to previous day
    }
  }
  
  // Ensure time stays within 24-hour format
  if (newTime.getHours() >= 24) {
    newTime.setHours(newTime.getHours() - 24)
    newTime.setDate(newTime.getDate() + 1)
  } else if (newTime.getHours() < 0) {
    newTime.setHours(newTime.getHours() + 24)
    newTime.setDate(newTime.getDate() - 1)
  }
  
  emit('update:modelValue', newTime)
  emit('clear-error')
}

// Prevent scroll events from bubbling up to the page
onMounted(() => {
  nextTick(() => {
    // Add event listeners to prevent scroll propagation when time picker is open
    const addScrollPrevention = () => {
      const timeColumns = document.querySelectorAll('.dp__time_col')
      timeColumns.forEach(col => {
        col.addEventListener('wheel', (e) => {
          e.stopPropagation()
          // Allow scrolling within the time column
          const target = e.target as HTMLElement
          const scrollContainer = target.closest('.dp__time_col') as HTMLElement
          if (scrollContainer) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer
            const isAtTop = scrollTop === 0
            const isAtBottom = scrollTop + clientHeight >= scrollHeight
            
            // Only prevent default if we're trying to scroll beyond bounds
            if ((isAtTop && (e as WheelEvent).deltaY < 0) || 
                (isAtBottom && (e as WheelEvent).deltaY > 0)) {
              e.preventDefault()
            }
          }
        }, { passive: false })
      })
    }

    // Watch for when the time picker opens
    const observer = new MutationObserver(() => {
      addScrollPrevention()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

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
  color: $app-text-secondary;
  margin-bottom: $spacing-sm;
}

.custom-date-picker {
  width: 100%;
  z-index: 9999;
}

.time-controls {
  margin-top: $spacing-md;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
}

.time-controls-left,
.time-controls-right {
  display: flex;
  gap: $spacing-xs;
  min-width: 80px;
}

.time-controls-left {
  justify-content: flex-end;
}

.time-controls-right {
  justify-content: flex-start;
}

.now-btn-center {
  min-width: 80px;
  height: 40px;
  border-color: $app-primary !important;
  color: $app-primary !important;
  font-weight: 600;
  flex-shrink: 0;
  
  &:hover {
    background-color: rgba($app-primary, 0.1) !important;
  }
}

.adjust-btn {
  min-width: 45px;
  font-size: 11px;
  color: $app-primary !important;
  
  &:hover {
    background-color: rgba($app-primary, 0.1) !important;
  }
  
  &:disabled {
    color: rgba($app-primary, 0.4) !important;
  }
}

:deep(.dp__menu) {
  z-index: 9999 !important;
  overscroll-behavior: contain;
}

:deep(.dp__time_input) {
  height: 200px !important;
  overflow-y: auto !important;
  overscroll-behavior: contain;
}

:deep(.dp__time_col) {
  height: 200px !important;
  overflow-y: auto !important;
  scrollbar-width: thin;
  overscroll-behavior: contain;
}

:deep(.dp__time_col_item) {
  cursor: pointer;
  user-select: none;
}

:deep(.dp__time_col::-webkit-scrollbar) {
  width: 6px;
}

:deep(.dp__time_col::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

:deep(.dp__time_col::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 3px;
}

:deep(.dp__time_col::-webkit-scrollbar-thumb:hover) {
  background: #a8a8a8;
}

/* Prevent page scroll when scrolling time picker */
:deep(.dp__time_col):hover {
  overscroll-behavior: contain;
}

:deep(.dp__overlay) {
  overscroll-behavior: contain;
}

.error-message {
  color: $status-negative;
  font-size: 12px;
  margin-top: $spacing-sm;
}
</style>