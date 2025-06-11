<template>
  <div class="mb-6">
    <div class="d-flex align-center justify-space-between mb-3">
      <div>
        <h2 class="text-body-1 font-weight-medium mb-1">
          Check-ins History
        </h2>
        <p class="text-body-2 text-grey mb-0">
          View {{ currentChild.name }}'s check-ins
          including meal, sleep, poop, growth, and
          symptoms.
        </p>
      </div>
      <v-btn
        size="small"
        variant="flat"
        color="error"
        class="text-white"
        @click="handleViewHistory"
      >
        View Check-ins History
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  currentChild: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view-history'])

const handleViewHistory = () => {
  emit('view-history', props.currentChild)
}
</script>

<style lang="scss" scoped>
@import '@/styles/settings.scss';
</style> 