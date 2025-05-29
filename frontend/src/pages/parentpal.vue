<!-- index.vue -->
<template>
  <!-- Main container that holds everything on the page -->
  <!-- Adding theme="light" ensures white/light background -->
  <v-app theme="light">
    <!-- Navigation drawer - the sidebar with menu items -->
    <!-- 'permanent' means it stays visible, 'rail' makes it narrow -->
    <v-navigation-drawer
      permanent
      rail
      rail-width="80"
      color="white"
      elevation="2"
    >
      <!-- Company logo at the top of the sidebar -->
      <template v-slot:prepend>
        <div class="pa-3 text-center">
          <!-- Using emoji as placeholder for meerkat logo -->
          <!-- <div class="text-h4">🦫</div> -->
          <v-img src="https://uceadaa513ecb56fd2611040f0d8.previews.dropboxusercontent.com/p/thumb/ACqXuIk4Ne-u4SEXWuzAnWdEdEOJodkQ2oH5fcb_ppBa2-xqywQOttb-ljWIlvFnnwGRdt-b9-ARjDHmno3K4xforlIW9RWKYpnvm3xx9ZeR15i6UQPddUvTuFrlG9HTuUgGX0yLTmw8IFQVbUmjViNOTa78jQdU3pKhqThY22isF6mzmKWx4Mzv5qCRDwwfy_BEx-wN6uehljByg87psUYCawuywOzLUDH0DubCDsgA2HqWHKPc9GKxqkX-FwIkl6xrkLxhzZrG98OvTsKY9bJsOzvJDPl1gFHmiU7LtRhhGqkwKPDwZODrXEg5Js_9yW6uHgvIZ1z1W9M-nymzQJzsUZubm2sp-oQBoFvPqY4j1XXLBEEkcVtzZWPtB9JabrA/p.png?is_prewarmed=true"></v-img>
        </div>
      </template>

      <!-- Navigation menu items with text labels -->
      <v-list density="compact" nav>
        <!-- Home button -->
        <v-list-item
          value="home"
          class="nav-item"
        >
          <template v-slot:default>
            <div class="text-center">
              <v-icon size="large">mdi-home</v-icon>
              <div class="text-caption mt-1">Home</div>
            </div>
          </template>
        </v-list-item>

        <!-- Check-in button -->
        <v-list-item
          value="checkin"
          class="nav-item"
        >
          <template v-slot:default>
            <div class="text-center">
              <v-icon size="large">mdi-clipboard-check</v-icon>
              <div class="text-caption mt-1">Check-In</div>
            </div>
          </template>
        </v-list-item>

        <!-- Dashboard button -->
        <v-list-item
          value="dashboard"
          class="nav-item"
        >
          <template v-slot:default>
            <div class="text-center">
              <v-icon size="large">mdi-chart-line</v-icon>
              <div class="text-caption mt-1">Dashboard</div>
            </div>
          </template>
        </v-list-item>

        <!-- Chatbot button -->
        <v-list-item
          value="chatbot"
          class="nav-item"
        >
          <template v-slot:default>
            <div class="text-center">
              <v-icon size="large">mdi-chat</v-icon>
              <div class="text-caption mt-1">Chatbot</div>
            </div>
          </template>
        </v-list-item>

        <!-- Guidance button-->
        <v-list-item
          value="guidance"
          class="nav-item"
        >
          <template v-slot:default>
            <div class="text-center">
              <v-icon size="large">mdi-book-open-variant</v-icon>
              <div class="text-caption mt-1">Guidance</div>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Top navigation bar -->
     <v-toolbar class="fixed-tabs-bar">
    <v-app-bar elevation="1" color="grey-lighten-5" style="padding-left: 30px;">
      <!-- Child profile dropdown menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <!-- Button that shows current child's info -->
          <v-btn 
            v-bind="props"
            variant="text"
            class="text-none"
          >
            <!-- Child's profile picture -->
            <v-avatar size="32" class="mr-2">
              <v-img :src="currentChild.avatar"></v-img>
            </v-avatar>
            <!-- Child's name -->
            <div class="d-flex flex-column align-start mr-2">
      <span>{{ currentChild.name }}</span>
      <span class="text-caption text-grey">{{ currentChild.age }} years old</span>
    </div>
            <!-- Dropdown arrow -->
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <!-- Dropdown menu content -->
        <v-list>
          <!-- Loop through all children to create menu items -->
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
    <!-- Main content area with padding to account for navigation drawer -->
   <v-main style="background-color: #FAF9F5; padding-left: 100px !important; margin-top: -60px">

      <v-container fluid>
        <!-- Welcome message with dynamic caregiver name -->
        <h1 class="text-h4 mb-2">Welcome, {{ caregiverName }}</h1>
        
        <!-- Child's name and age -->
        <div class="mb-4">
          <p class="text-subtitle-1 mb-0">{{ currentChild.name }}'s Important Alerts</p>
          <!-- <p class="text-caption text-grey">{{ currentChild.age }} years old</p> -->
        </div>

        <!-- Alert notification component -->
        <AlertNotification 
          :alert="currentAlert"
          class="mb-6"
        />

        <!-- Check-in section -->
        <v-card class="mb-6" elevation="0">
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
            
            <!-- Date picker for selecting summary date -->
            <v-menu
              v-model="datePickerMenu"
              :close-on-content-click="false"
              location="bottom"
            >
              <template v-slot:activator="{ props }">
                <!-- Date picker button -->
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
              
              <!-- Date picker calendar -->
              <v-card>
                <v-date-picker
                  v-model="selectedDate"
                  @update:model-value="handleDateChange"
                  :max="new Date()"
                  color=#FAF9F5
                ></v-date-picker>
              </v-card>
            </v-menu>
          </div>

          <!-- Summary cards grid -->
          <v-row>
            <!-- Sleep Card -->
            <v-col cols="12" md="4">
              <SleepCard 
                :sleepData="summaryData.sleep"
                :lastUpdated="summaryData.sleep.lastUpdated"
              />
            </v-col>

            <!-- Food Card -->
            <v-col cols="12" md="4">
              <FoodCard 
                :foodData="summaryData.food"
                :lastUpdated="summaryData.food.lastUpdated"
              />
            </v-col>

            <!-- Mood Card -->
            <v-col cols="12" md="4">
              <MoodCard 
                :moodData="summaryData.mood"
                :lastUpdated="summaryData.mood.lastUpdated"
              />
            </v-col>
          </v-row>
        </div>

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
        <div>
          <h2 class="text-h6 mb-3">Quick Actions</h2>
          <v-row>
            <v-col cols="12" md="6">
              <v-card elevation="0">
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
              <v-card elevation="0">
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
import SleepCard from '../components/SleepCard.vue'
import FoodCard from '../components/FoodCard.vue'
import MoodCard from '../components/MoodCard.vue'
import AlertNotification from '../components/AlertNotification.vue'

