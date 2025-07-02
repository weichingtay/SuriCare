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
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            class="date-picker-btn"
            size="small"
            variant="outlined"
          >
            <v-icon
              class="mr-1"
              size="16"
            >mdi-calendar</v-icon>
            <span>{{ formattedSelectedDate }}</span>
            <v-icon
              class="ml-1"
              size="16"
            >mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-date-picker
            v-model="selectedDate"
            :max="new Date()"
            @update:model-value="handleDateChange"
          />
        </v-card>
      </v-menu>
    </div>

    <!-- TODO: Make every summary card highlight a unique color? -->
    <!-- Summary cards grid -->
    <v-row>
      <!-- Meal Card -->
      <MealsSummaryCard
        :date="selectedDate"
        :meals-data="summaryData.meals"
        @check-in="$emit('open-meal-dialog')"
      />

      <!-- Sleep Card -->
      <SleepSummaryCard
        :date="selectedDate"
        :sleep-data="summaryData.sleep"
        @check-in="$emit('open-sleep-dialog')"
      />

      <!-- Poop Card -->
      <PoopSummaryCard
        :date="selectedDate"
        :poop-data="summaryData.poop"
        @check-in="$emit('open-poop-dialog')"
      />

      <!-- Health Card -->
      <HealthSummaryCard
        :date="selectedDate"
        :health-data="summaryData.health"
        @check-in="$emit('open-health-dialog')"
      />
    </v-row>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useDatePicker } from '@/composables/useDatePicker'
  import SleepSummaryCard from '@/components/summaryCard/SleepSummaryCard.vue'
  import PoopSummaryCard from '@/components/summaryCard/PoopSummaryCard.vue'
  import MealsSummaryCard from '@/components/summaryCard/MealsSummaryCard.vue'
  import HealthSummaryCard from '@/components/summaryCard/HealthSummaryCard.vue'


  const props = defineProps({
    summaryData: {
      type: Object,
      required: true,
    },
    initialDate: {
      type: Date,
      default: () => new Date(),
    },
  })

  const emit = defineEmits([
    'date-changed',
    'open-meal-dialog',
    'open-sleep-dialog',
    'open-poop-dialog',
    'open-health-dialog',
  ])


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
      weekday: 'long',

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
  const handleDateChange = date => {
    baseDateChange(date, newDate => {
      emit('date-changed', newDate)
    })
  }
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

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

</style>
