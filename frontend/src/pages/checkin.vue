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
        @update:color="poopEditData.color = $event"
        @update:texture="poopEditData.texture = $event"
        @update:notes="poopEditData.notes = $event"
        @save="handlePoopEditSave"
        @close="closePoopEditDialog"
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
  import { useCheckinStore } from '@/stores/checkin'
  import { useMealOptions } from '@/composables/useMealOptions'
  import { usePoopOptions } from '@/composables/usePoopOptions'
  import { timestampToDateString } from '@/utils/dateUtils'
  import MealDialog from '@/components/dialog/MealDialog.vue'
  import PoopDialog from '@/components/dialog/PoopDialog.vue'

  // Store
  const childrenStore = useChildrenStore()
  const mealsStore = useMealsStore()
  const poopStore = usePoopStore()
  const checkinStore = useCheckinStore()

  // Composables for mapping IDs to values
  const { mealTimeOptions, mealCategoryOptions, consumptionOptions } = useMealOptions()
  const { colorOptions, textureOptions } = usePoopOptions()

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

const deleteConfirmDialog = ref({
  show: false,
  itemToDelete: null,
  itemType: null
})

  // Mock data for Growth, Sleep, Health (keeping original structure)
  const mockCheckins = ref([
    // Sample Growth data
    {
      id: 1,
      type: 'growth',
      timestamp: new Date(),
      childId: childrenStore.currentChild?.id || 1,
      carerId: 1,
      carerName: 'Dr. Smith',
      data: {
        status: 'Growth measurement',
        details: 'Height: 100cm, Weight: 20kg, Head: 45cm',
      },
    },
    // Sample Sleep data
    {
      id: 2,
      type: 'sleep',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      childId: childrenStore.currentChild?.id || 1,
      carerId: 2,
      carerName: 'Sarah',
      data: {
        status: 'Awake',
      },
    },
    {
      id: 3,
      type: 'sleep',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      childId: childrenStore.currentChild?.id || 1,
      carerId: 2,
      carerName: 'Sarah',
      data: {
        status: 'Fell asleep',
      },
    },
    // Sample Health data
    {
      id: 4,
      type: 'health',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      childId: childrenStore.currentChild?.id || 1,
      carerId: 3,
      carerName: 'Nurse Jenny',
      data: {
        status: 'Routine checkup',
        details: 'All vitals normal',
      },
    },
  ])

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
        status: 'Diaper change',
        details: formatPoopDetails(poop)
      },
      rawData: poop // Keep raw data for editing
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
    
    if (poop.color_name && poop.texture_name) {
      parts.push(`${poop.color_name}, ${poop.texture_name}`)
    } else if (poop.color_name) {
      parts.push(poop.color_name)
    } else if (poop.texture_name) {
      parts.push(poop.texture_name)
    }
    
    // Add default description
    if (parts.length > 0) {
      parts.push('consistency')
    } else {
      parts.push('normal consistency')
    }
    
    return parts.join(' - ')
  }

  // Filter mock data by selected date and current child
  const filteredMockCheckins = computed(() => {
    if (!childrenStore.currentChild) return []
    
    const selectedDateStr = selectedDate.value.toDateString()
    return mockCheckins.value.filter(checkin => 
      checkin.childId === childrenStore.currentChild.id &&
      checkin.timestamp.toDateString() === selectedDateStr
    )
  })

  // Store raw data for timeline
  const rawMealsData = ref([])
  const rawPoopData = ref([])

  // Get real data from stores and convert to timeline format
  const realCheckins = computed(() => {
    const checkins = []
    
    // Convert real meals data
    if (rawMealsData.value.length > 0) {
      console.log('🍽️ Converting meals to timeline:', rawMealsData.value)
      checkins.push(...convertMealsToTimeline(rawMealsData.value))
    }

    // Convert real poop data  
    if (rawPoopData.value.length > 0) {
      console.log('💩 Converting poop to timeline:', rawPoopData.value)
      checkins.push(...convertPoopToTimeline(rawPoopData.value))
    }

    console.log('📋 Total real checkins:', checkins.length)
    return checkins
  })

  // Combine real data (meal/poop) with mock data (others) maintaining original structure
  const allCheckins = computed(() => {
    return [...realCheckins.value, ...filteredMockCheckins.value]
  })

  // Filter checkins by current child (for consistent structure)
  const checkinsByChild = computed(() => {
    if (!childrenStore.currentChild) return []
    return allCheckins.value.filter(checkin =>
      checkin.childId === childrenStore.currentChild.id
    )
  })

  // Apply filters for category and date range (keeping original logic)
  const filteredCheckins = computed(() => {
    let filtered = checkinsByChild.value

    // Apply category filter
    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(checkin => checkin.type === selectedCategory.value)
    }

    // Apply date filtering based on view mode
    if (viewMode.value === 'Daily') {
      // Already filtered by selectedDate in computed properties
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

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  })

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

  const calculateSleepDuration = (checkin: any) => {
    if (checkin.type !== 'sleep' || !checkin.data.status.toLowerCase().includes('awake')) {
      return null
    }

    // Find the most recent "Fell asleep" entry before this awake entry for the same child
    const sleepEntries = checkinsByChild.value
      .filter(entry =>
        entry.type === 'sleep' &&
        entry.data.status.toLowerCase().includes('fell asleep') &&
        entry.timestamp < checkin.timestamp
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (sleepEntries.length === 0) {
      return null
    }

    const sleepStart = sleepEntries[0].timestamp
    const sleepEnd = checkin.timestamp
    const durationMs = new Date(sleepEnd).getTime() - new Date(sleepStart).getTime()
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    if (durationHours > 0) {
      return `${durationHours}h ${durationMinutes}m`
    } else {
      return `${durationMinutes}m`
    }
  }

  const formatSleepStatus = (checkin: any) => {
    const duration = calculateSleepDuration(checkin)
    if (duration && checkin.data.status.toLowerCase().includes('awake')) {
      return `Awake, slept for ${duration}`
    }
    return checkin.data.status
  }

  const formatCheckinStatus = (checkin: any) => {
    // Handle sleep status with duration calculation
    if (checkin.type === 'sleep') {
      return formatSleepStatus(checkin)
    }

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

const confirmDelete = async () => {
  const checkin = deleteConfirmDialog.value.itemToDelete
  
  try {
    if (checkin.type === 'meal' && checkin.rawData) {
      // Delete meal from API
      await fetch(`http://127.0.0.1:8000/meal/${checkin.rawData.id}`, { method: 'DELETE' })
    } else if (checkin.type === 'poop' && checkin.rawData) {
      // Delete poop from API  
      await fetch(`http://127.0.0.1:8000/poop/${checkin.rawData.id}`, { method: 'DELETE' })
    } else {
      // Delete mock data
      const index = mockCheckins.value.findIndex(item => item.id === checkin.id)
      if (index > -1) mockCheckins.value.splice(index, 1)
    }
    
    // Close dialog and reload data
    deleteConfirmDialog.value.show = false
    await loadData()
    
  } catch (error) {
    alert('Failed to delete entry')
  }
}

  // EDIT FUNCTIONALITY IMPLEMENTATION
  const editCheckin = (checkin: any) => {
    console.log('🖊️ Edit checkin:', checkin)
    
    if (checkin.type === 'meal' && checkin.rawData) {
      openMealEditDialog(checkin)
    } else if (checkin.type === 'poop' && checkin.rawData) {
      openPoopEditDialog(checkin)
    } else {
      console.log('Edit not implemented for:', checkin.type)
      // TODO: Implement edit for other types
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

  const handlePoopEditSave = async () => {
    console.log('💾 Saving poop edit:', poopEditData.value)
    
    if (!poopEditDialog.value.editingId) {
      console.error('No poop ID to edit')
      return
    }

    poopEditDialog.value.loading = true
    
    try {
      const poopId = poopEditDialog.value.editingId
      
      // Get the lookup data to map frontend values back to IDs
      await Promise.all([
        colorOptions.value.length === 0 ? loadPoopColors() : Promise.resolve(),
        textureOptions.value.length === 0 ? loadPoopTextures() : Promise.resolve()
      ])
      
      // Map frontend values back to database IDs
      const colorId = colorOptions.value.find(opt => opt.value === poopEditData.value.color)?.id
      const textureId = textureOptions.value.find(opt => opt.value === poopEditData.value.texture)?.id
      
      // Prepare the update payload matching your backend schema
      const updatePayload = {
        id: poopId,
        child_id: childrenStore.currentChild.id,
        color: colorId,
        texture: textureId,
        note: poopEditData.value.notes,
        check_in: new Date().toISOString() // Keep original timestamp or use current
      }
      
      console.log(`🔄 Updating poop ID ${poopId} with payload:`, updatePayload)
      
      // Call the actual update API
      const response = await fetch(`http://127.0.0.1:8000/poop/${poopId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update poop: ${response.status} ${response.statusText}`)
      }
      
      const updatedPoop = await response.json()
      console.log('✅ Poop updated successfully:', updatedPoop)
      
      // Refresh the timeline data to show the updated record
      await loadData()
      closePoopEditDialog()
      
    } catch (error) {
      console.error('❌ Failed to update poop:', error)
      // You might want to show an error message to the user here
    } finally {
      poopEditDialog.value.loading = false
    }
  }

  // Load real data when component mounts or date changes
  const loadData = async () => {
    if (!childrenStore.currentChild) {
      console.warn('No current child selected')
      return
    }

    isLoading.value = true
    try {
      const dateStr = selectedDateString.value
      console.log(`🔄 Loading timeline data for ${dateStr}`)

      // Clear previous data
      rawMealsData.value = []
      rawPoopData.value = []

      // Fetch raw data directly from API instead of using store getters
      const childId = childrenStore.currentChild.id
      
      // Fetch meals directly
      try {
        console.log(`🍽️ Fetching meals for child ${childId}`)
        const response = await fetch(`http://127.0.0.1:8000/meal/child/${childId}?days=60`)
        const allMeals = await response.json()
        
        console.log(`📊 API returned ${allMeals.length} total meals`)
        console.log(`🔍 Sample meal data:`, allMeals[0]) // Debug first meal structure
        
        // Filter meals for target date
        const mealsForDate = allMeals.filter((meal: any) => {
          const mealDate = meal.check_in.split('T')[0] // Get YYYY-MM-DD part
          const matches = mealDate === dateStr
          
          if (matches) {
            console.log(`✅ Meal ${meal.id}: ${meal.check_in} matches ${dateStr}`)
            console.log(`📝 Meal details:`, {
              id: meal.id,
              meal_category: meal.meal_category,
              meal_category_name: meal.meal_category_name,
              time_category: meal.time_category,
              consumption_level: meal.consumption_level,
              note: meal.note,
              others: meal.others
            })
          }
          
          return matches
        })
        
        console.log(`📅 Found ${mealsForDate.length} meals for ${dateStr}`)
        rawMealsData.value = mealsForDate
        
      } catch (error) {
        console.error('❌ Error fetching meals:', error)
      }

      // Fetch poop directly
      try {
        console.log(`💩 Fetching poop for child ${childId}`)
        const response = await fetch(`http://127.0.0.1:8000/poop/child/${childId}?days=60`)
        const allPoop = await response.json()
        
        console.log(`📊 API returned ${allPoop.length} total poop records`)
        
        // Filter poop for target date
        const poopForDate = allPoop.filter((poop: any) => {
          const poopDate = poop.check_in.split('T')[0] // Get YYYY-MM-DD part
          const matches = poopDate === dateStr
          
          if (matches) {
            console.log(`✅ Poop ${poop.id}: ${poop.check_in} matches ${dateStr}`)
          }
          
          return matches
        })
        
        console.log(`📅 Found ${poopForDate.length} poop records for ${dateStr}`)
        rawPoopData.value = poopForDate
        
      } catch (error) {
        console.error('❌ Error fetching poop:', error)
      }

      console.log(`✅ Timeline data loaded for ${dateStr}`)
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
      
      // Update mock data child IDs
      mockCheckins.value.forEach(checkin => {
        checkin.childId = newChildId
      })
      
      loadData()
    }
  }, { immediate: true })

  // Watch for date changes
  watch(selectedDateString, () => {
    loadData()
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