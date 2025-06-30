import { computed, ref } from 'vue'

export function useDatePicker (initialDate?: Date) {
  // Selected date for viewing summaries
  const selectedDate = ref(initialDate || new Date())

  // Controls visibility of date picker menu
  const datePickerMenu = ref(false)

  // Formats the selected date for display
  const formattedSelectedDate = computed(() => {
    const date = new Date(selectedDate.value)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  })

  // Handle date selection from calendar
  const handleDateChange = (newDate: Date, callback?: (date: Date) => void) => {
    selectedDate.value = newDate
    datePickerMenu.value = false

    console.log('Date changed to:', newDate)

    // Execute callback if provided
    if (callback) {
      callback(newDate)
    }
  }

  return {
    selectedDate,
    datePickerMenu,
    formattedSelectedDate,
    handleDateChange,
  }
}
