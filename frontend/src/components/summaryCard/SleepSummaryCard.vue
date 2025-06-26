<!-- <template>
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
</script> -->


<!-- src/components/summaryCard/SleepSummaryCard.vue -->
<template>
  <BaseSummaryCard
    icon="mdi-sleep"
    :main-value="totalHours"
    :status-class="statusClass"
    :status-note="statusNote"
    title="Sleep"
    unit="hours"
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

<script setup lang="ts">
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

  // Enhanced status logic based on actual sleep data
  const statusNote = computed(() => {
    const data = sleepData.value
    if (!data) return 'No sleep data recorded'

    const total = parseFloat(totalHours.value)
    const wakeCount = data.wakeCount || 0
    const nightHours = data.nightHours || 0
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const napHours = data.napHours || 0

    // Check for concerning patterns first
    if (total < 8) {
      return `Only ${total}h total sleep - quite short`
    } else if (wakeCount >= 3) {
      return `Restless night with ${wakeCount} wake-ups`
    } else if (wakeCount === 2) {
      return 'Some sleep interruptions'
    } else if (wakeCount === 1) {
      return 'One brief wake-up'
    } else if (total >= 12) {
      return `Long ${total}h sleep - very restful`
    } else if (total >= 10) {
      return 'Good solid sleep'
    } else if (total >= 9) {
      return 'Decent sleep duration'
    } else {
      return 'Moderate sleep'
    }
  })

  // Status class based on sleep quality
  const statusClass = computed(() => {
    const data = sleepData.value
    if (!data) return 'status-neutral'

    const total = parseFloat(totalHours.value)
    const wakeCount = data.wakeCount || 0

    // Red: Poor sleep (short duration or many interruptions)
    if (total < 8 || wakeCount >= 3) {
      return 'status-negative'
    }
    // Yellow: Moderate sleep (some issues)
    else if (total < 9 || wakeCount >= 1) {
      return 'status-warning'
    }
    // Green: Good sleep (adequate duration, minimal interruptions)
    else {
      return 'status-positive'
    }
  })

  const emit = defineEmits(['check-in'])

  const handleCheckIn = () => {
    emit('check-in')
  }
</script>
