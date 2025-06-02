import { ref, computed } from 'vue'
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns'

export function useDateUtils(initialDate = new Date()) {
  const currentDate = ref(initialDate)

  const formattedDate = computed(() => {
    return format(currentDate.value, 'yyyy-MM-dd')
  })

  const displayDate = computed(() => {
    const date = currentDate.value
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    if (isThisWeek(date)) return format(date, 'EEEE') // Day name (Monday, Tuesday, etc.)
    if (isThisYear(date)) return format(date, 'MMM d') // Month and day
    return format(date, 'MMM d, yyyy') // Full date
  })

  function setDate(date) {
    currentDate.value = new Date(date)
  }

  function addDays(days) {
    const newDate = new Date(currentDate.value)
    newDate.setDate(newDate.getDate() + days)
    currentDate.value = newDate
  }

  return {
    currentDate,
    formattedDate,
    displayDate,
    setDate,
    addDays,
  }
}

// Helper function to format time in 12-hour format
export function formatTime(date) {
  return format(parseISO(date), 'h:mm a')
}

// Helper function to calculate time difference in hours
export function calculateHoursDifference(start, end) {
  const startTime = new Date(start)
  const endTime = new Date(end)
  return (endTime - startTime) / (1000 * 60 * 60) // Convert milliseconds to hours
}
