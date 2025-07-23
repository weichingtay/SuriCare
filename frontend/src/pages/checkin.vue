<template>
  <v-app>
    <v-main style="background-color: #faf7f2">
      <v-container class="timeline-container">
        <div class="timeline-wrapper">
          <!-- Header -->
          <div class="timeline-header">
            <h1 class="text-h4 font-weight-regular mb-8 text-center">Check-in History</h1>

            <!-- Category Tabs -->
            <div class="category-tabs mb-8">
              <button
                v-for="category in categories"
                :key="category.value"
                :class="['category-tab', { 'active': selectedCategory === category.value }]"
                @click="selectedCategory = category.value"
              >
                {{ category.label }}
              </button>
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
                  <template #activator="{ props }">
                    <button
                      v-bind="props"
                      class="date-picker-btn"
                    >
                      <v-icon size="20" start>mdi-calendar</v-icon>
                      {{ formattedDate }}
                      <v-icon end size="16">mdi-chevron-down</v-icon>
                    </button>
                  </template>

                  <v-card>
                    <v-date-picker
                      v-model="selectedDate"
                      color="rgba($app-primary, 0.1) !important"
                      @update:model-value="handleDateChange"
                    />
                  </v-card>
                </v-menu>

                <!-- View Mode Toggle -->
                <div class="view-toggle">
                  <button
                    v-for="mode in viewModes"
                    :key="mode.value"
                    :class="['view-btn', { 'active': viewMode === mode.value }]"
                    @click="viewMode = mode.value"
                  >
                    {{ mode.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-12">
            <v-progress-circular indeterminate size="48" color="primary" />
            <p class="text-grey mt-4">Loading check-in history...</p>
          </div>

          <!-- Timeline -->
          <div v-else class="timeline-content">
            <div v-if="filteredCheckins.length === 0" class="text-center py-12">
              <v-icon class="mb-3" color="grey-lighten-1" size="48">mdi-calendar-blank</v-icon>
              <p class="text-grey">No check-ins found for the selected filters.</p>
            </div>

            <div v-else class="timeline-list">
              <div
                v-for="(checkin, index) in filteredCheckins"
                :key="`${checkin.type}-${checkin.id}`"
                class="timeline-item"
              >
                <!-- Timeline Line -->
                <div
                  v-if="index < filteredCheckins.length - 1"
                  class="timeline-line"
                />

                <div class="timeline-row">
                  <!-- Category Icon -->
                  <div class="timeline-icon-container">
                    <v-avatar
                      class="timeline-icon"
                      color="transparent"
                      size="48"
                    >
                      <v-icon color="#D87179" size="24">{{ getCategoryIcon(checkin.type) }}</v-icon>
                    </v-avatar>
                  </div>

                  <!-- Date Column -->
                  <div class="date-column">
                    <div class="date-day">{{ formatDateInfo(checkin.timestamp).day }}</div>
                    <div class="date-number">{{ formatDateInfo(checkin.timestamp).date }}</div>
                    <div class="date-month">{{ formatDateInfo(checkin.timestamp).month }}</div>
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
                    <button
                      class="action-btn"
                      title="Edit"
                      @click="editCheckin(checkin)"
                    >
                      <v-icon size="20">mdi-pencil</v-icon>
                    </button>
                    <button
  class="action-btn"
  title="Delete"
  @click="deleteCheckin(checkin)"
>
  <v-icon size="20">mdi-delete</v-icon>
</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-container>

      <!-- Edit Dialogs -->
      <!-- Meal Edit Dialog -->
      <MealDialog
        v-model="mealEditDialog.show"
        :loading="mealEditDialog.loading"
        :meal-time="mealEditData.mealTime"
        :consumption-level="mealEditData.consumptionLevel"
        :meal-category="mealEditData.mealCategory"
        :sub-category="mealEditData.subCategory"
        :custom-meal="mealEditData.customMeal"
        :notes="mealEditData.notes"
        :is-editing="true"
        :current-child="childrenStore.currentChild"
        @update:consumption-level="mealEditData.consumptionLevel = $event"
        @update:meal-category="mealEditData.mealCategory = $event"
        @update:sub-category="mealEditData.subCategory = $event"
        @update:custom-meal="mealEditData.customMeal = $event"
        @update:notes="mealEditData.notes = $event"
        @save="handleMealEditSave"
        @close="closeMealEditDialog"
      />

      <!-- Poop Edit Dialog -->
     <PoopDialog
  v-model="poopEditDialog.show"
  :loading="poopEditDialog.loading"
  :color="poopEditData.color"
  :texture="poopEditData.texture"
  :notes="poopEditData.notes"
  :is-editing="true"
  :current-child="childrenStore.currentChild"
  @update:color="poopEditData.color = $event"
  @update:texture="poopEditData.texture = $event"
  @update:notes="poopEditData.notes = $event"
  @save="handlePoopEditSave"
  @close="closePoopEditDialog"
/>


<!-- Sleep Edit Dialog -->
      <SleepDialog
        v-model="sleepEditDialog.show"
        :loading="sleepEditDialog.loading"
        :bed-time="sleepEditData.bedTime"
        :awake-time="sleepEditData.awakeTime"
        :notes="sleepEditData.notes"
        :is-editing="true"
        :current-child="childrenStore.currentChild"
        @update:bed-time="sleepEditData.bedTime = $event"
        @update:awake-time="sleepEditData.awakeTime = $event"
        @update:notes="sleepEditData.notes = $event"
        @save="handleSleepEditSave"
        @close="closeSleepEditDialog"
      />
<!--  ////______________NEW-->
<!--GROWTH EDIT DIALOG-->
      <GrowthDialog
        v-model="growthEditDialog.show"
        :loading="growthEditDialog.loading"
        :weight="growthEditData.weight"
        :height="growthEditData.height"
        :head-circumference="growthEditData.headCircumference"
        :notes="growthEditData.notes"
        :is-editing="true"
        :current-child="childrenStore.currentChild"
        @update:weight="growthEditData.weight = $event"
        @update:height="growthEditData.height = $event"
        @update:head-circumference="growthEditData.headCircumference = $event"
        @update:notes="growthEditData.notes = $event"
        @save="handleGrowthEditSave"
        @close="closeGrowthEditDialog"
      />

<!--  ////______________NEW-->
<!--HEALTH EDIT DIALOG-->
      <SymptomDialog
        v-model="healthEditDialog.show"
        :loading="healthEditDialog.loading"
        :symptoms="healthEditData.symptoms"
        :other-symptom="healthEditData.otherSymptom"
        :photo="healthEditData.photo"
        :notes="healthEditData.notes"
        :is-editing="true"
        :current-child="childrenStore.currentChild"
        @update:symptoms="healthEditData.symptoms = $event"
        @update:other-symptom="healthEditData.otherSymptom = $event"
        @update:photo="healthEditData.photo = $event"
        @update:notes="healthEditData.notes = $event"
        @save="handleHealthEditSave"
        @close="closeHealthEditDialog"
      />





      <!-- Delete Confirmation Dialog -->
<v-dialog v-model="deleteConfirmDialog.show" max-width="400" persistent>
  <v-card>
    <v-card-title class="text-h6">
      <v-icon class="mr-2" color="error">mdi-delete</v-icon>
      Confirm Delete
    </v-card-title>
    <v-card-text>
      <p>Are you sure you want to delete this entry?</p>
      <p class="text-caption text-grey">This action cannot be undone.</p>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn text @click="deleteConfirmDialog.show = false">Cancel</v-btn>
      <v-btn color="error" @click="confirmDelete">Delete</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useChildrenStore } from '@/stores/children'
  import { useMealsStore } from '@/stores/meals'
  import { usePoopStore } from '@/stores/poop'
  ////______________NEW
  import { useSleepStore } from '@/stores/sleep'
  import { useHealthStore } from '@/stores/health'
  import { useCheckinStore } from '@/stores/checkin'
  import { useMealOptions } from '@/composables/useMealOptions'
  import { usePoopOptions } from '@/composables/usePoopOptions'
  import { useSymptomOptions } from '@/composables/useSymptomOptions'
  import { timestampToDateString } from '@/utils/dateUtils'
  import { useGrowthDialog } from '@/composables/useGrowthDialog'
  import MealDialog from '@/components/dialog/MealDialog.vue'
  import PoopDialog from '@/components/dialog/PoopDialog.vue'
  ////______________NEW
  import SleepDialog from '@/components/dialog/SleepDialog.vue'
  import GrowthDialog from '@/components/dialog/GrowthDialog.vue'
  import SymptomDialog from '@/components/dialog/SymptomDialog.vue'


  // Store
  const childrenStore = useChildrenStore()
  const mealsStore = useMealsStore()
  const poopStore = usePoopStore()
  const checkinStore = useCheckinStore()
  ////______________NEW
  const sleepStore = useSleepStore()
  const symptomStore = useHealthStore()

  // Composables for mapping IDs to values
  const { mealTimeOptions, mealCategoryOptions, consumptionOptions } = useMealOptions()
  const { colorOptions, textureOptions } = usePoopOptions()
  ////______________NEW
  const { symptomOptions } = useSymptomOptions()


  // Local state for UI controls
  const selectedDate = ref(new Date())
  const selectedCategory = ref('all')
  const viewMode = ref('Daily')
  const datePickerMenu = ref(false)
  const isLoading = ref(false)

  // Edit dialog states
  const mealEditDialog = ref({
    show: false,
    loading: false,
    editingId: null
  })

  const poopEditDialog = ref({
    show: false,
    loading: false,
    editingId: null
  })

    //EDIT SLEEP DIALOG STATES
  const sleepEditDialog = ref({
    show: false,
    loading: false,
    editingId: null
  })

  const growthEditDialog = ref({
    show: false,
    loading: false,
    editingId: null
  })

  const healthEditDialog = ref({
    show: false,
    loading: false,
    editingId: null
  })


  // Edit form data
  const mealEditData = ref({
    mealTime: '',
    consumptionLevel: '',
    mealCategory: '',
    subCategory: '',
    customMeal: '',
    notes: ''
  })

  const poopEditData = ref({
    color: '',
    texture: '',
    notes: ''
  })

  //EDIT SLEEP FORM DATA
   const sleepEditData = ref({
    bedTime: '',
    awakeTime: '',
    notes: ''
  })

  const growthEditData = ref({
    weight: '',
    height: '',
    headCircumference: '',
    notes: ''
  })

  const healthEditData = ref({
    symptoms: [],
    otherSymptom: '',
    photo: null,
    notes: ''
  })



const deleteConfirmDialog = ref({
  show: false,
  itemToDelete: null,
  itemType: null
})

  

  // Categories
  const categories = ref([
    { value: 'all', label: 'All' },
    { value: 'growth', label: 'Growth' },
    { value: 'meal', label: 'Meal' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'poop', label: 'Poop' },
    { value: 'health', label: 'Health' },
  ])

  // View modes
  const viewModes = ref([
    { value: 'Daily', label: 'Daily' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Monthly', label: 'Monthly' },
  ])

  // Computed
  const formattedDate = computed(() => {
    const date = selectedDate.value
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  })

  // Get selected date as string for API calls
  const selectedDateString = computed(() => {
    const year = selectedDate.value.getFullYear()
    const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  // Helper functions to map database IDs to frontend values
  const mapMealTimeIdToValue = (id: number): string => {
    const option = mealTimeOptions.value.find(opt => opt.id === id)
    return option?.value || ''
  }

  const mapMealCategoryIdToValue = (id: number): string => {
    const option = mealCategoryOptions.value.find(opt => opt.id === id)
    return option?.value || ''
  }

  const mapConsumptionLevelToValue = (level: number): string => {
    return level.toString()
  }

  const mapColorIdToValue = (id: number): string => {
    const option = colorOptions.value.find(opt => opt.id === id)
    return option?.value || ''
  }

  const mapTextureIdToValue = (id: number): string => {
    const option = textureOptions.value.find(opt => opt.id === id)
    return option?.value || ''
  }

  //-------------NEW----------------------------



  // Convert real meal data to original timeline structure
  const convertMealsToTimeline = (meals: any[]) => {
    return meals.map(meal => ({
      id: meal.id,
      type: 'meal',
      timestamp: new Date(meal.check_in),
      childId: meal.child_id,
      carerId: 2, // Default carer ID for meals
      carerName: 'Sarah', // Default carer name
      data: {
        status: formatMealStatus(meal),
        details: formatMealDetails(meal)
      },
      rawData: meal // Keep raw data for editing
    }))
  }

  // Convert real poop data to original timeline structure
  const convertPoopToTimeline = (poops: any[]) => {
    return poops.map(poop => ({
      id: poop.id,
      type: 'poop',
      timestamp: new Date(poop.check_in),
      childId: poop.child_id,
      carerId: 2, // Default carer ID for poop
      carerName: 'Sarah', // Default carer name
      data: {
        status: 'Had bowel movement',
        details: formatPoopDetails(poop)
      },
      rawData: poop // Keep raw data for editing
    }))
  }

  //-----------------------NEW------------------------
  const convertSleepToTimeline = (sleepEntries: any[]) => {
    return sleepEntries.map(sleep => ({
      id: sleep.id,
      type: 'sleep',
      timestamp: new Date(sleep.check_in),
      childId: sleep.child_id,
      carerId: 2,
      carerName: 'Sarah',
      data: {
        status: formatSleepStatus(sleep),
        details: formatSleepDetails(sleep)
      },
      rawData: sleep
    }))
  }

  //---------------------------NEW-----------------------------
  const convertGrowthToTimeline = (growthEntries: any[]) => {
    return growthEntries.map(growth => ({
      id: growth.id,
      type: 'growth',
      timestamp: new Date(growth.check_in),
      childId: growth.child_id,
      carerId: 1,
      carerName: 'Dr. Smith',
      data: {
        status: 'Growth measurement',
        details: formatGrowthDetails(growth)
      },
      rawData: growth
    }))
  }


  //------------------------NEW-------------------------
  const convertHealthToTimeline = (healthEntries: any[]) => {
    return healthEntries.map(health => ({
      id: health.id,
      type: 'health',
      timestamp: new Date(health.check_in),
      childId: health.child_id,
      carerId: 3,
      carerName: 'Nurse Jenny',
      data: {
        status: formatHealthStatus(health),
        details: formatHealthDetails(health)
      },
      rawData: health
    }))
  }



  // Format meal status and details
  const formatMealStatus = (meal: any) => {
    console.log('🔍 Formatting meal status for:', meal)
    
    // Check if we have the joined time_category name
    if (meal.time_category) {
      const timeCategory = meal.time_category.charAt(0).toUpperCase() + meal.time_category.slice(1)
      return `Had ${timeCategory.toLowerCase()}`
    }
    
    // Fallback: map meal_time_category ID to name
    const timeCategoryNames = {
      1: 'breakfast',
      2: 'lunch', 
      3: 'dinner',
      4: 'snack'
    }
    
    if (meal.meal_time_category && timeCategoryNames[meal.meal_time_category]) {
      const timeName = timeCategoryNames[meal.meal_time_category]
      return `Had ${timeName}`
    }
    
    return 'Had meal'
  }

  const formatMealDetails = (meal: any) => {
    const parts = []
    
    console.log('🔍 Formatting meal details for:', meal)
    
    // SKIP meal category - only show the specific food from notes
    // This avoids showing "Rice, ate pizza" and just shows "ate pizza"
    
    // Add specific food from notes (this is the main food description)
    if (meal.note && meal.note.trim()) {
      parts.push(meal.note)
    }
    
    // Add custom meal from others field if available  
    if (meal.others && meal.others.trim()) {
      parts.push(meal.others)
    }
    
    // Add consumption percentage last
    if (meal.consumption_level !== undefined && meal.consumption_level !== null) {
      parts.push(`consumed ${meal.consumption_level}%`)
    }
    
    const result = parts.length > 0 ? parts.join(', ') : 'No details available'
    console.log('📝 Formatted meal details:', result)
    return result
  }

  const formatPoopDetails = (poop: any) => {
  const parts = []
  
  console.log('🔍 Formatting poop details for:', poop)
  
  // Add color and texture information
  if (poop.color_name && poop.texture_name) {
    parts.push(`${poop.color_name}, ${poop.texture_name} consistency`)
  } else if (poop.color_name) {
    parts.push(`${poop.color_name} consistency`)
  } else if (poop.texture_name) {
    parts.push(`${poop.texture_name} consistency`)
  } else {
    parts.push('normal consistency')
  }
  
  const result = parts.join(' - ')
  console.log('📝 Formatted poop details:', result)
  return result
}

  //---------------------NEW------------------------
  const formatSleepStatus = (sleep: any) => {
    const bedTime = sleep.start_time ? new Date(sleep.start_time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }) : 'Unknown'
    
    const awakeTime = sleep.end_time ? new Date(sleep.end_time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }) : 'Unknown'
    
    return `Slept from ${bedTime} to ${awakeTime}`
  }

  const formatSleepDetails = (sleep: any) => {
    if (sleep.start_time && sleep.end_time) {
      const startTime = new Date(sleep.start_time)
      const endTime = new Date(sleep.end_time)

let duration = endTime.getTime() - startTime.getTime()
    
    // ⬅️ ADD THIS: Handle overnight sleep (same logic as your store)
    if (duration < 0) {
      duration = duration + (24 * 60 * 60 * 1000) // Add 24 hours in milliseconds
    }      
      const hours = Math.floor(duration / (1000 * 60 * 60))
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0 && minutes > 0) {
        return `Duration: ${hours}h ${minutes}m`
      } else if (hours > 0) {
        return `Duration: ${hours}h`
      } else if (minutes > 0) {
        return `Duration: ${minutes}m`
      }
    }
    return 'Duration unknown'
  }

  const formatGrowthDetails = (growth: any) => {
    const parts = []
    
    if (growth.weight) parts.push(`Weight: ${growth.weight}kg`)
    if (growth.height) parts.push(`Height: ${growth.height}cm`)
    if (growth.head_circumference) parts.push(`Head: ${growth.head_circumference}cm`)
    
    return parts.length > 0 ? parts.join(', ') : 'No measurements available'
  }

  const formatHealthStatus = (health: any) => {
    if (health.symptom && health.symptom.includes(',')) {
      const symptoms = health.symptom.split(',')
      return `Has ${symptoms.length} symptoms`
    } else if (health.symptom) {
      return `Has ${health.symptom}`
    }
    return 'Health check'
  }

  const formatHealthDetails = (health: any) => {
    if (health.symptom) {
      const symptoms = health.symptom.split(',').map(s => s.trim()).filter(s => s)
      return symptoms.join(', ')
    }
    return 'No symptoms recorded'
  }




  // Filter mock data by selected date and current child
  /* const filteredMockCheckins = computed(() => {
    if (!childrenStore.currentChild) return []
    
    const selectedDateStr = selectedDate.value.toDateString()
    return mockCheckins.value.filter(checkin => 
      checkin.childId === childrenStore.currentChild.id &&
      checkin.timestamp.toDateString() === selectedDateStr
    )
  })
 */


  // Store raw data for timeline
  const rawMealsData = ref([])
  const rawPoopData = ref([])
  //-------------NEW-----------
   const rawSleepData = ref([])
  const rawGrowthData = ref([])
  const rawHealthData = ref([])


  //--------------------NEW------------------
  // Get real data from stores and convert to timeline format
  const realCheckins = computed(() => {
    const checkins = []
    
    if (rawMealsData.value.length > 0) {
      checkins.push(...convertMealsToTimeline(rawMealsData.value))
    }

    if (rawPoopData.value.length > 0) {
      checkins.push(...convertPoopToTimeline(rawPoopData.value))
    }

    if (rawSleepData.value.length > 0) {
      checkins.push(...convertSleepToTimeline(rawSleepData.value))
    }

    if (rawGrowthData.value.length > 0) {
      checkins.push(...convertGrowthToTimeline(rawGrowthData.value))
    }

    if (rawHealthData.value.length > 0) {
      checkins.push(...convertHealthToTimeline(rawHealthData.value))
    }

    return checkins
  })



  //--------------------NEW------------------
  // Filter checkins by current child
  const checkinsByChild = computed(() => {
    if (!childrenStore.currentChild) return []
    return realCheckins.value.filter(checkin =>
      checkin.childId === childrenStore.currentChild.id
    )
  })


    //--------------------NEW------------------
  // Apply filters for category and date range
  const filteredCheckins = computed(() => {
    let filtered = checkinsByChild.value

    // Apply category filter
    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(checkin => checkin.type === selectedCategory.value)
    }

    // Apply date filtering based on view mode
    if (viewMode.value === 'Daily') {
      // Filter by selected date
      const selectedDateStr = selectedDate.value.toDateString()
      filtered = filtered.filter(checkin => 
        checkin.timestamp.toDateString() === selectedDateStr
      )
    } else if (viewMode.value === 'Weekly') {
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
      const selectedMonth = selectedDate.value.getMonth()
      const selectedYear = selectedDate.value.getFullYear()

      filtered = filtered.filter(checkin =>
        checkin.timestamp.getMonth() === selectedMonth &&
        checkin.timestamp.getFullYear() === selectedYear
      )
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  })

 

 
  
  //-------------------NEW---------------
  // Methods (keeping original logic)
  const getCategoryIcon = (type: string) => {
    const icons = {
      sleep: 'mdi-sleep',
      meal: 'mdi-silverware-fork-knife',
      poop: 'mdi-emoticon-poop',
      growth: 'mdi-ruler',
      health: 'mdi-heart',
    }
    return icons[type] || 'mdi-clipboard-text'
  }



  const formatCheckinStatus = (checkin: any) => {
    
    // Handle other checkin types
    return checkin.data.status
  }

  
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase()
  }

  const formatDateInfo = (timestamp: Date) => {
    const date = new Date(timestamp)
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
    }
  }

  const handleDateChange = (date: Date) => {
    selectedDate.value = date
    datePickerMenu.value = false
    // Data will automatically refresh due to computed dependencies
  }

  const deleteCheckin = async (checkin) => {
  // Store what we want to delete
  deleteConfirmDialog.value.itemToDelete = checkin
  deleteConfirmDialog.value.itemType = checkin.type
  deleteConfirmDialog.value.show = true
}


  //-------------------NEW------------------
   const confirmDelete = async () => {
    const checkin = deleteConfirmDialog.value.itemToDelete
    
    try {
      if (checkin.type === 'meal' && checkin.rawData) {
        await fetch(`http://127.0.0.1:8000/meal/${checkin.rawData.id}`, { method: 'DELETE' })
      } else if (checkin.type === 'poop' && checkin.rawData) {
        await fetch(`http://127.0.0.1:8000/poop/${checkin.rawData.id}`, { method: 'DELETE' })
      } else if (checkin.type === 'sleep' && checkin.rawData) {
        await fetch(`http://127.0.0.1:8000/sleep/${checkin.rawData.id}`, { method: 'DELETE' })
      } else if (checkin.type === 'growth' && checkin.rawData) {
        await fetch(`http://127.0.0.1:8000/growth/${checkin.rawData.id}`, { method: 'DELETE' })
      } else if (checkin.type === 'health' && checkin.rawData) {
        await fetch(`http://127.0.0.1:8000/symptom/${checkin.rawData.id}`, { method: 'DELETE' })
      }
      
      deleteConfirmDialog.value.show = false
      await loadData()
      
    } catch (error) {
      alert('Failed to delete entry')
    }
  }


  //---------------------NEW EDIT FUNCTIONALITY IMPLEMENTATION
  const editCheckin = (checkin: any) => {
    console.log('🖊️ Edit checkin:', checkin)
    
    if (checkin.type === 'meal' && checkin.rawData) {
      openMealEditDialog(checkin)
    } else if (checkin.type === 'poop' && checkin.rawData) {
      openPoopEditDialog(checkin)
    } else if (checkin.type === 'sleep' && checkin.rawData) {
      openSleepEditDialog(checkin)
    } else if (checkin.type === 'growth' && checkin.rawData) {
      openGrowthEditDialog(checkin)
    } else if (checkin.type === 'health' && checkin.rawData) {
      openHealthEditDialog(checkin)
    } else {
      console.log('Edit not implemented for:', checkin.type)
    }
  }

  // Meal Edit Functions
  const openMealEditDialog = (checkin: any) => {
    const meal = checkin.rawData
    console.log('🍽️ Opening meal edit dialog with data:', meal)
    
    // Map database values to frontend values
    mealEditData.value = {
      mealTime: mapMealTimeIdToValue(meal.meal_time_category),
      consumptionLevel: mapConsumptionLevelToValue(meal.consumption_level),
      mealCategory: mapMealCategoryIdToValue(meal.meal_category),
      subCategory: '', // Handle sub-categories if needed
      customMeal: meal.others || '',
      notes: meal.note || ''
    }
    
    mealEditDialog.value.editingId = meal.id
    mealEditDialog.value.show = true
  }

  const closeMealEditDialog = () => {
    mealEditDialog.value.show = false
    mealEditDialog.value.editingId = null
    mealEditDialog.value.loading = false
    
    // Reset form data
    mealEditData.value = {
      mealTime: '',
      consumptionLevel: '',
      mealCategory: '',
      subCategory: '',
      customMeal: '',
      notes: ''
    }
  }

  const handleMealEditSave = async () => {
    console.log('💾 Saving meal edit:', mealEditData.value)
    
    if (!mealEditDialog.value.editingId) {
      console.error('No meal ID to edit')
      return
    }

    mealEditDialog.value.loading = true
    
    try {
      const mealId = mealEditDialog.value.editingId
      console.log('🔍 Editing meal ID:', mealId)
      
      // Get original meal data to preserve meal time and check_in timestamp
      const originalMeal = rawMealsData.value.find(meal => meal.id === mealId)
      if (!originalMeal) {
        console.error('❌ Original meal data not found for ID:', mealId)
        console.log('📋 Available meals:', rawMealsData.value.map(m => ({ id: m.id, note: m.note })))
        throw new Error('Original meal data not found')
      }
      
      console.log('📋 Original meal data:', originalMeal)
      
      // Map only the editable fields back to database IDs
      const mealCategoryId = mealCategoryOptions.value.find(opt => opt.value === mealEditData.value.mealCategory)?.id
      console.log('🔍 Mapped meal category ID:', mealCategoryId)
      
      if (!mealCategoryId) {
        console.error('❌ Could not find meal category ID for:', mealEditData.value.mealCategory)
        throw new Error('Invalid meal category selected')
      }
      
      // Prepare the update payload - EXACTLY preserve original data except editable fields
      const updatePayload = {
        id: mealId,
        child_id: originalMeal.child_id,
        meal_time_category: originalMeal.meal_time_category, // PRESERVE - cannot be changed
        consumption_level: parseFloat(mealEditData.value.consumptionLevel),
        meal_category: mealCategoryId, // Only this can be changed
        others: mealEditData.value.mealCategory === 'others' ? mealEditData.value.customMeal : (originalMeal.others || null),
        note: mealEditData.value.notes || null, // Only this can be changed
        check_in: originalMeal.check_in // PRESERVE - cannot be changed
      }
      
      console.log(`🔄 UPDATE (not create) meal ID ${mealId}`)
      console.log(`🔒 PRESERVING original check_in: ${originalMeal.check_in}`)
      console.log(`🔒 PRESERVING original meal_time_category: ${originalMeal.meal_time_category}`)
      console.log(`📝 UPDATE payload:`, updatePayload)
      
      // Call the PUT update API (this should UPDATE existing record, not create new)
      const response = await fetch(`http://127.0.0.1:8000/meal/${mealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        throw new Error(`Failed to update meal: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const updatedMeal = await response.json()
      console.log('✅ Meal updated successfully:', updatedMeal)
      console.log('🔍 Updated meal check_in:', updatedMeal.check_in)
      console.log('🔍 Updated meal meal_time_category:', updatedMeal.meal_time_category)
      
      // Clear the cache completely and reload fresh data
      rawMealsData.value = []
      rawPoopData.value = []
      
      // Wait a moment for database to be consistent
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await loadData()
      closeMealEditDialog()
      
      console.log('✅ Edit completed - should see only updated record, no duplicates')
      
    } catch (error) {
      console.error('❌ Failed to update meal:', error)
      alert(`Failed to update meal: ${error.message}`)
    } finally {
      mealEditDialog.value.loading = false
    }
  }

  // Poop Edit Functions
  const openPoopEditDialog = (checkin: any) => {
    const poop = checkin.rawData
    console.log('💩 Opening poop edit dialog with data:', poop)
    
    // Map database values to frontend values
    poopEditData.value = {
      color: mapColorIdToValue(poop.color),
      texture: mapTextureIdToValue(poop.texture),
      notes: poop.note || ''
    }
    
    poopEditDialog.value.editingId = poop.id
    poopEditDialog.value.show = true
  }

  const closePoopEditDialog = () => {
    poopEditDialog.value.show = false
    poopEditDialog.value.editingId = null
    poopEditDialog.value.loading = false
    
    // Reset form data
    poopEditData.value = {
      color: '',
      texture: '',
      notes: ''
    }
  }

  const handlePoopEditSave = async (poopData) => {
  console.log('💾 Saving poop edit:', poopData)
  
  if (!poopEditDialog.value.editingId) {
    console.error('No poop ID to edit')
    return
  }

  poopEditDialog.value.loading = true
  
  try {
    const poopId = poopEditDialog.value.editingId
    
    // Get original poop data
    const originalPoop = rawPoopData.value.find(poop => poop.id === poopId)
    if (!originalPoop) {
      throw new Error('Original poop data not found')
    }
    
    // Map frontend values back to database IDs
    const colorId = colorOptions.value.find(opt => opt.value === poopData.color)?.id
    const textureId = textureOptions.value.find(opt => opt.value === poopData.texture)?.id
    
    if (!colorId || !textureId) {
      throw new Error('Invalid color or texture selected')
    }
    
    // FIXED: Ensure check_in is a proper datetime string, not timestamp
    let checkInValue = originalPoop.check_in
    if (typeof checkInValue === 'number') {
      // Convert timestamp to ISO string
      checkInValue = new Date(checkInValue).toISOString()
    } else if (typeof checkInValue === 'string' && !checkInValue.includes('T')) {
      // If it's already a string but not ISO format, convert it
      checkInValue = new Date(checkInValue).toISOString()
    }
    
    const updatePayload = {
      id: poopId,
      child_id: originalPoop.child_id,
      color: colorId,
      texture: textureId,
      note: poopData.notes || null,
      check_in: checkInValue  // FIXED: Now sends proper datetime string
    }
    
    console.log('📝 Sending update payload:', updatePayload)
    
    // Call API
    const response = await fetch(`http://127.0.0.1:8000/poop/${poopId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }
    
    // Clear cache and reload data
    rawMealsData.value = []
    rawPoopData.value = []
    await new Promise(resolve => setTimeout(resolve, 500))
    await loadData()
    closePoopEditDialog()
    
  } catch (error) {
    console.error('❌ Failed to update poop:', error)
    alert(`Failed to update poop: ${error.message}`)
  } finally {
    poopEditDialog.value.loading = false
  }
  }


  //----------------------------------------------------------------------
  //——------------------------SLEEP DIALOG--------------------------------------//
  //-------------------------------------------------------------------
  
  const openSleepEditDialog = (checkin: any) => {
    const sleep = checkin.rawData
    console.log('😴 Opening sleep edit dialog with data:', sleep)
    
    // Format times for the dialog
    const formatTimeForDialog = (timeString) => {
      if (!timeString) return ''
      const date = new Date(timeString)
      return date.toTimeString().slice(0, 5) // HH:MM format
    }
    
    sleepEditData.value = {
      bedTime: formatTimeForDialog(sleep.start_time),
      awakeTime: formatTimeForDialog(sleep.end_time),
      notes: sleep.note || ''
    }
    
    sleepEditDialog.value.editingId = sleep.id
    sleepEditDialog.value.show = true
  }

  const closeSleepEditDialog = () => {
    sleepEditDialog.value.show = false
    sleepEditDialog.value.editingId = null
    sleepEditDialog.value.loading = false
    
    sleepEditData.value = {
      bedTime: '',
      awakeTime: '',
      notes: ''
    }
  }

  const handleSleepEditSave = async (sleepData) => {
    console.log('💾 Saving sleep edit:', sleepData)
    
    if (!sleepEditDialog.value.editingId) {
      console.error('No sleep ID to edit')
      return
    }

    sleepEditDialog.value.loading = true
    
    try {
      const sleepId = sleepEditDialog.value.editingId
      const originalSleep = rawSleepData.value.find(sleep => sleep.id === sleepId)
      if (!originalSleep) {
        throw new Error('Original sleep data not found')
      }
      
      // Convert time strings to full datetime
      const createDateTime = (timeString, baseDate) => {
        if (!timeString) return null
        const [hours, minutes] = timeString.split(':')
        const date = new Date(baseDate)
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        return date.toISOString()
      }
      
      const baseDate = new Date(originalSleep.check_in)
      let startDateTime = createDateTime(sleepData.bedTime, baseDate)
      let endDateTime = createDateTime(sleepData.awakeTime, baseDate)
      
      // Handle overnight sleep
      if (endDateTime && startDateTime && new Date(endDateTime) < new Date(startDateTime)) {
        const endDate = new Date(endDateTime)
        endDate.setDate(endDate.getDate() + 1)
        endDateTime = endDate.toISOString()
      }
      
      const updatePayload = {
        id: sleepId,
        child_id: originalSleep.child_id,
        start_time: startDateTime,
        end_time: endDateTime,
        note: sleepData.notes || null,
        check_in: originalSleep.check_in
      }
      
      const response = await fetch(`http://127.0.0.1:8000/sleep/${sleepId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }
      
      await loadData()
      closeSleepEditDialog()
      
    } catch (error) {
      console.error('❌ Failed to update sleep:', error)
      alert(`Failed to update sleep: ${error.message}`)
    } finally {
      sleepEditDialog.value.loading = false
    }
  }


  //----------------------------------------------------------------------
  //——-----------------------GROWTH DIALOG--------------------------------------//
  //-------------------------------------------------------------------
  const openGrowthEditDialog = (checkin: any) => {
    const growth = checkin.rawData
    console.log('📏 Opening growth edit dialog with data:', growth)
    
    growthEditData.value = {
      weight: growth.weight?.toString() || '',
      height: growth.height?.toString() || '',
      headCircumference: growth.head_circumference?.toString() || '',
      notes: growth.note || ''
    }
    
    growthEditDialog.value.editingId = growth.id
    growthEditDialog.value.show = true
  }

  const closeGrowthEditDialog = () => {
    growthEditDialog.value.show = false
    growthEditDialog.value.editingId = null
    growthEditDialog.value.loading = false
    
    growthEditData.value = {
      weight: '',
      height: '',
      headCircumference: '',
      notes: ''
    }
  }

  const handleGrowthEditSave = async (growthData) => {
    console.log('💾 Saving growth edit:', growthData)
    
    if (!growthEditDialog.value.editingId) {
      console.error('No growth ID to edit')
      return
    }

    growthEditDialog.value.loading = true
    
    try {
      const growthId = growthEditDialog.value.editingId
      const originalGrowth = rawGrowthData.value.find(growth => growth.id === growthId)
      if (!originalGrowth) {
        throw new Error('Original growth data not found')
      }
      
      const updatePayload = {
        id: growthId,
        child_id: originalGrowth.child_id,
        weight: parseFloat(growthData.weight),
        height: parseFloat(growthData.height),
        head_circumference: parseFloat(growthData.headCircumference),
        note: growthData.notes || null,
        check_in: originalGrowth.check_in
      }
      
      const response = await fetch(`http://127.0.0.1:8000/growth/${growthId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }
      
      await loadData()
      closeGrowthEditDialog()
      
    } catch (error) {
      console.error('❌ Failed to update growth:', error)
      alert(`Failed to update growth: ${error.message}`)
    } finally {
      growthEditDialog.value.loading = false
    }
  }



  //----------------------------------------------------------------------
  //——-----------------------HEALTH DIALOG--------------------------------------//
  //-------------------------------------------------------------------
  const openHealthEditDialog = (checkin: any) => {
    const health = checkin.rawData
    console.log('🏥 Opening health edit dialog with data:', health)
    console.log('🔍 Raw health.symptom:', health.symptom)
    
    // Parse symptoms from database string format
    let symptoms = []
    let otherSymptom = ''
    
    if (health.symptom) {
      const symptomList = health.symptom.split(',').map(s => s.trim()).filter(s => s)
      console.log('📝 Parsed symptom list:', symptomList)
      
      // Map database symptom names to frontend values
      const mappedSymptoms = []
      
      for (const dbSymptom of symptomList) {
        // Find matching symptom option by label (case-insensitive)
        const matchingOption = symptomOptions.value.find(option => 
          option.label.toLowerCase() === dbSymptom.toLowerCase()
        )
        
        if (matchingOption) {
          console.log(`✅ Mapped "${dbSymptom}" to "${matchingOption.value}"`)
          mappedSymptoms.push(matchingOption.value)
        } else {
          // If no match found, treat as custom symptom
          console.log(`❓ No match for "${dbSymptom}", treating as custom`)
          if (!mappedSymptoms.includes('other')) {
            mappedSymptoms.push('other')
          }
          if (otherSymptom) {
            otherSymptom += ', ' + dbSymptom
          } else {
            otherSymptom = dbSymptom
          }
        }
      }
      
      symptoms = mappedSymptoms
      console.log('🎯 Final mapped symptoms:', symptoms)
      console.log('📝 Final otherSymptom:', otherSymptom)
    }
    
    healthEditData.value = {
      symptoms: symptoms,
      otherSymptom: otherSymptom,
      photo: null, // Note: We can't easily retrieve the original file
      notes: health.note || ''
    }
    
    healthEditDialog.value.editingId = health.id
    healthEditDialog.value.show = true
  }

  const closeHealthEditDialog = () => {
    healthEditDialog.value.show = false
    healthEditDialog.value.editingId = null
    healthEditDialog.value.loading = false
    
    healthEditData.value = {
      symptoms: [],
      otherSymptom: '',
      photo: null,
      notes: ''
    }
  }

  const handleHealthEditSave = async (healthData) => {
    console.log('💾 Saving health edit:', healthData)
    
    if (!healthEditDialog.value.editingId) {
      console.error('No health ID to edit')
      return
    }

    healthEditDialog.value.loading = true
    
    try {
      const healthId = healthEditDialog.value.editingId
      const originalHealth = rawHealthData.value.find(health => health.id === healthId)
      if (!originalHealth) {
        throw new Error('Original health data not found')
      }
      
      // Combine symptoms into a string format for database
      let symptomString = ''
      if (healthData.symptoms && healthData.symptoms.length > 0) {
        const allSymptoms = [...healthData.symptoms]
        if (healthData.symptoms.includes('other') && healthData.otherSymptom) {
          // Replace 'other' with the actual custom symptom
          const otherIndex = allSymptoms.indexOf('other')
          allSymptoms[otherIndex] = healthData.otherSymptom
        }
        symptomString = allSymptoms.join(', ')
      }
      
      // Note: Photo handling would need to be implemented based on your file upload system
      let photoUrl = originalHealth.photo_url || ''
      if (healthData.photo) {
        // TODO: Implement file upload to get new photo URL
        console.log('Photo upload not implemented in this example')
      }
      
      const updatePayload = {
        id: healthId,
        child_id: originalHealth.child_id,
        symptom: symptomString,
        photo_url: photoUrl,
        note: healthData.notes || null,
        check_in: originalHealth.check_in
      }
      
      const response = await fetch(`http://127.0.0.1:8000/symptom/${healthId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }
      
      await loadData()
      closeHealthEditDialog()
      
    } catch (error) {
      console.error('❌ Failed to update health:', error)
      alert(`Failed to update health: ${error.message}`)
    } finally {
      healthEditDialog.value.loading = false
    }
  }


  //------------------NEW------------------
  // Load real data when component mounts or date changes
  const loadData = async () => {
  if (!childrenStore.currentChild) {
    console.warn('No current child selected')
    return
  }

  isLoading.value = true
  try {
    console.log(`🔄 Loading timeline data for ${viewMode.value} view`)

    // Clear previous data
    rawMealsData.value = []
    rawPoopData.value = []
    rawSleepData.value = []
    rawGrowthData.value = []
    rawHealthData.value = []

    const childId = childrenStore.currentChild.id
    
    // Fetch all data types in parallel (get more days for weekly/monthly)
    const promises = [
      // Meals - get 60 days and filter in frontend
      fetch(`http://127.0.0.1:8000/meal/child/${childId}?days=60`)
        .then(res => res.json())
        .then(allMeals => {
          console.log(`📊 Got ${allMeals.length} total meals`)
          rawMealsData.value = allMeals  // ← STORE ALL MEALS, DON'T FILTER HERE
        }),

      // Poop - get 60 days  
      fetch(`http://127.0.0.1:8000/poop/child/${childId}?days=60`)
        .then(res => res.json())
        .then(allPoop => {
          console.log(`📊 Got ${allPoop.length} total poop records`)
          rawPoopData.value = allPoop  // ← STORE ALL, DON'T FILTER HERE
        }),

      // Sleep - get 60 days
      fetch(`http://127.0.0.1:8000/sleep/child/${childId}?days=60`)
        .then(res => res.json())
        .then(allSleep => {
          console.log(`📊 Got ${allSleep.length} total sleep records`)
          rawSleepData.value = allSleep  // ← STORE ALL, DON'T FILTER HERE
        }),

      // Growth - get 60 days
      fetch(`http://127.0.0.1:8000/growth/child/${childId}?days=60`)
        .then(res => res.json())
        .then(allGrowth => {
          console.log(`📊 Got ${allGrowth.length} total growth records`)
          rawGrowthData.value = allGrowth  // ← STORE ALL, DON'T FILTER HERE
        }),

      // Health - get 60 days
      fetch(`http://127.0.0.1:8000/symptom/child/${childId}?days=60`)
        .then(res => res.json())
        .then(allHealth => {
          console.log(`📊 Got ${allHealth.length} total health records`)
          rawHealthData.value = allHealth  // ← STORE ALL, DON'T FILTER HERE
        })
    ]

    await Promise.all(promises)
    console.log(`✅ All data loaded - let filteredCheckins do the filtering!`)
    
  } catch (error) {
    console.error('❌ Failed to load timeline data:', error)
  } finally {
    isLoading.value = false
  }
}

  // Watch for child changes
  watch(() => childrenStore.currentChild?.id, (newChildId) => {
    if (newChildId) {
      console.log(`Timeline updated for child: ${childrenStore.currentChild.name} (ID: ${newChildId})`)
      loadData()
    }
  }, { immediate: true })

  // Watch for date changes
  watch(selectedDateString, () => {
    loadData()
  })

  // Add this new watcher after your existing watchers
  watch(viewMode, () => {
    console.log(`📍 View mode changed to: ${viewMode.value}`)
    loadData() // Reload data when view mode changes
  })


  // Initialize
  onMounted(() => {
    if (childrenStore.currentChild) {
      console.log(`Timeline initialized for: ${childrenStore.currentChild.name}`)
      loadData()
    }
  })

  // Expose methods for external components
  defineExpose({
    loadData,
    editCheckin,
    deleteCheckin,
  })


  
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

// Force beige background on the main container
.v-main {
  background-color: $app-beige !important;
  background-image: none !important;
}

// Override global button styles for date picker
:deep(.v-date-picker) {
  .v-btn {
    all: unset !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    border-radius: 50% !important;
    min-width: 32px !important;
    height: 32px !important;
    font-family: $font-primary !important;
    font-size: 14px !important;
    font-weight: 400 !important;

    &:hover {
      background-color: rgba($app-primary, 0.1) !important;
    }

    &.v-btn--active,
    &.v-date-picker-month__day--selected {
      background-color: $app-primary !important;
      color: white !important;
    }
  }

  .v-date-picker-header .v-btn {
    border-radius: 4px !important;
    min-width: auto !important;
    padding: 8px !important;
  }

  .v-date-picker-month__day {
    border-radius: 50% !important;

    &--selected {
      background-color: $app-primary !important;
      color: white !important;
    }

    &:hover:not(.v-date-picker-month__day--selected) {
      background-color: rgba($app-primary, 0.1) !important;
    }
  }
}

.timeline-container {
  max-width: 800px;
  margin: 0 auto;
  padding: $spacing-xl $spacing-lg;
}

.timeline-wrapper {
  background: #ffffff !important;
  border-radius: $border-radius-lg;
  padding: $spacing-xl;
  box-shadow: $shadow-md;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.timeline-header {
  margin-bottom: $spacing-xl;
}

// Header title styling
.text-h4 {
  font-family: $font-heading;
  font-weight: 600;
  color: $app-text-primary;
  letter-spacing: -0.025em;
}

/* Category Tabs Styling */
.category-tabs {
  display: flex;
  justify-content: center;
  gap: $spacing-xl;
  border-bottom: 1px solid $glass-border;
  padding-bottom: $spacing-sm;
}

.category-tab {
  background: none;
  border: none;
  cursor: pointer;
  font-family: $font-primary;
  text-transform: none;
  font-weight: 500;
  font-size: 16px;
  letter-spacing: -0.01em;
  min-width: auto;
  padding: $spacing-sm 0;
  height: auto;
  border-radius: 0;
  border-bottom: 2px solid transparent;
  transition: $transition-base;
  color: $app-text-secondary;

  &.active {
    color: $app-primary;
    border-bottom-color: $app-primary;
    font-weight: 600;
  }

  &:hover {
    color: $app-primary;
  }
}

/* Controls Section */
.controls-row {
  display: flex;
  justify-content: center;
  align-items: center;
}

.controls-group {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

/* Date Picker Button */
.date-picker-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $glass-white;
  border: 1px solid $dialog-border;
  cursor: pointer;
  font-family: $font-primary;
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.01em;
  min-width: 200px;
  height: 44px;
  padding: 0 $spacing-md;
  border-radius: $border-radius-md;
  color: $app-text-primary;
  transition: $transition-base;
  backdrop-filter: blur($glass-blur-sm);

  &:hover {
    border-color: $field-border-hover;
    background: $glass-white-light;
    box-shadow: $shadow-sm;
  }

  &:focus {
    outline: none;
    border-color: $app-primary;
    box-shadow: 0 0 0 2px rgba($app-primary, 0.1);
  }

  .v-icon {
    color: $app-grey;
  }

  &:hover .v-icon {
    color: $app-text-primary;
  }
}

/* View Toggle */
.view-toggle {
  display: flex;
  gap: 0;
  border: 1px solid $dialog-border;
  border-radius: $border-radius-sm;
  overflow: hidden;
  background: $glass-white;
  backdrop-filter: blur($glass-blur-sm);
}

.view-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: $font-primary;
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.01em;
  border-radius: 0;
  min-width: 70px;
  height: 32px;
  transition: $transition-base;
  color: $app-text-secondary;

  &.active {
    background-color: $app-primary;
    color: white;
    font-weight: 600;
  }

  &:hover:not(.active) {
    background-color: $dropdown-hover;
    color: $app-text-primary;
  }
}

/* Timeline Content */
.timeline-content {
  position: relative;
}

.timeline-list {
  position: relative;
}

.timeline-item {
  position: relative;
  margin-bottom: $spacing-xl;
}

.timeline-line {
  position: absolute;
  left: 24px;
  top: 48px;
  bottom: -#{$spacing-xl};
  width: 1px;
  background: linear-gradient(180deg,
    $glass-border 0%,
    rgba($app-primary, 0.2) 50%,
    $glass-border 100%
  );
  z-index: 1;
}

.timeline-row {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
}

.timeline-icon-container {
  position: relative;
  z-index: 2;
}

.timeline-icon {
  border: 1px solid $glass-pink-border;
  background: $glass-white;
  backdrop-filter: blur($glass-blur-sm);
  box-shadow: $shadow-sm;
}

/* Timeline Columns */
.date-column {
  text-align: center;
  min-width: 60px;
  margin-top: $spacing-xs;
}

.date-day {
  font-family: $font-primary;
  font-size: 12px;
  color: $app-text-muted;
  font-weight: 500;
  text-transform: uppercase;
  line-height: 1.2;
  letter-spacing: 0.5px;
}

.date-number {
  font-family: $font-heading;
  font-size: 32px;
  font-weight: 700;
  color: $app-text-primary;
  line-height: 1;
  margin: 2px 0;
}

.date-month {
  font-family: $font-primary;
  font-size: 12px;
  color: $app-text-muted;
  font-weight: 500;
  line-height: 1.2;
}

.time-column {
  min-width: 80px;
  margin-top: $spacing-xs;
}

.time-value {
  font-family: $font-primary;
  font-size: 16px;
  font-weight: 600;
  color: $app-text-primary;
  line-height: 1.2;
}

.content-column {
  flex: 1;
  margin-top: $spacing-xs;
}

.status-text {
  font-family: $font-primary;
  font-size: 16px;
  font-weight: 500;
  color: $app-text-primary;
  line-height: 1.3;
  margin-bottom: $spacing-xs;
  letter-spacing: -0.01em;
}

.details-text {
  font-family: $font-primary;
  font-size: 14px;
  color: $app-text-secondary;
  line-height: 1.3;
  margin-bottom: 6px;
}

.author-text {
  font-family: $font-child;
  font-size: 12px;
  color: $app-text-muted;
  font-weight: 500;
  line-height: 1.2;
}

/* Action Buttons */
.actions-column {
  display: flex;
  gap: $spacing-xs;
  margin-top: $spacing-xs;
}

.action-btn {
  background: $glass-white;
  border: 1px solid $glass-border;
  cursor: pointer;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition-base;
  backdrop-filter: blur($glass-blur-sm);

  &:hover {
    background: $glass-white-light;
    border-color: $app-primary;
    box-shadow: $shadow-sm;
  }

  .v-icon {
    color: $app-grey;
    transition: $transition-base;
  }

  &:hover .v-icon {
    color: $app-primary;
  }
}

/* Empty state styling */
.text-center {
  .v-icon {
    color: $app-text-muted;
  }

  p {
    font-family: $font-primary;
    color: $app-text-muted;
    font-size: 16px;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .timeline-container {
    padding: $spacing-md;
  }

  .category-tabs {
    gap: $spacing-md;
    flex-wrap: wrap;
  }

  .controls-row {
    justify-content: center;
  }

  .controls-group {
    flex-direction: column;
    gap: $spacing-sm;
    align-items: stretch;
  }

  .date-picker-btn {
    min-width: 200px;
  }

  .timeline-row {
    gap: $spacing-sm;
  }

  .date-number {
    font-size: 24px;
  }
}

</style>