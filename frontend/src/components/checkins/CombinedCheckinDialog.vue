<template>
  <div>
    <!-- Meal Dialog -->
    <MealCheckinDialog
      v-model="showMealDialog"
      @save="handleSave"
    />

    <!-- Sleep Dialog -->
    <SleepCheckinDialog
      v-model="showSleepDialog"
      @save="handleSave"
    />

    <!-- Poop Dialog -->
    <PoopCheckinDialog
      v-model="showPoopDialog"
      @save="handleSave"
    />

    <!-- Symptoms Dialog -->
    <SymptomsCheckinDialog
      v-model="showSymptomsDialog"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MealCheckinDialog from './MealCheckin.vue'
import SleepCheckinDialog from './SleepCheckin.vue'
import PoopCheckinDialog from './PoopCheckin.vue'
import SymptomsCheckinDialog from './HealthCheckin.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  defaultTab: {
    type: String,
    default: 'meal',
    validator: (value) => ['meal', 'sleep', 'poop', 'symptoms'].includes(value)
  },
  childName: {
    type: String,
    default: 'Jennie'
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// Dialog states
const showMealDialog = ref(false)
const showSleepDialog = ref(false)
const showPoopDialog = ref(false)
const showSymptomsDialog = ref(false)

// Watch for when main dialog should open
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    openDialog(props.defaultTab)
  } else {
    closeAllDialogs()
  }
})

// Watch for when any dialog closes
watch([showMealDialog, showSleepDialog, showPoopDialog, showSymptomsDialog], (newValues) => {
  const anyOpen = newValues.some(value => value)
  if (!anyOpen && props.modelValue) {
    emit('update:modelValue', false)
  }
})

// Methods
const openDialog = (type) => {
  closeAllDialogs()
  
  switch (type) {
    case 'meal':
      showMealDialog.value = true
      break
    case 'sleep':
      showSleepDialog.value = true
      break
    case 'poop':
      showPoopDialog.value = true
      break
    case 'symptoms':
      showSymptomsDialog.value = true
      break
  }
}

const closeAllDialogs = () => {
  showMealDialog.value = false
  showSleepDialog.value = false
  showPoopDialog.value = false
  showSymptomsDialog.value = false
}

const handleSave = (data) => {
  emit('save', data)
  emit('update:modelValue', false)
}
</script>