<template>
  <div class="mb-6">
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
              {{ alert.title }}
            </div>
            <div class="text-body-2 text-grey-darken-1">
              {{ alert.description }}
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
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  currentChild: {
    type: Object,
    required: true
  },
  alert: {
    type: Object,
    default: () => ({
      title: 'Vitamin D Deficiency',
      description: 'Your child has low levels of vitamin D.'
    })
  }
})

const emit = defineEmits(['view-more'])

const handleViewMore = () => {
  emit('view-more', props.alert)
}
</script>

<style lang="scss" scoped>
@import '@/styles/settings.scss';
</style> 