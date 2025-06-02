<!-- index.vue -->
<template>
  <!-- Main application container with light theme -->
  <v-app theme="light">
    <!-- Fixed sidebar navigation -->
    <v-navigation-drawer
      permanent
      rail
      rail-width="80"
      color="white"
      elevation="2"
    >
      <!-- Logo section at top of sidebar -->
      <template v-slot:prepend>
        <div class="pa-3 text-center">
          <v-img 
            width="50" 
            height="50" 
            class="ml-2" 
            src="https://uccb0214b5a8c4d3dfa90c64ab26.previews.dropboxusercontent.com/p/thumb/ACrOe3_DrJ1cwNxA3AD9pdhTUVbvPLhaavkY114wKWApZzD-LW7Xr7tAtoTRAGpo6OblVMTAc9Vg70-18mlXMXESnClylzP6XbCSzihZpJaMSQxw4wKO0jB8JSIWY1doPe8ztk8FK0ehMhEy-bqPequjh030VrWvA67LyNXbBM8TyyAewn6clpc9Y6E9WoLXAkTaRKQ2KLNUZJutViP74130f68qjpMWSDFcEQfzaxsaViVKC0fgYS2nfMkACNBOQU_q0fLjukhKZA929nwrpPspDIf264LTnJgbpDlAiGFlwAGBmb9vO5zOKDd3Uigi4vmy88TBvnWpeIiwiDwKteIMGIOFWDvdqhlU0IEDOFZuAeP_ylkmGbta07iH8G41bLQE-eefyDlLSdAG-j8GhCuI/p.jpeg?is_prewarmed=true"
          />
        </div>
      </template>

      <!-- Navigation menu items -->
      <v-list density="compact" nav>
        <!-- Home -->
        <v-list-item value="home" class="nav-item">
          <template v-slot:default>
            <div class="text-center">
              <v-icon size="25">mdi-home</v-icon>
              <div class="text-caption mt-1" style="font-size: 11px !important;">Home</div>
            </div>
          </template>
        </v-list-item>

        <!-- Check-in -->
        <v-list-item value="checkin" class="nav-item">
          <template v-slot:default>
            <div class="text-center">
              <v-icon size="25">mdi-clipboard-check</v-icon>
              <div class="text-caption mt-1" style="font-size: 11px !important;">Check-In</div>
            </div>
          </template>
        </v-list-item>

        <!-- Dashboard -->
        <v-list-item value="dashboard" class="nav-item">
          <template v-slot:default>
            <div class="text-center">
              <v-icon size="25">mdi-chart-line</v-icon>
              <div class="text-caption mt-1" style="font-size: 11px !important;">Dashboard</div>
            </div>
          </template>
        </v-list-item>

        <!-- Chatbot -->
        <v-list-item value="chatbot" class="nav-item">
          <template v-slot:default>
            <div class="text-center">
              <v-icon size="25">mdi-chat</v-icon>
              <div class="text-caption mt-1" style="font-size: 11px !important;">Chatbot</div>
            </div>
          </template>
        </v-list-item>

        <!-- Guidance -->
        <v-list-item value="guidance" class="nav-item">
          <template v-slot:default>
            <div class="text-center">
              <v-icon size="25">mdi-book-open-variant</v-icon>
              <div class="text-caption mt-1" style="font-size: 11px !important;">Guidance</div>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Top navigation bar with child selector -->
    <v-toolbar class="fixed-tabs-bar">
      <v-app-bar elevation="1" color="grey-lighten-5" style="padding-left: 20px;">
        <!-- Child profile dropdown -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="text" class="text-none">
              <!-- Child avatar -->
              <v-avatar size="32" class="mr-2">
                <v-img :src="currentChild.avatar"></v-img>
              </v-avatar>
              <!-- Child info -->
              <div class="d-flex flex-column align-start mr-2">
                <span>{{ currentChild.name }}</span>
                <span class="text-caption text-grey">{{ currentChild.age }} years old</span>
              </div>
              <v-icon>mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <!-- Dropdown list of children -->
          <v-list>
            <v-list-item
              v-for="child in children"
              :key="child.id"
              @click="selectChild(child)"
            >
              <template v-slot:prepend>
                <v-avatar size="32">
                  <v-img :src="child.avatar"></v-img>
                </v-avatar>
              </template>
              <v-list-item-title>{{ child.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ child.age }} years old</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-menu>
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

        <!-- Check-in prompt card -->
        <v-card class="mb-6" elevation="1">
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <h2 class="text-h6">Check In</h2>
              <v-btn
                icon="mdi-plus"
                size="small"
                variant="tonal"
                color="pink"
                class="ml-auto"
                @click="openCheckIn"
              ></v-btn>
            </div>
            <p class="text-body-2 text-grey">
              Log in {{ currentChild.name }}'s details including meal, sleep, mood, milestones, and incidents.
            </p>
          </v-card-text>
        </v-card>

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
              
              <!-- Calendar picker -->
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

          <!-- Summary cards grid (4 cards) -->
          <v-row>
            <!-- Sleep Card -->
            <v-col cols="12" sm="6" md="3">
              <SleepSummaryCard :sleepData="summaryData.sleep" />
            </v-col>

            <!-- Poop Card -->
            <v-col cols="12" sm="6" md="3">
              <PoopSummaryCard :poopData="summaryData.poop" />
            </v-col>

            <!-- Meals Card -->
            <v-col cols="12" sm="6" md="3">
              <MealsSummaryCard :mealsData="summaryData.meals" />
            </v-col>

            <!-- Health Card -->
            <v-col cols="12" sm="6" md="3">
              <HealthSummaryCard :healthData="summaryData.health" />
            </v-col>
          </v-row>
        </div>

        <!-- AI Assistant section -->
        <v-card elevation="1" class="mb-6">
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-avatar size="40" class="mr-3" rounded="0">
                <v-img 
                  height="90%"
                  src="https://uceadaa513ecb56fd2611040f0d8.previews.dropboxusercontent.com/p/thumb/ACo1DUHf751zfAZxyz0qT1KOEa_AJGEMPb_b4b_Ig4QsJVht7ny7fCUB7v2ZNMkL2Si5TEhWpX6X0wo_oIVfEbyotojkgbsDvjtkV-WT2BWxKpkPm4HgQJaEz3a-yPN7Ga0RARrMS7pQmCtLCPlJshg9GG-3knZ8UlwKWTzdA5ZCeJDcp2BCsXUX7cPrlVH1ADUV6gjAlgXjQCicO_vxkiPbU4in2fSMBSytcQVu5g4OHvMOZmyGU6I_l1chCo7yDG7vofBtuCkNBWaf636ljMrTylXiMenHEotc_v77JWbDgabQdwURSTilq5v0PysTHb2JQafzpaIhMae-VcfcspQczNukeSLVstel4t8fgMgZ2_7qf8ZQrbGxcioIZyTlFgU/p.png?is_prewarmed=true"
                />
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
        <div>
          <h2 class="text-h6 mb-3">Quick Actions</h2>
          <v-row>
            <v-col cols="12" md="6">
              <v-card elevation="1">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon size="large" class="mr-3">mdi-chart-line</v-icon>
                    <div>
                      <h4 class="text-subtitle-1">Dashboard</h4>
                      <p class="text-body-2 text-grey">
                        Display data trends using interactive graphs and charts for sleep duration, poop, and dietary habits
                      </p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card elevation="1">
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
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Import all summary card components
import SleepSummaryCard from '../components/SleepSummaryCard.vue'
import PoopSummaryCard from '../components/PoopSummaryCard.vue'
import MealsSummaryCard from '../components/MealsSummaryCard.vue'
import HealthSummaryCard from '../components/HealthSummaryCard.vue'
import AlertNotification from '../components/AlertNotification.vue'

