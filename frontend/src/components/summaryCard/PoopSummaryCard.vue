<template>
  <BaseSummaryCard
    title="Bowel Movements"
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

const handleCheckIn = () => {
  console.log('Poop check-in clicked')
  // TODO: Implement check-in functionality using poopStore.updatePoopForDate
}
</script>
