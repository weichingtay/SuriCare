<!-- index.vue -->
<template>
  <!-- Main application container with light theme -->

  <!-- Main content area -->
  <!-- <v-main style="background-color: #FAF9F5; margin-top: -70px"> -->
  <v-container fluid>
    <!-- Welcome and Alert section -->
    <v-row class="mb-2" align="center">
      <v-col cols="4">
        <!-- <div class="d-flex flex-column"> -->

        <!-- TODO: Make this welcome section nicer
              maybe can make all the fonts different? -->
        <div class="text-h5 font-weight-medium mb-2">Welcome, {{ caregiverName }}!</div>
        <div>
          <p class="text-subtitle-1 mb-0">{{ currentChild.name }}'s Health Issue</p>
        </div>
        <!-- </div> -->
      </v-col>

    </v-row>

    <v-row>
      <v-col cols="12" class="d-flex align-right">
        <!-- TODO: show an alert button if closed -->
        <!-- Alert notification -->
        <AlertNotification :alert="currentAlert" class="ml-auto" />
      </v-col>

    </v-row>
    <!-- AI Assistant section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <AiAssistant />
      </v-col>
    </v-row>

    <!-- Today's Summary section -->
    <div class="mb-4">
      <div class="d-flex align-center mb-3">
        <h2 class="text-h6">Today's Summary</h2>

        <!-- Date picker -->
        <v-menu v-model="datePickerMenu" :close-on-content-click="false" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="text" size="small" class="ml-2">
              <v-icon size="small">mdi-calendar</v-icon>
              <span class="ml-1">{{ formattedSelectedDate }}</span>
              <v-icon size="small">mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-card>
            <v-date-picker v-model="selectedDate" @update:model-value="handleDateChange" :max="new Date()"
              color="#FAF9F5"></v-date-picker>
          </v-card>
        </v-menu>
      </div>

      <!-- Summary cards grid -->
      <v-row>
        <v-col v-for="type in cardTypes" :key="type" cols="12" sm="6" md="3">
          <SummaryCard v-bind="transformedCards[type]" />
        </v-col>
      </v-row>
    </div>

    <!-- Historical Overview -->
    <HistoricalOverview />
  </v-container>
  <!-- </v-main> -->
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useChildStore } from '@/stores/childStore'
import { useAlertStore } from '@/stores/alertStore'
import { useSummaryStore } from '@/stores/summaryStore'
import { useDateFormatter } from '@/composables/useDateFormatter'
import { useSummaryCards } from '@/composables/useSummaryCards'
import { useRouter } from 'vue-router'

// Import components
// import ChildSelector from '@/components/ChildSelector.vue'
import AlertNotification from '@/components/AlertNotification.vue'
import SummaryCard from '@/components/SummaryCard.vue'
import AiAssistant from '@/components/AiAssistant.vue'
import ChildStats from '@/components/ChildStats.vue'
import HistoricalOverview from '@/components/HistoricalOverview.vue'

// Initialize stores and router
const router = useRouter()
const childStore = useChildStore()
const alertStore = useAlertStore()
const summaryStore = useSummaryStore()

// Get reactive refs from stores
const { currentChild, caregiverName } = storeToRefs(childStore)
const { currentAlert } = storeToRefs(alertStore)
const { selectedDate, summaryData } = storeToRefs(summaryStore)

// Date picker menu state
const datePickerMenu = ref(false)

// Use composables
const { formattedSelectedDate } = useDateFormatter(selectedDate)
const { transformedCards, cardTypes } = useSummaryCards(summaryData)

// Handle date change
const handleDateChange = (newDate) => {
  datePickerMenu.value = false
  summaryStore.loadDataForDate(newDate, currentChild.value.id)
}

// Handle check-in button click
const handleCheckIn = () => {
  router.push('/check-in')
}
</script>

<style scoped>
/* Check-in button styling */
.check-in-btn {
  border-radius: 12px;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  text-transform: none;
  padding: 20px 24px;
  transition: all 0.2s ease;
  background-color: #800020 !important;
  /* Maroon */
  color: #F5E6D3 !important;
  /* Beige */
}

.check-in-btn:hover {
  transform: translateY(-2px);
  background-color: #9A0025 !important;
  /* Slightly lighter maroon on hover */
}

/* Override Vuetify's default button styles */
:deep(.check-in-btn .v-btn__content),
:deep(.check-in-btn .v-icon) {
  color: #F5E6D3 !important;
}
</style>