// ===== REACTIVE DATA =====

// Selected date for viewing summaries (defaults to today)
const selectedDate = ref(new Date())

// Controls visibility of date picker menu
const datePickerMenu = ref(false)

// Caregiver's name - in production, this would come from authentication
const caregiverName = ref('Yoshi')

// List of children associated with this caregiver account
const children = ref([
  {
    id: 1,
    name: 'Pui Sim',
    age: 3,
    avatar: 'https://images.pexels.com/photos/2806752/pexels-photo-2806752.jpeg'
  },
  {
    id: 2,
    name: 'Alex',
    age: 5,
    avatar: 'https://images.pexels.com/photos/1288182/pexels-photo-1288182.jpeg'
  }
])

// Currently selected child (defaults to first child)
const currentChild = ref(children.value[0])

// Current alert configuration
// type: 'success' (green), 'warning' (yellow), 'error' (red)
const currentAlert = ref({
  type: 'warning',
  message: 'Interrupted Sleep & Reduced Appetite',
  details: 'Possible Early Discomfort.'
})

// Summary data for the 4 cards - this gets updated when date/child changes
const summaryData = ref({
  sleep: {
    nightHours: 8,
    napHours: 1,
    wakeCount: 1,
    childAge: currentChild.value.age
  },
  poop: {
    count: 1,
    unusual: 0,
    normal: 1
  },
  meals: {
    count: 3,
    percentages: {
      breakfast: 50,
      lunch: 70,
      dinner: 65
    },
    refusedItems: ['vegetables'],
    preferences: ['noodles', 'tofu']
  },
  health: {
    status: 'Healthy',
    message: 'No symptoms today'
  }
})

