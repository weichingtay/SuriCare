<template>
  <v-app>
    <v-main>
      <v-container class="timeline-container">
        <!-- Header -->
        <div class="timeline-header">
          <h1 class="text-h4 font-weight-regular mb-8 text-center">Check-in History</h1>
          
          <!-- Category Tabs -->
          <div class="category-tabs mb-8">
            <v-btn
              v-for="category in categories"
              :key="category.value"
              :variant="selectedCategory === category.value ? 'text' : 'text'"
              :color="selectedCategory === category.value ? 'error' : 'default'"
              class="category-tab"
              @click="selectedCategory = category.value"
            >
              {{ category.label }}
            </v-btn>
          </div>

          <!-- Date and View Controls -->
          <div class="controls-row mb-8">
            <div class="controls-group">
              <!-- Enhanced Date Picker Button -->
              <v-menu
                v-model="datePickerMenu"
                :close-on-content-click="false"
                location="bottom start"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="outlined"
                    color="grey-darken-1"
                    class="date-picker-btn"
                    size="large"
                  >
                    <v-icon start size="20">mdi-calendar</v-icon>
                    {{ formattedDate }}
                    <v-icon end size="16">mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                
                <v-card>
                  <v-date-picker
                    v-model="selectedDate"
                    @update:model-value="datePickerMenu = false"
                    color="error"
                  ></v-date-picker>
                </v-card>
              </v-menu>

              <!-- View Mode Toggle -->
              <div class="view-toggle">
                <v-btn
                  v-for="mode in viewModes"
                  :key="mode.value"
                  :variant="viewMode === mode.value ? 'flat' : 'outlined'"
                  :color="viewMode === mode.value ? 'error' : 'default'"
                  class="view-btn"
                  @click="viewMode = mode.value"
                >
                  {{ mode.label }}
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline-content">
          <div v-if="filteredCheckins.length === 0" class="text-center py-12">
            <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-calendar-blank</v-icon>
            <p class="text-grey">No check-ins found for the selected filters.</p>
          </div>

          <div v-else class="timeline-list">
            <div
              v-for="(checkin, index) in filteredCheckins"
              :key="checkin.id"
              class="timeline-item"
            >
              <!-- Timeline Line -->
              <div 
                v-if="index < filteredCheckins.length - 1" 
                class="timeline-line"
              ></div>
              
              <div class="timeline-row">
                <!-- Category Icon -->
                <div class="timeline-icon-container">
                  <v-avatar
                    size="48"
                    color="transparent"
                    class="timeline-icon"
                  >
                    <v-icon size="24" color="#D87179">{{ getCategoryIcon(checkin.type) }}</v-icon>
                  </v-avatar>
                </div>

                <!-- Date Column -->
                <div class="date-column">
                  <div class="date-day">{{ checkin.day }}</div>
                  <div class="date-number">{{ checkin.date }}</div>
                  <div class="date-month">{{ checkin.month }}</div>
                </div>

                <!-- Time Column -->
                <div class="time-column">
                  <div class="time-value">{{ formatTime(checkin.timestamp) }}</div>
                </div>

                <!-- Content Column -->
                <div class="content-column">
                  <div class="status-text">{{ formatCheckinStatus(checkin) }}</div>
                  <div v-if="checkin.data.details" class="details-text">
                    {{ checkin.data.details }}
                  </div>
                  <div class="author-text">by {{ checkin.carerName }}</div>
                </div>

                <!-- Actions Column -->
                <div class="actions-column">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="grey-darken-1"
                    class="action-btn"
                    @click="editCheckin(checkin)"
                  >
                    <v-icon size="20">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="grey-darken-1"
                    class="action-btn"
                    @click="deleteCheckin(checkin.id)"
                  >
                    <v-icon size="20">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// State
const selectedDate = ref(new Date('2025-05-15'))
const selectedCategory = ref('all')
const viewMode = ref('Daily')
const datePickerMenu = ref(false)
const checkins = ref([])

// Categories
const categories = ref([
  { value: 'all', label: 'All' },
  { value: 'growth', label: 'Growth' },
  { value: 'meal', label: 'Meal' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'poop', label: 'Poop' },
  { value: 'health', label: 'Health' }
])

// View modes
const viewModes = ref([
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' }
])

