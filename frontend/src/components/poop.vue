<template>
  <v-card class="poop-summary-card" elevation="0">
    <!-- Card Header -->
    <div class="card-header">
      <div class="d-flex align-center">
        <v-icon color="error" size="20" class="mr-2">mdi-emoticon-poop</v-icon>
        <span class="card-title">Poop</span>
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
        {{ poopData?.count || 2 }} <span class="unit">times</span>
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
  poopData: {
    type: Object,
    default: () => ({
      count: 2,
      unusual: 0,
      normal: 2
    })
  }
})

// Generate status note based on poop data
const statusNote = computed(() => {
  const unusualCount = props.poopData?.unusual || 0
  return `${unusualCount} Unusual`
})
</script>

<style scoped>
.poop-summary-card {
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

.status-note {
  font-size: 12px;
  color: #4caf50;
  margin-top: 8px;
  line-height: 1.3;
}
</style>