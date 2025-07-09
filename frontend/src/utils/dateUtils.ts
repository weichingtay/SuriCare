// Date utility functions for consistent date handling across stores

/**
 * Convert various timestamp formats to YYYY-MM-DD string
 * Handles:
 * - Unix timestamps (seconds or milliseconds)
 * - ISO date strings (e.g., "2025-06-19T12:30:00+08:00")
 * - Date objects
 */
export const timestampToDateString = (timestamp: number | string | Date): string => {
  let date: Date
  
  if (timestamp instanceof Date) {
    date = timestamp
  } else if (typeof timestamp === 'string') {
    // Handle ISO string format like "2025-06-19T12:30:00+08:00"
    date = new Date(timestamp)
  } else {
    // Handle Unix timestamp (milliseconds or seconds)
    const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp
    date = new Date(ms)
  }
  
  // Validate date
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', timestamp)
    return new Date().toISOString().split('T')[0] // Fallback to today
  }
  
  // Get the date in local timezone
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Convert Date object to YYYY-MM-DD string
 */
export const dateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get current date as YYYY-MM-DD string
 */
export const getCurrentDateString = (): string => {
  return dateToString(new Date())
}