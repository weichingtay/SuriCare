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

const props = defineProps({
  date: {
    type: Date,
    required: true,
  },
})

const sleepStore = useSleepStore()

// Convert date to string (following your pattern)
const dateString = computed(() => {
  const year = props.date.getFullYear()
  const month = String(props.date.getMonth() + 1).padStart(2, '0')
  const day = String(props.date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const sleepData = computed(() => sleepStore.getSleepForDate(dateString.value))

const totalHours = computed(() => {
  const data = sleepData.value
  
  // Check if there's no data at all (no input made)
  if (!data || !data.lastUpdated) {
    return '-'  // Show dash when no input
  }
  
  // Show actual total (including 0) when there is input data
  const total = data.totalHours || 0
  return total % 1 === 0 ? total : total.toFixed(1)
})

// Enhanced status logic based on actual sleep data
const statusNote = computed(() => {
  const data = sleepData.value

  if (!data || !data.lastUpdated) {
    return 'No sleep data for this date'
  }

  const total = parseFloat(data.totalHours?.toString() || '0')
  const wakeCount = data.wakeCount || 0
  const sessions = data.sleepSessions || 0

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
  } else if (sessions > 1) {
    return `${sessions} sleep sessions today`
  } else {
    return 'Moderate sleep'
  }
})

// Status class based on sleep quality (following your pattern)
const statusClass = computed(() => {
  const data = sleepData.value
  
  if (!data || !data.lastUpdated) {
    return 'status-neutral'
  }

  const total = parseFloat(data.totalHours?.toString() || '0')
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

<style scoped>
.sleep-breakdown {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.breakdown-value {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.breakdown-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}
</style>