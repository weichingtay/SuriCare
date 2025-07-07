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
    icon="mdi-emoticon-poop"
    :main-value="poopCount"
    :status-class="statusClass"
    :status-note="statusNote"
    title="Stool"
    unit="times"
    @check-in="handleCheckIn"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { usePoopStore } from '@/stores/poop'
  import BaseSummaryCard from '@/components/summaryCard/BaseSummaryCard.vue'

  // ADD THIS PROPS SECTION:
  const props = defineProps({
    date: {
      type: Date,
      required: true,
    },
  })

  const poopStore = usePoopStore()
  // FIXED:
const dateString = computed(() => {
  const year = props.date.getFullYear()
  const month = String(props.date.getMonth() + 1).padStart(2, '0')
  const day = String(props.date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})
const poopData = computed(() => poopStore.getPoopForDate(dateString.value))

  // Count of bowel movements
  const poopCount = computed(() => {
   const data = poopData.value
  
  // Check if there's no data at all (no input made)
  if (!data || !data.lastUpdated) {
    return '-'  // Show dash when no input
  }
  
  // Show actual count (including 0) when there is input data
  return data.count || 0
})

  // Enhanced status logic based on actual poop data structure
  const statusNote = computed(() => {
    const data = poopData.value

    if (!data || !data.lastUpdated) {
    return 'No stool data for this date'
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
