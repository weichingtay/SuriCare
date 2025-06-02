import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAlertStore = defineStore('alert', () => {
  // State
  const currentAlert = ref({
    type: 'warning',
    message: 'Interrupted Sleep & Reduced Appetite',
    details: 'Possible Early Discomfort.'
  })

  // Actions
  function updateAlertForChild(childId) {
    if (childId === 1) {
      currentAlert.value = {
        type: 'warning',
        message: 'Interrupted Sleep & Reduced Appetite.',
        details: 'Possible Early Discomfort.'
      }
    } else if (childId === 2) {
      currentAlert.value = {
        type: 'success',
        message: 'All Health Markers Normal',
        details: 'All health indicators are within normal range.'
      }
    }
  }

  function setAlert(alert) {
    currentAlert.value = alert
  }

  // Getters
  const getCurrentAlert = computed(() => currentAlert.value)

  return {
    // State
    currentAlert,

    // Actions
    updateAlertForChild,
    setAlert,

    // Getters
    getCurrentAlert
  }
}) 