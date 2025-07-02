<!-- index.vue -->
<template>
  <!-- Main application container with light theme -->
  <v-app theme="light">
    <!-- Welcome text -->
    <div class="welcome-content">
      <h1 class="welcome-text mb-1">Welcome, Wei Ching</h1>
      <p class="welcome-subtitle">Let's check on your little one today</p>
    </div>
    <!-- Main content area -->
    <v-main style="background-color: #faf7f2">
      <v-container
        class="pa-1 pt-2"
        fluid
      >
        <!-- Welcome section -->
        <!-- <div class="mb-6">
          <h1 class="text-h5 font-weight-medium mb-1 text-warm">
            Welcome, {{ caregiverName }}
          </h1>
        </div> -->

        <!-- Health Issue Alert -->
        <HealthAlert
          :current-child="childrenStore.currentChild"
          @view-more="handleHealthAlert"
        />

        <!-- Check-ins History section -->
        <CheckInsHistory
          :current-child="childrenStore.currentChild"
          @view-history="handleViewHistory"
        />

        <!-- Today's Summary section -->
        <TodaysSummary
          :summary-data="summaryStore.summaryData"
          @date-changed="loadDataForDate"
          @open-health-dialog="openHealthDialog"
          @open-meal-dialog="openMealDialog"
          @open-poop-dialog="openPoopDialog"
          @open-sleep-dialog="openSleepDialog"
        />

        <!-- AI Assistant section -->
        <AIAssistant />
      </v-container>
    </v-main>
    <!-- Dialog Components -->
    <MealDialog
      v-model="dialogs.meal"
      @close="dialogs.meal = false"
      @save="handleMealSave"
    />

    <SleepDialog
      v-model="dialogs.sleep"
      @close="dialogs.sleep = false"
      @save="handleSleepSave"
    />

    <PoopDialog
      v-model="dialogs.poop"
      @close="dialogs.poop = false"
      @save="handlePoopSave"
    />

    <SymptomDialog
      v-model="dialogs.health"
      @close="dialogs.health = false"
      @save="handleHealthSave"
    />
  </v-app>
</template>

<script setup lang="ts">
  import { onMounted, reactive } from 'vue'
  import { useChildrenStore } from '@/stores/children'
  import { useSummaryStore } from '@/stores/summary'
  import { useRouter } from 'vue-router'

  // Import components
  import AIAssistant from '@/components/chatbot/AIAssistant.vue'
  import HealthAlert from '@/components/HealthAlert.vue'
  import CheckInsHistory from '@/components/CheckInsHistory.vue'
  import TodaysSummary from '@/components/summaryCard/TodaysSummary.vue'

  // Import dialog components
  import MealDialog from '@/components/dialog/MealDialog.vue'
  import SleepDialog from '@/components/dialog/SleepDialog.vue'
  import PoopDialog from '@/components/dialog/PoopDialog.vue'
  import SymptomDialog from '@/components/dialog/SymptomDialog.vue'

  // Use stores and composables
  const childrenStore = useChildrenStore()
  const summaryStore = useSummaryStore()

  const router = useRouter()

  // Dialog states
  const dialogs = reactive({
    meal: false,
    sleep: false,
    poop: false,
    health: false,
  })


  // ===== SAVE HANDLERS =====

  const handleMealSave = mealData => {
    console.log('Saving meal data:', mealData)
    // TODO: Save to store
    dialogs.meal = false
  }

  const handleSleepSave = sleepData => {
    console.log('Saving sleep data:', sleepData)
    // TODO: Save to store
    dialogs.sleep = false
  }

  const handlePoopSave = poopData => {
    console.log('Saving poop data:', poopData)
    // TODO: Save to store
    dialogs.poop = false
  }

  const handleHealthSave = healthData => {
    console.log('Saving health data:', healthData)
    // TODO: Save to store
    dialogs.health = false
  }

  // ===== METHODS =====

  const openMealDialog = () => {
    dialogs.meal = true
  }

  const openSleepDialog = () => {
    dialogs.sleep = true
  }

  const openPoopDialog = () => {
    dialogs.poop = true
  }

  const openHealthDialog = () => {
    dialogs.health = true
  }

  // Load data for a specific date and current child
  const loadDataForDate = date => {
    // Load summary data from store
    summaryStore.loadSummaryForDate(date, childrenStore.currentChild.id)
  }

  // Handle health alert view more
  const handleHealthAlert = alert => {
    console.log('Health alert clicked:', alert)
    router.push({
      path: '/guidance',
      query: { tab: 'alert' },
    })
  }

  // Handle view history
  const handleViewHistory = child => {
    console.log('View history clicked:', child)
    router.push('/checkin')
    // Handle view history navigation
  }

  // ===== LIFECYCLE =====

  onMounted(() => {
    loadDataForDate(new Date())
  })
</script>

<style lang="scss" scoped></style>
