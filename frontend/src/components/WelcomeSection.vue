<template>
  <div class="mb-6">
    <!-- Welcome message with dynamic caregiver name -->
    <h1 class="text-h4 mb-2">Welcome, {{ caregiverName }}</h1>
    
    <!-- Child's name and alerts -->
    <div class="mb-4">
      <p class="text-subtitle-1 mb-0">{{ currentChild.name }}'s Important Alerts</p>
    </div>

    <!-- Alert notification component -->
    <AlertNotification 
      :alert="currentAlert"
      class="mb-6"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useChildStore } from '@/stores/child.store'
import { storeToRefs } from 'pinia'

const props = defineProps({
  currentAlert: {
    type: Object,
    default: () => ({})
  }
})

const childStore = useChildStore()
const { currentChild, caregiverName } = storeToRefs(childStore)
</script>
