<template>
  <v-card class="health-summary-card" elevation="0">
    <!-- Card Header -->
    <div class="card-header">
      <div class="d-flex align-center">
        <v-icon color="error" size="20" class="mr-2">mdi-heart</v-icon>
        <span class="card-title">Health</span>
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
      <!-- Main Value - Health Status -->
      <div class="main-value health-status">
        {{ healthData?.status || 'Healthy' }}
      </div>

      <!-- Status Note -->
      <div class="status-note">
        {{ healthData?.message || 'No symptoms today' }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  healthData: {
    type: Object,
    default: () => ({
      status: 'Healthy',
      message: 'No symptoms today'
    })
  }
})
</script>

<style scoped>
.health-summary-card {
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
  font-size: 20px;
  font-weight: 600;
  color: #333;
  line-height: 1;
  margin-bottom: 16px;
}

.health-status {
  font-size: 20px !important;
}

.status-note {
  font-size: 12px;
  color: #4caf50;
  margin-top: 8px;
  line-height: 1.3;
}
</style>