import { computed } from 'vue'

export interface Alert {
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  details?: string
}

export function useAlert(alert: Alert) {
  // Map alert types to Vuetify colors
  const colorMap = {
    'success': 'success',  // Green for good news
    'warning': 'warning',  // Yellow/Orange for warnings
    'error': 'error',      // Red for urgent issues
    'info': 'info'         // Blue for general information
  }

  // Map alert types to Material Design Icons
  const iconMap = {
    'success': 'mdi-check-circle',     // Checkmark for success
    'warning': 'mdi-alert',            // Triangle with exclamation for warnings
    'error': 'mdi-alert-circle',       // Circle with exclamation for errors
    'info': 'mdi-information'          // Information icon for general info
  }

  // Computed property to determine alert color based on type
  const alertColor = computed(() => {
    return colorMap[alert.type] || 'info'
  })

  // Computed property to determine icon based on alert type
  const alertIcon = computed(() => {
    return iconMap[alert.type] || 'mdi-information'
  })

  return {
    alertColor,
    alertIcon
  }
} 