<!-- index.vue -->
<template>
  <!-- Main application container with light theme -->
  <v-app theme="light">
    <!-- Main content area -->
    <v-main style="background-color: #faf7f2">
      <v-container
        fluid
        class="pa-1 pt-2"
      >
        <!-- Welcome section -->
        <div class="mb-6">
          <h1 class="text-h5 font-weight-medium mb-1 text-warm">
            Welcome, {{ caregiverName }}
          </h1>
        </div>

        <!-- Health Issue Alert -->
        <HealthAlert
          :currentChild="childrenStore.currentChild"
          @view-more="handleHealthAlert"
        />

        <!-- Check-ins History section -->
        <CheckInsHistory
          :currentChild="childrenStore.currentChild"
          @view-history="handleViewHistory"
        />

        <!-- Today's Summary section -->
        <TodaysSummary
          :summaryData="summaryStore.summaryData"
          @date-changed="loadDataForDate"
        />

        <!-- AI Assistant section -->
        <AIAssistant @send-message="aiChat.sendMessage" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useChildrenStore } from '@/stores/children'
  import { useSummaryStore } from '@/stores/summary'
  import { useAIChat } from '@/composables/useAIChat'

  // Import components
  import AIAssistant from '@/components/AIAssistant.vue'
  import HealthAlert from '@/components/HealthAlert.vue'
  import CheckInsHistory from '@/components/CheckInsHistory.vue'
  import TodaysSummary from '@/components/TodaysSummary.vue'

  // Use stores and composables
  const childrenStore = useChildrenStore()
  const summaryStore = useSummaryStore()
  const aiChat = useAIChat()

  // Caregiver's name - in production, this would come from authentication
  const caregiverName = ref('Wei Ching')

  // ===== METHODS =====

  // Load data for a specific date and current child
  const loadDataForDate = (date) => {
    // Load summary data from store
    summaryStore.loadSummaryForDate(date, childrenStore.currentChild.id)
  }

  // Handle health alert view more
  const handleHealthAlert = (alert) => {
    console.log('Health alert clicked:', alert)
    // Handle health alert navigation
  }

  // Handle view history
  const handleViewHistory = (child) => {
    console.log('View history clicked:', child)
    // Handle view history navigation
  }

  // ===== LIFECYCLE =====

  onMounted(() => {
    loadDataForDate(new Date())
  })
</script>

<style lang="scss" scoped>
  @import '@/styles/settings.scss';
</style>