// ===== SAMPLE DATA =====
// In production, this would be fetched from an API
// Format: 'childId-YYYY-MM-DD'
const sampleDataByDate = {
  // Pui Sim's data showing progression over 3 days
  '1-2025-05-30': {
    sleep: {
      nightHours: 9,
      napHours: 1,
      wakeCount: 1,
      childAge: 3
    },
    poop: {
      count: 2,
      unusual: 0,
      normal: 2
    },
    meals: {
      count: 3,
      percentages: {
        breakfast: 90,
        lunch: 90,
        dinner: 75
      },
      refusedItems: [],
      preferences: ['noodles', 'apple']
    },
    health: {
      status: 'Healthy',
      message: 'No symptoms today'
    }
  },
  '1-2025-05-31': {
    sleep: {
      nightHours: 7.5,
      napHours: 1,
      wakeCount: 2,
      childAge: 3
    },
    poop: {
      count: 1,
      unusual: 0,
      normal: 1
    },
    meals: {
      count: 2,
      percentages: {
        breakfast: 60,
        lunch: 70,
        dinner: 50
      },
      refusedItems: ['chicken'],
      preferences: ['rice', 'banana']
    },
    health: {
      status: 'Healthy',
      message: 'A bit fussy, more clingy'
    }
  },
  '1-2025-06-01': {
    sleep: {
      nightHours: 6,
      napHours: 0.5,
      wakeCount: 3,
      childAge: 3
    },
    poop: {
      count: 1,
      unusual: 0,
      normal: 1
    },
    meals: {
      count: 1,
      percentages: {
        breakfast: 20,
        lunch: 40,
        dinner: 30
      },
      refusedItems: ['eggs', 'rice'],
      preferences: ['yogurt']
    },
    health: {
      status: 'Tired',
      message: 'Very clingy, rubbed ears a few times'
    }
  },
  // Example of no check-in day
  '1-2025-05-25': {
    sleep: { noData: true },
    poop: { noData: true },
    meals: { noData: true },
    health: { noData: true }
  },
  // Alex's sample data
  '2-2025-05-27': {
    sleep: {
      nightHours: 10,
      napHours: 1,
      wakeCount: 0,
      childAge: 5
    },
    poop: {
      count: 3,
      unusual: 0,
      normal: 3
    },
    meals: {
      count: 3,
      percentages: {
        breakfast: 60,
        lunch: 100,
        dinner: 80
      },
      refusedItems: ['vegetables'],
      preferences: ['pasta', 'cheese', 'yogurt']
    },
    health: {
      status: 'Healthy',
      message: 'No symptoms today'
    }
  }
}

