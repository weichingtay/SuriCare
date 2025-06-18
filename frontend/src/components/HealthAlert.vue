<!--TODO: USE AI HERE INSTEAD OF HEALTH!!-->

<template>
  <div class="mb-6" v-if="hasHealthAlert">
    <h2 class="text-body-1 font-weight-medium mb-3">
      {{ currentChild.name }}'s Health Issue
    </h2>

    <v-alert
      color="error"
      variant="tonal"
      class="health-alert"
    >
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon
            color="error"
            class="mr-3"
          >mdi-alert-circle</v-icon>
          <div>
            <div class="text-body-1 font-weight-medium mb-1">
              {{ healthData.status }}
            </div>
            <div class="text-body-2 text-grey-darken-1">
              {{ healthData.message }}
              <div v-if="healthData.symptoms?.length" class="mt-1">
                Symptoms: {{ healthData.symptoms.join(', ') }}
              </div>
              <div v-if="healthData.temperature" class="mt-1">
                Temperature: {{ healthData.temperature }}°C
              </div>
            </div>
          </div>
        </div>
        <v-btn
          size="small"
          variant="flat"
          color="error"
          class="text-white"
          @click="handleViewMore"
        >
          View More
        </v-btn>
      </div>
    </v-alert>
  </div>
</template>

<script setup>
import { useHealthAlert } from '@/composables/useHealthAlert'

const props = defineProps({
  currentChild: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view-more'])

const { healthData, hasHealthAlert } = useHealthAlert()

const handleViewMore = () => {
  emit('view-more', healthData.value)
}
</script>

