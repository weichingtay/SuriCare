<!-- <template>
  <BaseSummaryCard
    title="Stool"
    icon="mdi-emoticon-poop"
    :main-value="poopData?.count || 0"
    unit="times"
    :status-note="statusNote"
    status-class="status-positive"
    @check-in="handleCheckIn"
  />
</template>

<script setup>
import { computed } from 'vue'
import { usePoopStore } from '@/stores/poop'
import BaseSummaryCard from '@/components/summaryCard/BaseSummaryCard.vue'

const poopStore = usePoopStore()
const currentDate = new Date().toISOString().split('T')[0]
const poopData = computed(() => poopStore.getPoopForDate(currentDate))

const statusNote = computed(() => {
  const unusualCount = poopData.value?.unusual || 0
  return `${unusualCount} Unusual`
})

const emit = defineEmits(['check-in'])

const handleCheckIn = () => {
  emit('check-in')
}
</script> -->


<!-- src/components/summaryCard/PoopSummaryCard.vue -->
<!-- src/components/summaryCard/PoopSummaryCard.vue -->
<!-- src/components/summaryCard/PoopSummaryCard.vue -->
<template>
  <BaseSummaryCard
    title="Stool"
    icon="mdi-emoticon-poop"
    :main-value="poopCount"
    unit="times"
    :status-note="statusNote"
    :status-class="statusClass"
    @check-in="handleCheckIn"
  />
</template>

<script setup>
import { computed } from 'vue'
import { usePoopStore } from '@/stores/poop'
import BaseSummaryCard from '@/components/summaryCard/BaseSummaryCard.vue'

const poopStore = usePoopStore()
const currentDate = new Date().toISOString().split('T')[0]
const poopData = computed(() => poopStore.getPoopForDate(currentDate))

// Count of bowel movements
const poopCount = computed(() => {
  return poopData.value?.count || 0
})

// Enhanced status logic based on actual poop data structure
const statusNote = computed(() => {
  const data = poopData.value
  
  if (!data) {
    return 'No data recorded'
  }
  
  const count = data.count || 0
  const unusual = data.unusual || 0
  
  // No bowel movements
  if (count === 0) {
    return 'Possible constipation'
  }
  
  // Has bowel movements - check for health concerns
  if (unusual > 0) {
    if (count >= 4 && unusual > 0) {
      return 'Possible diarrhea - monitor hydration'
    } else if (unusual === count) {
      return 'Abnormal stool patterns detected'
    } else {
      return 'Some concerning stool consistency'
    }
  }
  
  // Normal patterns - focus on health indicators
  if (count >= 5) {
    return 'Very frequent - possible stomach upset'
  } else if (count === 4) {
    return 'Frequent movements - monitor for discomfort'
  } else if (count >= 1 && count <= 3) {
    return 'Normal digestive health'
  }
  
  return 'Healthy patterns'
})

// Status class based on unusual count and frequency
const statusClass = computed(() => {
  const data = poopData.value
  
  if (!data) {
    return 'status-neutral'
  }
  
  const count = data.count || 0
  const unusual = data.unusual || 0
  
  // Red: No movements, all unusual, or very high frequency
  if (count === 0 || unusual === count || count >= 5) {
    return 'status-negative'
  }
  
  // Yellow: Some unusual or high frequency
  if (unusual > 0 || count === 4) {
    return 'status-warning'
  }
  
  // Green: Normal frequency with no unusual patterns
  return 'status-positive'
})

const emit = defineEmits(['check-in'])

const handleCheckIn = () => {
  emit('check-in')
}
</script>