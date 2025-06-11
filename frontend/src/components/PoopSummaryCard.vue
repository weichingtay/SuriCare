<template>
  <BaseSummaryCard
    title="Poop"
    icon="mdi-emoticon-poop"
    :main-value="poopData?.count || 2"
    unit="times"
    :status-note="statusNote"
    status-class="status-positive"
    @check-in="handleCheckIn"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseSummaryCard from './BaseSummaryCard.vue'

const props = defineProps({
  poopData: {
    type: Object,
    default: () => ({
      count: 2,
      unusual: 0,
      normal: 2
    })
  }
})

const statusNote = computed(() => {
  const unusualCount = props.poopData?.unusual || 0
  return `${unusualCount} Unusual`
})

const handleCheckIn = () => {
  console.log('Poop check-in clicked')
}
</script>
