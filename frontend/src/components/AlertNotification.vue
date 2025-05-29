<!-- components/AlertNotification.vue -->
<template>
  <!-- Alert container that changes color based on alert type -->
  <v-alert
    :color="alertColor"
    :icon="alertIcon"
    variant="tonal"
    closable
    class="mb-4"
  >
    <!-- Alert content with icon and message -->
    <div class="d-flex align-center">
      <div>
        <!-- Main alert message -->
        <div class="font-weight-medium">{{ alert.message }}</div>
        <!-- Additional details if provided -->
        <div v-if="alert.details" class="text-body-2 mt-1">
          {{ alert.details }}
        </div>
      </div>
      <!-- View More button -->
      <v-btn
        size="small"
        variant="text"
        class="ml-auto"
        @click="viewMore"
      >
        View More
      </v-btn>
    </div>
  </v-alert>
</template>

<script setup>
import { computed } from 'vue'

// Props - data passed from parent component
const props = defineProps({
  // Alert object containing type, message, and details
  alert: {
    type: Object,
    required: true,
    default: () => ({
      type: 'info',
      message: 'No alerts',
      details: ''
    })
  }
})

// Emit events to parent component
const emit = defineEmits(['view-more', 'close'])

// Computed property to determine alert color based on type
const alertColor = computed(() => {
  // Map alert types to Vuetify colors
  const colorMap = {
    'success': 'success',  // Green for good news
    'warning': 'warning',  // Yellow/Orange for warnings
    'error': 'error',      // Red for urgent issues
    'info': 'info'         // Blue for general information
  }
  // Return the color based on alert type, default to 'info' if type not found
  return colorMap[props.alert.type] || 'info'
})

// Computed property to determine icon based on alert type
const alertIcon = computed(() => {
  // Map alert types to Material Design Icons
  const iconMap = {
    'success': 'mdi-check-circle',     // Checkmark for success
    'warning': 'mdi-alert',            // Triangle with exclamation for warnings
    'error': 'mdi-alert-circle',       // Circle with exclamation for errors
    'info': 'mdi-information'          // Information icon for general info
  }
  // Return the icon based on alert type
  return iconMap[props.alert.type] || 'mdi-information'
})

// Method to handle "View More" button click
const viewMore = () => {
  // Emit event to parent component
  emit('view-more', props.alert)
  
  // Parent can handle this event to show more details
  console.log('Viewing more details for alert:', props.alert)
}

// Method to handle alert close
const handleClose = () => {
  // Emit close event to parent
  emit('close')
}
</script>

<style scoped>
/* Component-specific styles */
.v-alert {
  /* Ensure consistent spacing and appearance */
  border: none;
}

/* Add animation for alert appearance */
.v-alert {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Style adjustments based on alert type */
.v-alert--success {
  background-color: rgba(76, 175, 80, 0.1);
}

.v-alert--warning {
  background-color: rgba(255, 152, 0, 0.1);
}

.v-alert--error {
  background-color: rgba(244, 67, 54, 0.1);
}
</style>