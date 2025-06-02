<template>
  <div class="mb-6">
    <div class="d-flex align-center mb-3">
      <h2 class="text-h6">Today's Summary</h2>
      
      <!-- Date picker for selecting summary date -->
      <v-menu
        v-model="datePickerMenu"
        :close-on-content-click="false"
        location="bottom"
      >
        <template v-slot:activator="{ props }">
          <!-- Date picker button -->
          <v-btn
            v-bind="props"
            variant="text"
            size="small"
            class="ml-2"
          >
            <v-icon size="small">mdi-calendar</v-icon>
            <span class="ml-1">{{ formattedSelectedDate }}</span>
            <v-icon size="small">mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        
        <!-- Date picker component -->
        <v-date-picker
          v-model="selectedDate"
          @update:model-value="handleDateChange"
        ></v-date-picker>
      </v-menu>
    </div>

    <!-- Summary cards will be rendered here -->
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'

const props = defineProps({
  modelValue: {
    type: String,
    default: () => new Date().toISOString().substr(0, 10)
  }
})

const emit = defineEmits(['update:modelValue', 'date-change'])

const datePickerMenu = ref(false)
const selectedDate = ref(props.modelValue)

const formattedSelectedDate = computed(() => {
  return format(new Date(selectedDate.value), 'MMM d, yyyy')
})

function handleDateChange(newDate) {
  datePickerMenu.value = false
  emit('update:modelValue', newDate)
  emit('date-change', newDate)
}

// Watch for changes to modelValue prop
watch(() => props.modelValue, (newVal) => {
  selectedDate.value = newVal
})
</script>