// Reactive data - these values can change and the UI will update automatically

// Selected date for summary view (defaults to today)
const selectedDate = ref(new Date())

// Date picker menu visibility
const datePickerMenu = ref(false)

// Caregiver name - this could come from login/authentication
const caregiverName = ref('Sarah Johnson')

// List of all children in the system
const children = ref([
  {
    id: 1,
    name: 'Jennie',
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

// Currently selected child
const currentChild = ref(children.value[0])

// Current alert status - can be 'success', 'warning', or 'error'
const currentAlert = ref({
  type: 'warning', // 'success' = green, 'warning' = yellow, 'error' = red
  message: 'Vitamin D Deficiency',
  details: 'Your child has low levels of vitamin D.'
})

// Summary data for each card type
const summaryData = ref({
  sleep: {
    hours: 12,
    quality: 'Well',
    description: 'Jennie slept well through the night',
    lastUpdated: '8am'
  },
  food: {
    meals: 3,
    status: 'refused',
    description: 'Jennie refused to eat the meal',
    lastUpdated: '8am',
    breakdown: {
      breakfast: true,
      lunch: false,
      dinner: true
    }
  },
  mood: {
    current: 'happy',
    emoji: '😊',
    description: 'Jennie feels energetic today',
    lastUpdated: '8am',
    trend: 'improving'
  }
})

// Sample data for different dates (in real app, this would come from API)
// Data structure now includes child ID to differentiate between children
const sampleDataByDate = {
  // Jennie's data (child ID: 1)
  '1-2025-05-27': {
    sleep: {
      hours: 12,
      quality: 'Well',
      description: 'Jennie slept well through the night',
      lastUpdated: '8am'
    },
    food: {
      meals: 3,
      status: 'refused',
      description: 'Jennie refused to eat the meal',
      lastUpdated: '8am',
      breakdown: {
        breakfast: true,
        lunch: false,
        dinner: true
      }
    },
    mood: {
      current: 'happy',
      emoji: '😊',
      description: 'Jennie feels energetic today',
      lastUpdated: '8am',
      trend: 'improving'
    }
  },
  '1-2025-05-26': {
    sleep: {
      hours: 10,
      quality: 'Fair',
      description: 'Jennie woke up twice during the night',
      lastUpdated: '7:30am'
    },
    food: {
      meals: 3,
      status: 'completed',
      description: 'Jennie finished all meals today',
      lastUpdated: '6pm',
      breakdown: {
        breakfast: true,
        lunch: true,
        dinner: true
      }
    },
    mood: {
      current: 'neutral',
      emoji: '😊',
      description: 'Jennie was calm but less playful',
      lastUpdated: '5pm',
      trend: 'stable'
    }
  },
  '1-2025-05-25': {
    sleep: {
      hours: 8,
      quality: 'Poor',
      description: 'Jennie had trouble falling asleep',
      lastUpdated: '9am'
    },
    food: {
      meals: 3,
      status: 'partial',
      description: 'Jennie only ate half of her lunch',
      lastUpdated: '2pm',
      breakdown: {
        breakfast: true,
        lunch: false,
        dinner: true
      }
    },
    mood: {
      current: 'sad',
      emoji: '😐',
      description: 'Jennie seemed tired and cranky',
      lastUpdated: '3pm',
      trend: 'declining'
    }
  },
  // Alex's data (child ID: 2)
  '2-2025-05-27': {
    sleep: {
      hours: 11,
      quality: 'Well',
      description: 'Alex slept peacefully all night',
      lastUpdated: '7:45am'
    },
    food: {
      meals: 3,
      status: 'completed',
      description: 'Alex enjoyed all meals and asked for seconds',
      lastUpdated: '7pm',
      breakdown: {
        breakfast: true,
        lunch: true,
        dinner: true
      }
    },
    mood: {
      current: 'very-happy',
      emoji: '🤗',
      description: 'Alex is very cheerful and playful today',
      lastUpdated: '8pm',
      trend: 'stable'
    }
  },
  '2-2025-05-26': {
    sleep: {
      hours: 9,
      quality: 'Fair',
      description: 'Alex had one nightmare but went back to sleep',
      lastUpdated: '8:15am'
    },
    food: {
      meals: 3,
      status: 'partial',
      description: 'Alex skipped vegetables at dinner',
      lastUpdated: '6:30pm',
      breakdown: {
        breakfast: true,
        lunch: true,
        dinner: false
      }
    },
    mood: {
      current: 'happy',
      emoji: '😄',
      description: 'Alex was happy but slightly less energetic',
      lastUpdated: '7pm',
      trend: 'improving'
    }
  },
  '2-2025-05-25': {
    sleep: {
      hours: 10,
      quality: 'Well',
      description: 'Alex had a great night of sleep',
      lastUpdated: '8am'
    },
    food: {
      meals: 3,
      status: 'completed',
      description: 'Alex tried new foods and liked them',
      lastUpdated: '6:45pm',
      breakdown: {
        breakfast: true,
        lunch: true,
        dinner: true
      }
    },
    mood: {
      current: 'happy',
      emoji: '😄',
      description: 'Alex was social and played well with others',
      lastUpdated: '5:30pm',
      trend: 'stable'
    }
  }
}

// Computed property - automatically updates when dependencies change
const todayDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
})

// Computed property for formatted selected date
const formattedSelectedDate = computed(() => {
  const date = new Date(selectedDate.value)
  const today = new Date()
  
  // Check if selected date is today
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }
  
  // Check if selected date is yesterday
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }
  
  // Otherwise return formatted date
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
})