// ===== COMPUTED PROPERTIES =====

// Formats the selected date for display
const formattedSelectedDate = computed(() => {
  const date = new Date(selectedDate.value)
  const today = new Date()
  
  // Show "Today" or "Yesterday" for better UX
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }
  
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
})

// ===== METHODS =====

// Handle date selection from calendar
const handleDateChange = (newDate) => {
  console.log('Date changed to:', newDate)
  datePickerMenu.value = false
  loadDataForDate(newDate)
}

// Load data for a specific date and current child
const loadDataForDate = (date) => {
  // Format date as YYYY-MM-DD for lookup
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateKey = `${year}-${month}-${day}`
  
  // Create key with child ID and date
  const dataKey = `${currentChild.value.id}-${dateKey}`
  
  console.log('Looking for data with key:', dataKey) // Debug log
  
  // Check if we have sample data
  if (sampleDataByDate[dataKey]) {
    summaryData.value = { ...sampleDataByDate[dataKey] }
    console.log('Found sample data:', sampleDataByDate[dataKey]) // Debug log
  } else {
    // Generate random data for demo purposes
    console.log('No sample data found, generating random data') // Debug log
    summaryData.value = generateRandomData(date, currentChild.value.name)
  }
}

// Generate random data when no sample data exists
// In production, this would show "no data" or fetch from API
const generateRandomData = (date, childName) => {
  // 20% chance of no check-in
  if (Math.random() < 0.2) {
    return {
      sleep: { noData: true },
      poop: { noData: true },
      meals: { noData: true },
      health: { noData: true }
    }
  }
  
  // Generate realistic random data
  return {
    sleep: {
      nightHours: Math.floor(Math.random() * 4) + 7,  // 7-11 hours
      napHours: Math.random() < 0.7 ? 1.5 : 0,        // 70% chance of nap
      wakeCount: Math.floor(Math.random() * 3),       // 0-2 wake ups
      childAge: currentChild.value.age
    },
    poop: {
      count: Math.floor(Math.random() * 3) + 1,       // 1-3 times
      unusual: Math.random() > 0.7 ? 1 : 0,           // 30% chance unusual
      normal: Math.floor(Math.random() * 3) + 1
    },
    meals: {
      count: 3,
      percentages: {
        breakfast: Math.floor(Math.random() * 70) + 30,  // 30-100%
        lunch: Math.floor(Math.random() * 70) + 30,
        dinner: Math.floor(Math.random() * 70) + 30
      },
      refusedItems: Math.random() > 0.5 ? ['vegetables'] : [],
      preferences: ['pasta', 'fruits']
    },
    health: {
      status: Math.random() > 0.8 ? 'Mild symptoms' : 'Healthy',
      message: Math.random() > 0.8 ? 'Slight runny nose' : 'No symptoms today'
    }
  }
}

// Handle child selection from dropdown
const selectChild = (child) => {
  currentChild.value = child
  console.log(`Selected child: ${child.name}`)
  
  // Reload data for new child
  loadDataForDate(selectedDate.value)
  
  // Update alert based on child
  updateAlertForChild(child)
}

// Update alert message based on selected child
const updateAlertForChild = (child) => {
  if (child.id === 1) {
    currentAlert.value = {
      type: 'warning',
      message: 'Interrupted Sleep & Reduced Appetite.',
      details: 'Possible Early Discomfort.'
    }
  } else if (child.id === 2) {
    currentAlert.value = {
      type: 'success',
      message: 'All Health Markers Normal',
      details: 'All health indicators are within normal range.'
    }
  }
}

// Open check-in form (implement navigation in production)
const openCheckIn = () => {
  console.log('Opening check-in for:', currentChild.value.name)
  // TODO: Navigate to check-in page or open modal
}

// ===== LIFECYCLE =====

// Initialize data when component mounts
onMounted(() => {
  // Set initial date to June 1, 2025 to match sample data
  selectedDate.value = new Date('2025-06-01')
  loadDataForDate(selectedDate.value)
})
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