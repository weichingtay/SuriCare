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
          <span class="breakdown-value">{{ sleepData?.napHours || 0 }}h</span>
          <span class="breakdown-label">Nap</span>
        </div>
        <div class="breakdown-item">
          <span class="breakdown-value">{{ sleepData?.nightHours || 0 }}h</span>
          <span class="breakdown-label">Night</span>
        </div>
      </div>
    </template>
  </BaseSummaryCard>
</template>

<script setup>
import { computed } from 'vue'
import { useSleepStore } from '@/stores/sleep'
import BaseSummaryCard from '@/components/summaryCard/BaseSummaryCard.vue'

const sleepStore = useSleepStore()
const currentDate = new Date().toISOString().split('T')[0]
const sleepData = computed(() => sleepStore.getSleepForDate(currentDate))

const totalHours = computed(() => {
  const total = (sleepData.value?.nightHours || 0) + (sleepData.value?.napHours || 0)
  return total % 1 === 0 ? total : total.toFixed(1)
})

const statusNote = computed(() => {
  if (sleepData.value?.wakeCount > 2) {
    return 'Restless night with multiple wake-ups'
  } else if (sleepData.value?.wakeCount > 0) {
    return 'Some interruptions during sleep'
  }
  return 'Jennie slept well through today'
})

const emit = defineEmits(['check-in'])

const handleCheckIn = () => {
  emit('check-in')
}
</script>