// Methods - functions that handle user interactions

// Function to handle date change
const handleDateChange = (newDate) => {
  console.log('Date changed to:', newDate)
  datePickerMenu.value = false
  
  // Load data for the selected date
  loadDataForDate(newDate)
}

// Function to load data for a specific date
const loadDataForDate = (date) => {
  // Format date as YYYY-MM-DD for lookup
  const dateKey = date.toISOString().split('T')[0]
  
  // Create key with child ID and date
  const dataKey = `${currentChild.value.id}-${dateKey}`
  
  // Check if we have sample data for this child and date
  if (sampleDataByDate[dataKey]) {
    summaryData.value = { ...sampleDataByDate[dataKey] }
  } else {
    // In a real app, this would be an API call
    // For demo, generate random data for dates without sample data
    summaryData.value = generateRandomData(date, currentChild.value.name)
  }
}

// Function to generate random data for dates without sample data
const generateRandomData = (date, childName) => {
  const sleepHours = Math.floor(Math.random() * 6) + 7 // 7-12 hours
  const sleepQualities = ['Well', 'Fair', 'Poor']
  const foodStatuses = ['completed', 'partial', 'refused']
  const moods = ['very-happy', 'happy', 'neutral', 'sad', 'very-sad']
  const moodEmojis = {
    'very-happy': '🤗',
    'happy': '😄',
    'neutral': '😊',
    'sad': '😐',
    'very-sad': '😢'
  }
  
  const randomMood = moods[Math.floor(Math.random() * moods.length)]
  const randomSleepQuality = sleepQualities[Math.floor(Math.random() * sleepQualities.length)]
  const randomFoodStatus = foodStatuses[Math.floor(Math.random() * foodStatuses.length)]
  
  return {
    sleep: {
      hours: sleepHours,
      quality: randomSleepQuality,
      description: `${childName} had ${randomSleepQuality.toLowerCase()} sleep on ${date.toLocaleDateString()}`,
      lastUpdated: '8am'
    },
    food: {
      meals: 3,
      status: randomFoodStatus,
      description: `${childName} ${randomFoodStatus === 'completed' ? 'finished all' : randomFoodStatus === 'partial' ? 'partially ate' : 'refused'} meals`,
      lastUpdated: '6pm',
      breakdown: {
        breakfast: Math.random() > 0.3,
        lunch: Math.random() > 0.3,
        dinner: Math.random() > 0.3
      }
    },
    mood: {
      current: randomMood,
      emoji: moodEmojis[randomMood],
      description: `${childName}'s mood on ${date.toLocaleDateString()}`,
      lastUpdated: '5pm',
      trend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)]
    }
  }
}

// Function to switch between children
const selectChild = (child) => {
  currentChild.value = child
  // Here you would typically load that child's data
  console.log(`Selected child: ${child.name}`)
  
  // Load data for the selected child and current date
  loadDataForDate(selectedDate.value)
  
  // Update alert based on child
  updateAlertForChild(child)
}

// Function to update alert based on selected child
const updateAlertForChild = (child) => {
  // Different alerts for different children
  if (child.id === 1) {
    currentAlert.value = {
      type: 'warning',
      message: 'Vitamin D Deficiency',
      details: 'Your child has low levels of vitamin D.'
    }
  } else if (child.id === 2) {
    currentAlert.value = {
      type: 'success',
      message: 'All Health Markers Normal',
      details: 'Alex\'s recent check-up shows all health indicators are within normal range.'
    }
  }
}

// Function to open check-in dialog
const openCheckIn = () => {
  // This would open a dialog or navigate to check-in page
  console.log('Opening check-in for:', currentChild.value.name)
}

// Function to update caregiver name (could be called after login)
const updateCaregiverName = (name) => {
  caregiverName.value = name
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