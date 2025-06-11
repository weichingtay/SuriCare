<template>
  <BaseSummaryCard
    title="Sleep"
    icon="mdi-sleep"
    :main-value="totalHours"
    unit="hours"
    :status-note="statusNote"
    status-class="status-positive"
    @check-in="handleCheckIn"
  >
    <template #breakdown>
      <div class="sleep-breakdown">
        <div class="breakdown-item">
          <span class="breakdown-value">{{ sleepData?.napHours || 7 }}h</span>
          <span class="breakdown-label">Nap</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-value">{{ sleepData?.nightHours || 5 }}h</span>
          <span class="breakdown-label">Night</span>
        </div>
      </div>
    </template>
  </BaseSummaryCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseSummaryCard from './BaseSummaryCard.vue'

const props = defineProps({
  sleepData: {
    type: Object,
    default: () => ({
      nightHours: 7,
      napHours: 5,
      wakeCount: 0
    })
  }
})

const totalHours = computed(() => {
  const total = (props.sleepData?.nightHours || 0) + (props.sleepData?.napHours || 0)
  return total % 1 === 0 ? total : total.toFixed(1)
})

const statusNote = computed(() => {
  if (props.sleepData?.wakeCount > 2) {
    return "Restless night with multiple wake-ups"
  } else if (props.sleepData?.wakeCount > 0) {
    return "Some interruptions during sleep"
  }
  return "Jennie slept well through today"
})

const handleCheckIn = () => {
  console.log('Sleep check-in clicked')
}
</script>

<style scoped>
.sleep-breakdown {
  display: flex;
  gap: 24px;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.breakdown-value {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.breakdown-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}
</style>
