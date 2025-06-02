<!-- index.vue -->
<template>
  <!-- Main application container with light theme -->
  <v-app theme="light">
    <!-- Navigation sidebar -->
    <NavigationSidebar />

    <!-- Top navigation bar with child selector -->
    <v-toolbar class="fixed-tabs-bar">
      <v-app-bar elevation="1" color="grey-lighten-5" style="padding-left: 20px;">
        <div class="d-flex align-center" style="width: 100%">
          <ChildSelector />
          <v-divider vertical class="mx-4" />
          <ChildStats :child="currentChild" />
        </div>
      </v-app-bar>
    </v-toolbar>

    <!-- Main content area -->
    <v-main style="background-color: #FAF9F5; padding-left: 90px !important; margin-top: -70px">
      <v-container fluid>
        <!-- Welcome and Alert section -->
        <v-row class="mb-4" align="center">
          <v-col cols="12" md="2">
            <div class="d-flex flex-column">

              <!-- TODO: Make this welcome section nicer 
              maybe can make all the fonts different? -->
              <div class="text-h5 font-weight-medium mb-2">Welcome, {{ caregiverName }}!</div>
              <div>
                <p class="text-subtitle-1 mb-0">{{ currentChild.name }}'s Important Alerts</p>
              </div>
            </div>
          </v-col>
          
          <v-col cols="12" md="4" class="d-flex align-center">
            <v-btn
              class="check-in-btn"
              size="large"
              block
              elevation="1"
              @click="handleCheckIn"
            >
              <v-icon start size="24" class="mr-2">mdi-plus-circle</v-icon>
              New Check In
            </v-btn>
          </v-col>
          
          <v-col cols="12" md="6" class="d-flex align-right">
            <!-- Alert notification -->
            <AlertNotification 
              :alert="currentAlert"
              class="ml-auto"
            />
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

        <!-- Historical Overview -->
        <HistoricalOverview />
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
import { useRouter } from 'vue-router'

// Import components
import NavigationSidebar from '../components/NavigationSidebar.vue'
import ChildSelector from '../components/ChildSelector.vue'
import AlertNotification from '../components/AlertNotification.vue'
import SummaryCard from '../components/SummaryCard.vue'
import AiAssistant from '../components/AiAssistant.vue'
import ChildStats from '../components/ChildStats.vue'
import HistoricalOverview from '../components/HistoricalOverview.vue'

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

/* Check-in button styling */
.check-in-btn {
  border-radius: 12px;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  text-transform: none;
  padding: 20px 24px;
  transition: all 0.2s ease;
  background-color: #800020 !important; /* Maroon */
  color: #F5E6D3 !important; /* Beige */
}

.check-in-btn:hover {
  transform: translateY(-2px);
  background-color: #9A0025 !important; /* Slightly lighter maroon on hover */
}

/* Override Vuetify's default button styles */
:deep(.check-in-btn .v-btn__content),
:deep(.check-in-btn .v-icon) {
  color: #F5E6D3 !important;
}
</style>