// Sample data with a full week of comprehensive check-ins
const sampleCheckins = ref([
  // Monday, May 12, 2025
  {
    id: 1,
    type: 'growth',
    timestamp: new Date('2025-05-12T09:00:00'),
    carerId: 1,
    carerName: 'Dr. Smith',
    day: 'Mon',
    date: 12,
    month: 'May',
    data: {
      status: 'Weekly growth check',
      details: 'Weight: 3.2kg, Height: 52cm, Head: 35cm'
    }
  },
  {
    id: 2,
    type: 'meal',
    timestamp: new Date('2025-05-12T08:30:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Mon',
    date: 12,
    month: 'May',
    data: {
      status: 'Had breakfast',
      details: 'Milk - 120ml, consumed 80%'
    }
  },
  {
    id: 3,
    type: 'sleep',
    timestamp: new Date('2025-05-12T07:45:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Mon',
    date: 12,
    month: 'May',
    data: {
      status: 'Awake'
    }
  },
  {
    id: 4,
    type: 'sleep',
    timestamp: new Date('2025-05-11T22:30:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Sun',
    date: 11,
    month: 'May',
    data: {
      status: 'Fell asleep'
    }
  },

  // Tuesday, May 13, 2025
  {
    id: 5,
    type: 'poop',
    timestamp: new Date('2025-05-13T14:20:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Tue',
    date: 13,
    month: 'May',
    data: {
      status: 'Diaper change',
      details: 'Yellow, soft consistency - normal'
    }
  },
  {
    id: 6,
    type: 'meal',
    timestamp: new Date('2025-05-13T12:15:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Tue',
    date: 13,
    month: 'May',
    data: {
      status: 'Had lunch',
      details: 'Baby puree - vegetables, consumed 60%'
    }
  },
  {
    id: 7,
    type: 'health',
    timestamp: new Date('2025-05-13T10:30:00'),
    carerId: 3,
    carerName: 'Nurse Jenny',
    day: 'Tue',
    date: 13,
    month: 'May',
    data: {
      status: 'Health check - mild fever',
      details: 'Temperature: 37.8°C, gave medication'
    }
  },
  {
    id: 8,
    type: 'sleep',
    timestamp: new Date('2025-05-13T09:00:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Tue',
    date: 13,
    month: 'May',
    data: {
      status: 'Awake'
    }
  },
  {
    id: 9,
    type: 'sleep',
    timestamp: new Date('2025-05-13T07:30:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Tue',
    date: 13,
    month: 'May',
    data: {
      status: 'Fell asleep'
    }
  },

  // Wednesday, May 14, 2025
  {
    id: 10,
    type: 'meal',
    timestamp: new Date('2025-05-14T18:45:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Wed',
    date: 14,
    month: 'May',
    data: {
      status: 'Had dinner',
      details: 'Rice cereal with fruits, consumed 75%'
    }
  },
  {
    id: 11,
    type: 'poop',
    timestamp: new Date('2025-05-14T16:10:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Wed',
    date: 14,
    month: 'May',
    data: {
      status: 'Diaper change',
      details: 'Green, lumpy - after vegetables'
    }
  },
  {
    id: 12,
    type: 'meal',
    timestamp: new Date('2025-05-14T13:00:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Wed',
    date: 14,
    month: 'May',
    data: {
      status: 'Had lunch',
      details: 'Chicken puree with vegetables, consumed 90%'
    }
  },
  {
    id: 13,
    type: 'sleep',
    timestamp: new Date('2025-05-14T12:30:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Wed',
    date: 14,
    month: 'May',
    data: {
      status: 'Awake'
    }
  },
  {
    id: 14,
    type: 'sleep',
    timestamp: new Date('2025-05-14T11:00:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Wed',
    date: 14,
    month: 'May',
    data: {
      status: 'Fell asleep'
    }
  },

  // Thursday, May 15, 2025 (Your original selected date)
  {
    id: 15,
    type: 'health',
    timestamp: new Date('2025-05-15T15:20:00'),
    carerId: 3,
    carerName: 'Nurse Jenny',
    day: 'Thu',
    date: 15,
    month: 'May',
    data: {
      status: 'Symptoms check - rash',
      details: 'Small rash on cheek, applied cream'
    }
  },
  {
    id: 34,
    type: 'meal',
    timestamp: new Date('2025-05-15T12:30:00'),
    carerId: 1,
    carerName: 'Yoshimoto',
    day: 'Thu',
    date: 15,
    month: 'May',
    data: {
      status: 'Had lunch',
      details: 'Vegetable puree with rice, consumed 85%'
    }
  },
  {
    id: 16,
    type: 'sleep',
    timestamp: new Date('2025-05-15T10:08:00'),
    carerId: 1,
    carerName: 'Yoshimoto',
    day: 'Thu',
    date: 15,
    month: 'May',
    data: {
      status: 'Awake'
    }
  },
  {
    id: 17,
    type: 'sleep',
    timestamp: new Date('2025-05-15T08:00:00'),
    carerId: 1,
    carerName: 'Yoshimoto',
    day: 'Thu',
    date: 15,
    month: 'May',
    data: {
      status: 'Fell asleep'
    }
  },
  {
    id: 35,
    type: 'meal',
    timestamp: new Date('2025-05-15T07:30:00'),
    carerId: 1,
    carerName: 'Yoshimoto',
    day: 'Thu',
    date: 15,
    month: 'May',
    data: {
      status: 'Had breakfast',
      details: 'Milk - 150ml, consumed 90%'
    }
  },
  {
    id: 18,
    type: 'poop',
    timestamp: new Date('2025-05-15T06:00:00'),
    carerId: 1,
    carerName: 'Yoshimoto',
    day: 'Thu',
    date: 15,
    month: 'May',
    data: {
      status: 'Diaper change',
      details: 'Brown, firm - healthy consistency'
    }
  },

  // Friday, May 16, 2025
  {
    id: 19,
    type: 'meal',
    timestamp: new Date('2025-05-16T19:30:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Fri',
    date: 16,
    month: 'May',
    data: {
      status: 'Had dinner',
      details: 'Mixed vegetables and meat, consumed 85%'
    }
  },
  {
    id: 20,
    type: 'poop',
    timestamp: new Date('2025-05-16T17:45:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Fri',
    date: 16,
    month: 'May',
    data: {
      status: 'Diaper change',
      details: 'Yellow, watery - possible stomach upset'
    }
  },
  {
    id: 21,
    type: 'meal',
    timestamp: new Date('2025-05-16T15:30:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Fri',
    date: 16,
    month: 'May',
    data: {
      status: 'Had snack',
      details: 'Fruit puree - apple and banana, consumed 100%'
    }
  },
  {
    id: 22,
    type: 'sleep',
    timestamp: new Date('2025-05-16T14:45:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Fri',
    date: 16,
    month: 'May',
    data: {
      status: 'Awake'
    }
  },
  {
    id: 23,
    type: 'sleep',
    timestamp: new Date('2025-05-16T13:15:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Fri',
    date: 16,
    month: 'May',
    data: {
      status: 'Fell asleep'
    }
  },

  // Saturday, May 17, 2025
  {
    id: 24,
    type: 'health',
    timestamp: new Date('2025-05-17T11:00:00'),
    carerId: 3,
    carerName: 'Nurse Jenny',
    day: 'Sat',
    date: 17,
    month: 'May',
    data: {
      status: 'Routine health check',
      details: 'All vitals normal, no fever, rash improving'
    }
  },
  {
    id: 25,
    type: 'meal',
    timestamp: new Date('2025-05-17T08:45:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Sat',
    date: 17,
    month: 'May',
    data: {
      status: 'Had breakfast',
      details: 'Cereal with milk, consumed 70%'
    }
  },
  {
    id: 26,
    type: 'poop',
    timestamp: new Date('2025-05-17T07:20:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Sat',
    date: 17,
    month: 'May',
    data: {
      status: 'Diaper change',
      details: 'Brown, normal consistency - back to healthy'
    }
  },
  {
    id: 27,
    type: 'sleep',
    timestamp: new Date('2025-05-17T07:00:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Sat',
    date: 17,
    month: 'May',
    data: {
      status: 'Awake'
    }
  },
  {
    id: 28,
    type: 'sleep',
    timestamp: new Date('2025-05-16T21:45:00'),
    carerId: 2,
    carerName: 'Sarah',
    day: 'Fri',
    date: 16,
    month: 'May',
    data: {
      status: 'Fell asleep'
    }
  },

  // Sunday, May 18, 2025
  {
    id: 29,
    type: 'meal',
    timestamp: new Date('2025-05-18T17:15:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Sun',
    date: 18,
    month: 'May',
    data: {
      status: 'Had dinner',
      details: 'New recipe - sweet potato and chicken, consumed 95%'
    }
  },
  {
    id: 30,
    type: 'poop',
    timestamp: new Date('2025-05-18T14:30:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Sun',
    date: 18,
    month: 'May',
    data: {
      status: 'Diaper change',
      details: 'Orange, soft - normal after sweet potato'
    }
  },
  {
    id: 31,
    type: 'meal',
    timestamp: new Date('2025-05-18T12:00:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Sun',
    date: 18,
    month: 'May',
    data: {
      status: 'Had lunch',
      details: 'Fish puree with rice, consumed 80%'
    }
  },
  {
    id: 32,
    type: 'sleep',
    timestamp: new Date('2025-05-18T11:30:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Sun',
    date: 18,
    month: 'May',
    data: {
      status: 'Awake'
    }
  },
  {
    id: 33,
    type: 'sleep',
    timestamp: new Date('2025-05-18T09:45:00'),
    carerId: 1,
    carerName: 'Mike',
    day: 'Sun',
    date: 18,
    month: 'May',
    data: {
      status: 'Fell asleep'
    }
  }
])

// Computed
const formattedDate = computed(() => {
  const date = selectedDate.value
  const day = date.getDate()
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
})

const filteredCheckins = computed(() => {
  let filtered = checkins.value

  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(checkin => checkin.type === selectedCategory.value)
  }

  // Apply date filtering based on view mode
  if (viewMode.value === 'Daily') {
    // Get the selected date in YYYY-MM-DD format
    const selectedYear = selectedDate.value.getFullYear()
    const selectedMonth = selectedDate.value.getMonth()
    const selectedDay = selectedDate.value.getDate()
    
    filtered = filtered.filter(checkin => {
      const checkinDate = new Date(checkin.timestamp)
      return checkinDate.getFullYear() === selectedYear &&
             checkinDate.getMonth() === selectedMonth &&
             checkinDate.getDate() === selectedDay
    })
  } else if (viewMode.value === 'Weekly') {
    // Show data for the week containing the selected date
    const selectedWeekStart = new Date(selectedDate.value)
    selectedWeekStart.setDate(selectedDate.value.getDate() - selectedDate.value.getDay())
    selectedWeekStart.setHours(0, 0, 0, 0)
    
    const selectedWeekEnd = new Date(selectedWeekStart)
    selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6)
    selectedWeekEnd.setHours(23, 59, 59, 999)
    
    filtered = filtered.filter(checkin => 
      checkin.timestamp >= selectedWeekStart && checkin.timestamp <= selectedWeekEnd
    )
  } else if (viewMode.value === 'Monthly') {
    // Show data for the month containing the selected date
    const selectedMonth = selectedDate.value.getMonth()
    const selectedYear = selectedDate.value.getFullYear()
    
    filtered = filtered.filter(checkin => 
      checkin.timestamp.getMonth() === selectedMonth && 
      checkin.timestamp.getFullYear() === selectedYear
    )
  }

  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// Methods
const getCategoryIcon = (type) => {
  const icons = {
    sleep: 'mdi-sleep',
    meal: 'mdi-silverware-fork-knife',
    poop: 'mdi-emoticon-poop',
    growth: 'mdi-ruler',
    health: 'mdi-heart'
  }
  return icons[type] || 'mdi-clipboard-text'
}

const calculateSleepDuration = (checkin) => {
  if (checkin.type !== 'sleep' || !checkin.data.status.toLowerCase().includes('awake')) {
    return null
  }

  // Find the most recent "Fell asleep" entry before this awake entry
  const sleepEntries = checkins.value
    .filter(entry => 
      entry.type === 'sleep' && 
      entry.data.status.toLowerCase().includes('fell asleep') &&
      entry.timestamp < checkin.timestamp
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  if (sleepEntries.length === 0) {
    return null
  }

  const sleepStart = sleepEntries[0].timestamp
  const sleepEnd = checkin.timestamp
  const durationMs = sleepEnd - sleepStart
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

  if (durationHours > 0) {
    return `${durationHours}h ${durationMinutes}m`
  } else {
    return `${durationMinutes}m`
  }
}

const formatSleepStatus = (checkin) => {
  const duration = calculateSleepDuration(checkin)
  if (duration && checkin.data.status.toLowerCase().includes('awake')) {
    return `Awake, slept for ${duration}`
  }
  return checkin.data.status
}

const formatCheckinStatus = (checkin) => {
  // Handle sleep status with duration calculation
  if (checkin.type === 'sleep') {
    return formatSleepStatus(checkin)
  }
  
  // Handle other checkin types with enhanced formatting
  switch (checkin.type) {
    case 'meal':
      return checkin.data.status
    case 'poop':
      return checkin.data.status
    case 'health':
      return checkin.data.status
    case 'growth':
      return checkin.data.status
    default:
      return checkin.data.status
  }
}

const getCategoryColor = (type) => {
  const colors = {
    sleep: 'deep-purple-lighten-4',
    meal: 'orange-lighten-4', 
    poop: 'brown-lighten-3',
    growth: 'green-lighten-4',
    health: 'red-lighten-4'
  }
  return colors[type] || 'grey-lighten-4'
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toLowerCase()
}

const deleteCheckin = (id) => {
  checkins.value = checkins.value.filter(checkin => checkin.id !== id)
}

const editCheckin = (checkin) => {
  console.log('Edit checkin:', checkin)
}

const addCheckin = (newCheckin) => {
  const checkinWithId = {
    ...newCheckin,
    id: checkins.value.length + 1,
    timestamp: new Date()
  }
  checkins.value = [checkinWithId, ...checkins.value]
}

// Initialize
onMounted(() => {
  checkins.value = sampleCheckins.value
})

// Expose methods
defineExpose({
  addCheckin,
  deleteCheckin,
  editCheckin
})
</script>

<style scoped>
.timeline-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

.timeline-header {
  margin-bottom: 32px;
}

.category-tabs {
  display: flex;
  justify-content: center;
  gap: 32px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
}

.category-tab {
  text-transform: none !important;
  font-weight: 400 !important;
  font-size: 16px !important;
  letter-spacing: normal !important;
  min-width: auto !important;
  padding: 8px 0 !important;
  height: auto !important;
  border-radius: 0 !important;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.category-tab.v-btn--variant-text {
  color: #666 !important;
}

.category-tab.v-btn--variant-text.text-error {
  color: #f44336 !important;
  border-bottom-color: #f44336 !important;
}

.controls-row {
  display: flex;
  justify-content: center;
  align-items: center;
}

.controls-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Enhanced Date Picker Button Styles */
.date-picker-btn {
  text-transform: none !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  letter-spacing: normal !important;
  min-width: 200px !important;
  height: 44px !important;
  padding: 0 16px !important;
  border-radius: 8px !important;
  border: 1.5px solid #e0e0e0 !important;
  background-color: #ffffff !important;
  color: #333 !important;
  transition: all 0.2s ease !important;
  justify-content: space-between !important;
}

.date-picker-btn:hover {
  border-color: #bdbdbd !important;
  background-color: #fafafa !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}

.date-picker-btn:focus {
  border-color: #f44336 !important;
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.1) !important;
}

.date-picker-btn .v-icon {
  color: #666 !important;
}

.date-picker-btn:hover .v-icon {
  color: #333 !important;
}

.view-toggle {
  display: flex;
  gap: 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.view-btn {
  text-transform: none !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  letter-spacing: normal !important;
  border-radius: 0 !important;
  border: none !important;
  min-width: 70px !important;
  height: 32px !important;
}

.view-btn.v-btn--variant-outlined {
  border: none !important;
}

.timeline-content {
  position: relative;
}

.timeline-list {
  position: relative;
}

.timeline-item {
  position: relative;
  margin-bottom: 32px;
}

.timeline-line {
  position: absolute;
  left: 24px;
  top: 48px;
  bottom: -32px;
  width: 1px;
  background-color: #e0e0e0;
  z-index: 1;
}

.timeline-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.timeline-icon-container {
  position: relative;
  z-index: 2;
}

.timeline-icon {
  border: 1px solid #e0e0e0;
}

.date-column {
  text-align: center;
  min-width: 60px;
  margin-top: 4px;
}

.date-day {
  font-size: 12px;
  color: #666;
  font-weight: 400;
  text-transform: uppercase;
  line-height: 1.2;
}

.date-number {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  line-height: 1;
  margin: 2px 0;
}

.date-month {
  font-size: 12px;
  color: #666;
  font-weight: 400;
  line-height: 1.2;
}

.time-column {
  min-width: 80px;
  margin-top: 4px;
}

.time-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.content-column {
  flex: 1;
  margin-top: 4px;
}

.status-text {
  font-size: 16px;
  font-weight: 400;
  color: #333;
  line-height: 1.3;
  margin-bottom: 4px;
}

.details-text {
  font-size: 14px;
  color: #666;
  line-height: 1.3;
  margin-bottom: 6px;
}

.author-text {
  font-size: 12px;
  color: #999;
  font-weight: 400;
  line-height: 1.2;
}

.actions-column {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.action-btn {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
}

.action-btn :deep(.v-icon) {
  color: #666 !important;
}

.action-btn:hover :deep(.v-icon) {
  color: #333 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .timeline-container {
    padding: 16px;
  }
  
  .category-tabs {
    gap: 16px;
    flex-wrap: wrap;
  }
  
  .controls-row {
    justify-content: center;
  }
  
  .controls-group {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .date-picker-btn {
    min-width: 200px !important;
  }
  
  .timeline-row {
    gap: 12px;
  }
  
  .date-number {
    font-size: 24px;
  }
}
</style>