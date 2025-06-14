<!-- components/AlertNotification.vue -->
<template>
  <!-- Alert container that changes color based on alert type -->

  <!-- Removed closable banner----2/6/25-->
  <v-alert
    :color="alertColor"
    :icon="alertIcon"
    variant="tonal"

    class="mb-4"
  >
    <!-- Alert content with icon and message -->
    <div class="d-flex align-center">
      <div>
        <!-- Main alert message -->
        <div class="font-weight-medium">{{ alert.message }}</div>
        <!-- Additional details if provided -->
        <div v-if="alert.details" class="text-body-2">
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

<script setup lang="ts">
import { useAlert, type Alert } from '@/composables/useAlert'

// Props - data passed from parent component
const props = defineProps<{
  alert: Alert
}>()

// Emit events to parent component
const emit = defineEmits<{
  'view-more': [alert: Alert]
  'close': []
}>()

// Use the alert composable
const { alertColor, alertIcon } = useAlert(props.alert)

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