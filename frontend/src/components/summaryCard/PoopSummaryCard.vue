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

  // Simple status logic - use common everyday language
  const statusNote = computed(() => {
    const data = poopData.value

    console.log(`🔍 Raw poop data:`, data)

    // Check if data is still loading or no data exists
    if (!data || !data.lastUpdated || data.lastUpdated === '') {
      console.log(`⏳ No data or empty lastUpdated`)
      return 'No stool data for this date'
    }

    const count = data.count || 0
    const unusual = data.unusual || 0
    const normal = data.normal || 0

    console.log(`📊 Status calculation: count=${count}, unusual=${unusual}, normal=${normal}`)
    console.log(`📊 Data structure:`, JSON.stringify(data, null, 2))

    // No bowel movements - this is constipation
    if (count === 0) {
      console.log(`💤 No movements detected`)
      return 'No bowel movements - possible constipation'
    }

    // Focus ONLY on stool quality using everyday terms
    if (unusual > 0) {
      console.log(`⚠️ Unusual movements detected: ${unusual}`)
      if (unusual === count) {
        if (count >= 4) {
          return 'All stools unusual - possible diarrhea'
        } else {
          return count === 1 
            ? 'Unusual stool - monitor color and texture'
            : 'All stools unusual - abnormal characteristics'
        }
      } else {
        return `${unusual} of ${count} stools unusual - mixed patterns`
      }
    }

    // All movements are normal
    console.log(`✅ All movements normal`)
    return 'Normal healthy stools'
  })

  // Status class - only color/texture matters
  const statusClass = computed(() => {
    const data = poopData.value

    // Still loading or no data
    if (!data || !data.lastUpdated || data.lastUpdated === '') {
      return 'status-neutral'
    }

    const count = data.count || 0
    const unusual = data.unusual || 0

    console.log(`🎨 Status class calculation: count=${count}, unusual=${unusual}`)

    // Red: No movements or any concerning characteristics
    if (count === 0 || unusual > 0) {
      return 'status-negative'
    }

    // Green: All movements have normal characteristics
    return 'status-positive'
  })

  const emit = defineEmits(['check-in'])

  const handleCheckIn = () => {
    emit('check-in')
  }
</script>