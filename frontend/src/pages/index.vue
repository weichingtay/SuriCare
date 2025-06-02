<!-- index.vue -->
<template>
  <!-- Main application container with light theme -->
  <v-app theme="light">
    <!-- Navigation sidebar -->
    <NavigationSidebar />

    <!-- Top navigation bar with child selector -->
    <v-toolbar class="fixed-tabs-bar">
      <v-app-bar elevation="1" color="grey-lighten-5" style="padding-left: 20px;">
        <ChildSelector />
      </v-app-bar>
    </v-toolbar>

    <!-- Main content area -->
    <v-main style="background-color: #FAF9F5; padding-left: 90px !important; margin-top: -70px">
      <v-container fluid>
        <!-- Welcome section -->
        <div class="text-h5 font-weight-medium mb-2">Welcome, {{ caregiverName }}!</div>
        
        <div class="mb-4">
          <p class="text-subtitle-1 mb-0">{{ currentChild.name }}'s Important Alerts</p>
        </div>

        <!-- Alert notification -->
        <AlertNotification 
          :alert="currentAlert"
          class="mb-4"
        />

        <!-- Check-in prompt -->
        <CheckInPrompt />

        <!-- Today's Summary section -->
        <div class="mb-4">
          <div class="d-flex align-center mb-3">
            <h2 class="text-h6">Today's Summary</h2>
            
            <!-- Date picker -->
            <v-menu
              v-model="datePickerMenu"
              :close-on-content-click="false"
              location="bottom"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="text"
                  size="small"
                  class="ml-2"
                >
                  <v-icon size="small">mdi-calendar</v-icon>
                  <span class="ml-1">{{ formattedSelectedDate }}</span>
                  <v-icon size="small">mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              
              <v-card>
                <v-date-picker
                  v-model="selectedDate"
                  @update:model-value="handleDateChange"
                  :max="new Date()"
                  color="#FAF9F5"
                ></v-date-picker>
              </v-card>
            </v-menu>
          </div>

          <!-- Summary cards grid -->
          <v-row>
            <v-col 
              v-for="type in cardTypes" 
              :key="type"
              cols="12" 
              sm="6" 
              md="3"
            >
              <SummaryCard v-bind="transformedCards[type]" />
            </v-col>
          </v-row>
        </div>

        <!-- AI Assistant -->
        <AiAssistant />

        <!-- Quick Actions -->
        <QuickActions />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useChildStore } from '../stores/childStore'
import { useAlertStore } from '../stores/alertStore'
import { useSummaryStore } from '../stores/summaryStore'
import { useDateFormatter } from '../composables/useDateFormatter'
import { useSummaryCards } from '../composables/useSummaryCards'

// Import components
import NavigationSidebar from '../components/NavigationSidebar.vue'
import ChildSelector from '../components/ChildSelector.vue'
import AlertNotification from '../components/AlertNotification.vue'
import CheckInPrompt from '../components/CheckInPrompt.vue'
import SummaryCard from '../components/SummaryCard.vue'
import AiAssistant from '../components/AiAssistant.vue'
import QuickActions from '../components/QuickActions.vue'

// Initialize stores
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
</script>

<style scoped>
/* Navigation item height adjustment */
.nav-item {
  min-height: 30px !important;
}

/* Sticky toolbar positioning */
.fixed-tabs-bar {
  position: -webkit-sticky;
  position: sticky;
  top: 0rem;
  z-index: 2;
}

/* Navigation drawer styling */
:deep(.v-navigation-drawer) {
  position: fixed !important;
}

/* Rail width when drawer is minimized */
:deep(.v-navigation-drawer--rail) {
  width: 90px !important;
}
</style>