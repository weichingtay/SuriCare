<template>
  <v-card class="sleep-summary-card" elevation="0">
    <!-- Card Header -->
    <div class="card-header">
      <div class="d-flex align-center">
        <v-icon color="error" size="20" class="mr-2">mdi-sleep</v-icon>
        <span class="card-title">Sleep</span>
      </div>
      <v-btn 
        size="x-small" 
        variant="flat" 
        color="error" 
        class="check-in-btn"
      >
        Check In
      </v-btn>
    </div>

    <!-- Card Content -->
    <v-card-text class="card-content pa-0">
      <!-- Main Value -->
      <div class="main-value">
        {{ totalHours }} <span class="unit">hours</span>
      </div>

      <!-- Sleep Breakdown -->
      <div class="sleep-breakdown">
        <div class="sleep-item">
          <span class="sleep-value">{{ sleepData?.napHours || 7 }}h</span>
          <span class="sleep-label">Nap</span>
        </div>

        <div class="sleep-item">
          <span class="sleep-value">{{ sleepData?.nightHours || 5 }}h</span>
          <span class="sleep-label">Night</span>
        </div>
      </div>

      <!-- Status Note -->
      <div class="status-note">
        {{ statusNote }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

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

// Calculate total sleep hours
const totalHours = computed(() => {
  const total = (props.sleepData?.nightHours || 0) + (props.sleepData?.napHours || 0)
  return total % 1 === 0 ? total : total.toFixed(1)
})

// Generate status note based on sleep data
const statusNote = computed(() => {
  if (props.sleepData?.wakeCount > 2) {
    return "Restless night with multiple wake-ups"
  } else if (props.sleepData?.wakeCount > 0) {
    return "Some interruptions during sleep"
  }
  return "Jennie slept well through today"
})
</script>

<style scoped>
.sleep-summary-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.check-in-btn {
  font-size: 10px !important;
  padding: 4px 8px !important;
  height: 24px !important;
  min-width: auto !important;
  text-transform: none !important;
}

.card-content {
  padding: 0 !important;
}

.main-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  line-height: 1;
  margin-bottom: 16px;
}

.unit {
  font-size: 14px;
  font-weight: 400;
  color: #666;
}

.sleep-breakdown {
  margin-bottom: 12px;
  display: flex;
  gap: 24px;
}

.sleep-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sleep-value {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.sleep-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.status-note {
  font-size: 12px;
  color: #4caf50;
  margin-top: 8px;
  line-height: 1.3;
}
</style>