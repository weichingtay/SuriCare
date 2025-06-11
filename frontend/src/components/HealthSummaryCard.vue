<template>
  <BaseSummaryCard
    title="Health"
    icon="mdi-heart"
    :main-value="healthData?.status || 'Healthy'"
    :status-note="healthData?.message || 'No symptoms today'"
    status-class="status-positive"
    @check-in="handleCheckIn"
  />
</template>

<script setup>
import BaseSummaryCard from './BaseSummaryCard.vue'

const props = defineProps({
  healthData: {
    type: Object,
    default: () => ({
      status: 'Healthy',
      message: 'No symptoms today'
    })
  }
})

const handleCheckIn = () => {
  console.log('Health check-in clicked')
}
</script>

<style scoped>
/* Health card has larger main value */
:deep(.main-value) {
  font-size: 20px !important;
}
</style>
