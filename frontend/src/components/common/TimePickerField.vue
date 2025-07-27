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

<style scoped>
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
  color: #d32f2f;
  font-size: 12px;
  margin-top: 8px;
}
</style>