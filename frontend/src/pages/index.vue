<template>
  <v-app theme="light">
    <!-- Navigation Drawer Component -->
    <AppNavigation @navigate="handleNavigation" />
    
    <!-- App Header Component with child selection -->
    <AppHeader 
      :children="children"
      :current-child="currentChild"
      @select-child="selectChild"
    />
    
    <!-- Main Content Area -->
    <v-main style="background-color: #FAF9F5; padding-left: 100px !important; margin-top: -60px">
      <v-container fluid>
        <!-- Welcome Section with alert -->
        <WelcomeSection 
          :caregiver-name="caregiverName"
          :child-name="currentChild.name"
          :current-alert="currentAlert"
          @dismiss-alert="currentAlert = null"
        />
        
        <!-- Check-in Section -->
        <CheckInSection 
          :child-name="currentChild.name"
          @open-checkin="openCheckIn"
        />
        
        <!-- Summary Section with Date Picker -->
        <SummarySection 
          v-model="selectedDate"
          :formatted-date="formattedSelectedDate"
          @date-change="handleDateChange"
        >
          <!-- Summary Cards -->
          <SummaryCards 
            :sleep-hours="childData.sleep?.hours"
            :sleep-quality="childData.sleep?.quality"
            :sleep-bedtime="formatTimeForDisplay(childData.sleep?.bedtime)"
            :sleep-wake-time="formatTimeForDisplay(childData.sleep?.wakeTime)"
            :food-meals="childData.food?.meals || []"
            :food-snacks="childData.food?.snacks || []"
            :food-water-intake="childData.food?.waterIntake"
            :mood="childData.mood?.mood"
            :mood-activities="childData.mood?.activities || []"
            :mood-notes="childData.mood?.notes"
          />
        </SummarySection>

        <!-- Ask SuriAI section -->
        <v-card elevation="0" class="mb-6">
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-avatar size="40" class="mr-3">
                <div class="text-h5">🤖</div>
              </v-avatar>
              <div>
                <h3 class="text-h6">Ask SuriAI About Your Child</h3>
                <p class="text-body-2 text-grey">
                  Powered by AI for childcare guidance. SuriAI can help with sleep patterns, meal suggestions, development milestones, and more.
                </p>
              </div>
            </div>
            <v-text-field
              placeholder="Type your questions here"
              variant="outlined"
              density="compact"
              append-inner-icon="mdi-send"
              hide-details
            ></v-text-field>
          </v-card-text>
        </v-card>

        <!-- Quick Actions section -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card elevation="0" class="mb-4">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon size="large" class="mr-3">mdi-chart-line</v-icon>
                  <div>
                    <h4 class="text-subtitle-1">Dashboard</h4>
                    <p class="text-body-2 text-grey">
                      Display data trends using interactive graphs and charts for sleep duration, mood distribution, and dietary habits
                    </p>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card elevation="0" class="mb-4">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon size="large" class="mr-3">mdi-chart-bar</v-icon>
                  <div>
                    <h4 class="text-subtitle-1">Guidance Hub</h4>
                    <p class="text-body-2 text-grey">
                      Get personalised recommendations based on child's daily checkins
                    </p>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { storeToRefs } from 'pinia'

// Import components
import AppNavigation from '@/components/AppNavigation.vue'
import AppHeader from '@/components/AppHeader.vue'
import WelcomeSection from '@/components/WelcomeSection.vue'
import CheckInSection from '@/components/CheckInSection.vue'
import SummarySection from '@/components/SummarySection.vue'
import SummaryCards from '@/components/SummaryCards.vue'

// Import stores
import { useChildStore } from '@/stores/child.store'
import { useThemeStore } from '@/stores/theme.store'

// Import composables
import { useDateUtils, formatTime } from '@/composables/useDateUtils'
import { useChildData } from '@/composables/useChildData'

// Initialize stores
const childStore = useChildStore()
const themeStore = useThemeStore()

// Initialize date utilities
const dateUtils = useDateUtils()

// Make formatTime available in template
const formatTimeForDisplay = formatTime

// Destructure store state
const { children, currentChild, caregiverName } = storeToRefs(childStore)

// Initialize child data
const { 
  selectedDate,
  currentAlert,
  childData,
  formattedSelectedDate,
  handleDateChange,
  loadDataForDate,
  selectChild,
  openCheckIn
} = useChildData()

// Handle navigation events from AppNavigation
const handleNavigation = (route) => {
  console.log('Navigating to:', route)
  // In a real app, you would use vue-router here
  // router.push(route)
}

// Initialize data on component mount
onMounted(() => {
  // Load initial data for current child and today's date
  loadDataForDate(selectedDate.value)
})
</script>

<style scoped>
/* Custom styles for this component only */
.opacity-25 {
  opacity: 0.25;
}

/* Navigation item styling */
.nav-item {
  min-height: 90px !important;
}

.fixed-tabs-bar {
    position: -webkit-sticky;
    position: sticky;
    top: 0rem;
    z-index: 2;
}

/* .nav-item .v-list-item__content {
  padding: 8px 0;
} */

/* Override Vuetify's default navigation drawer positioning */
:deep(.v-navigation-drawer) {
  position: fixed !important;
  height: 100vh !important;
  z-index: 1000 !important;
}

/* Ensure proper rail width */
:deep(.v-navigation-drawer--rail) {
  width: 100px !important;
}
</style>