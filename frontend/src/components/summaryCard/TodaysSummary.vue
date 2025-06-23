<template>
  <div class="mb-6">
    <div class="d-flex align-center mb-4">
      <h2 class="text-body-1 font-weight-medium mr-3">
        {{ dynamicTitle }}
      </h2>

      <!-- Date picker -->
      <v-menu
        v-model="datePickerMenu"
        :close-on-content-click="false"
        location="bottom"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="outlined"
            size="small"
            class="date-picker-btn"
          >
            <v-icon
              size="16"
              class="mr-1"
            >mdi-calendar</v-icon>
            <span>{{ formattedSelectedDate }}</span>
            <v-icon
              size="16"
              class="ml-1"
            >mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-date-picker
            v-model="selectedDate"
            @update:model-value="handleDateChange"
            :max="new Date()"
          ></v-date-picker>
        </v-card>
      </v-menu>
    </div>

    <!-- Summary cards grid -->
    <v-row>
      <!-- Meal Card -->
      <MealsSummaryCard 
        :date="formattedSelectedDate" 
        @check-in="openDialog" 
      />

      <!-- Sleep Card -->
      <SleepSummaryCard @check-in="openDialog" />

      <!-- Poop Card -->
      <PoopSummaryCard @check-in="openDialog" />

      <!-- Health Card -->
      <HealthSummaryCard @check-in="openDialog"/>
    </v-row>

    <!-- Combined Check-in Dialog -->
    <CombinedCheckinDialog 
      v-model="showDialog" 
      :default-tab="dialogTab"
      :child-name="childName"
      @save="handleCheckinSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDatePicker } from '@/composables/useDatePicker'
import SleepSummaryCard from '@/components/summaryCard/SleepSummaryCard.vue'
import PoopSummaryCard from '@/components/summaryCard/PoopSummaryCard.vue'
import MealsSummaryCard from '@/components/summaryCard/MealsSummaryCard.vue'
import HealthSummaryCard from '@/components/summaryCard/HealthSummaryCard.vue'
import CombinedCheckinDialog from '@/components/checkins/CombinedCheckinDialog.vue'

const showDialog = ref(false)
const dialogTab = ref('meal')

const props = defineProps({
  summaryData: {
    type: Object,
    required: true
  },
  initialDate: {
    type: Date,
    default: () => new Date()
  },
  childName: {
    type: String,
    default: 'Jennie'
  }
})

const emit = defineEmits(['date-changed', 'checkin-saved'])

// Use date picker composable
const { selectedDate, datePickerMenu, formattedSelectedDate, handleDateChange: baseDateChange } = useDatePicker(props.initialDate)

// Dynamic title based on selected date
const dynamicTitle = computed(() => {
  const today = new Date()
  const selected = new Date(selectedDate.value)
  
  // Check if selected date is today
  const isToday = selected.toDateString() === today.toDateString()
  
  if (isToday) {
    return "Today's Summary"
  }
  
  // Format the selected date for display
  const options = { 
    weekday: 'long'
  }
  
  // Check if it's yesterday
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = selected.toDateString() === yesterday.toDateString()
  
  if (isYesterday) {
    return "Yesterday's Summary"
  }
  
  // For other dates, show the formatted date
  return `Summary for ${selected.toLocaleDateString('en-US', options)}`
})

// Handle date change and emit to parent
const handleDateChange = (date) => {
  baseDateChange(date, (newDate) => {
    emit('date-changed', newDate)
  })
}

// Handle opening dialog with specific tab
const openDialog = (type) => {
  dialogTab.value = type
  showDialog.value = true
}

// Handle saving checkin data
const handleCheckinSave = (checkinData) => {
  console.log('Checkin saved:', checkinData)
  emit('checkin-saved', checkinData)
  
  // TODO: Update the relevant store with the new checkin data
  // Example:
  // if (checkinData.type === 'meal') {
  //   mealsStore.addMeal(checkinData)
  // } else if (checkinData.type === 'sleep') {
  //   sleepStore.addSleep(checkinData)
  // } etc...
}
</script>

<style lang="scss" scoped>
</style>