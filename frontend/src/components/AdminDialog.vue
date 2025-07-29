<template>
  <v-dialog
    v-model="dialog"
    max-width="500"
    persistent
    scrollable
  >
    <v-card style="border-radius: 16px; overflow: hidden">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-left">
          <v-icon
            class="header-icon"
            size="24"
            color="#9C27B0"
            >mdi-shield-crown</v-icon
          >
          <div class="header-text">
            <h2 class="header-title">Admin Tools</h2>
            <p class="header-subtitle">Database management for presentation</p>
          </div>
        </div>
        <v-btn
          class="close-btn"
          icon
          size="small"
          variant="text"
          @click="dialog = false"
        >
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <div class="content-section">
          <h3 class="section-title">Generate Demo Data</h3>
          <p class="section-description">
            Create realistic subtle ear infection signs over the last 3 days for both Pang and Pui Sim
          </p>
          <v-btn
            block
            class="admin-action-btn"
            color="#4CAF50"
            prepend-icon="mdi-database-plus"
            variant="flat"
            :loading="isGeneratingData"
            @click="generateEarInfectionData"
          >
            Generate Ear Infection Signs (3 days)
          </v-btn>
        </div>

        <div class="content-section">
          <h3 class="section-title">Clear Demo Data</h3>
          <p class="section-description">
            Remove data from the last 3 days to reset for new demonstrations
          </p>
          <v-btn
            block
            class="admin-action-btn"
            color="#FF5722"
            prepend-icon="mdi-delete-sweep"
            variant="flat"
            :loading="isClearingCheckins"
            @click="clearLast3DaysCheckins"
          >
            Clear Last 3 Days Check-ins
          </v-btn>
          <v-btn
            block
            class="admin-action-btn"
            color="#FF9800"
            prepend-icon="mdi-chat-remove"
            variant="flat"
            :loading="isClearingChats"
            @click="clearLast3DaysChats"
          >
            Clear Last 3 Days Chats
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import axios from 'axios'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
  })

  const emit = defineEmits(['update:modelValue'])

  // Loading states
  const isGeneratingData = ref(false)
  const isClearingCheckins = ref(false)
  const isClearingChats = ref(false)

  const dialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })

  // Generate realistic ear infection data for last 3 days
  const generateEarInfectionData = async () => {
    try {
      isGeneratingData.value = true
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      await axios.post(`${baseUrl}/admin/generate-ear-infection-data`, {
        days: 3,
        children: [1, 2] // Pui Sim and Pang
      })
      
      console.log('✅ Generated ear infection data successfully')
      
      // TODO: Show success notification
      
    } catch (error) {
      console.error('❌ Error generating ear infection data:', error)
      // TODO: Show error notification
    } finally {
      isGeneratingData.value = false
    }
  }

  // Clear last 3 days check-in data
  const clearLast3DaysCheckins = async () => {
    try {
      isClearingCheckins.value = true
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      await axios.delete(`${baseUrl}/admin/clear-checkins`, {
        params: { days: 3 }
      })
      
      console.log('✅ Cleared last 3 days check-ins successfully')
      
      // TODO: Show success notification
      
    } catch (error) {
      console.error('❌ Error clearing check-ins:', error)
      // TODO: Show error notification
    } finally {
      isClearingCheckins.value = false
    }
  }

  // Clear last 3 days chat data
  const clearLast3DaysChats = async () => {
    try {
      isClearingChats.value = true
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      await axios.delete(`${baseUrl}/admin/clear-chats`, {
        params: { days: 3 }
      })
      
      console.log('✅ Cleared last 3 days chats successfully')
      
      // TODO: Show success notification
      
    } catch (error) {
      console.error('❌ Error clearing chats:', error)
      // TODO: Show error notification
    } finally {
      isClearingChats.value = false
    }
  }
</script>

<style lang="scss" scoped>
.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.header-icon {
  margin-top: 2px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #000;
  line-height: 1.2;
}

.header-subtitle {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

.close-btn {
  margin-top: -4px;
  margin-right: -4px;
}

.dialog-content {
  padding: 20px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  flex: 1;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.section-description {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.admin-action-btn {
  height: 44px !important;
  margin-bottom: 8px;
}

:deep(.v-btn--variant-flat) {
  color: white !important;
}

:deep(.v-btn--variant-flat .v-icon) {
  color: white !important;
}
</style>