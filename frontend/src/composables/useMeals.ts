// src/composables/useMeals.ts
import { computed } from 'vue'
import type { ComputedRef } from 'vue'

interface MealPercentages {
  breakfast: number
  lunch: number
  dinner: number
}

interface MealsData {
  percentages: MealPercentages
  refusedItems: string[]
  preferences: string[]
}

interface MealBreakdownItem {
  name: string
  percentage: number
}

interface UseMealsReturn {
  mealBreakdown: ComputedRef<MealBreakdownItem[]>
  mealCount: ComputedRef<number | string>  // Changed to allow string (dash)
  statusNote: ComputedRef<string>
  statusClass: ComputedRef<string>
  getPieSlicePath: (percentage: number) => string
}

// Valid consumption levels from the check-in system
const VALID_PERCENTAGES = [0, 25, 50, 75, 100]

// Function to ensure percentage is valid
const validatePercentage = (percentage: number): number => {
  console.log('Validating percentage:', percentage, 'Type:', typeof percentage) // ADD THIS LINE
  
  if (!percentage || percentage === 0) return 0

  // Find the closest valid percentage
  const closest = VALID_PERCENTAGES.reduce((prev, curr) => {
    return Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev
  })

  console.log('Closest valid percentage found:', closest) // ADD THIS LINE
  return closest
}

export function useMeals (mealsData: ComputedRef<MealsData | undefined>): UseMealsReturn {
  const mealBreakdown = computed<MealBreakdownItem[]>(() => {
    const percentages = mealsData.value?.percentages || { breakfast: 0, lunch: 0, dinner: 0 }

    console.log('Raw percentages in useMeals:', percentages) // YOU ALREADY HAVE THIS
    
    return [
      {
        name: 'Breakfast',
        percentage: validatePercentage(percentages.breakfast),
      },
      {
        name: 'Lunch',
        percentage: validatePercentage(percentages.lunch),
      },
      {
        name: 'Dinner',
        percentage: validatePercentage(percentages.dinner),
      },
    ]
  })

  // ... rest of your code stays the same
  const mealCount = computed<number | string>(() => {
    const breakdown = mealBreakdown.value
    const count = breakdown.filter(meal => meal.percentage > 0).length

    // If no meals have data, return dash
    if (count === 0) {
      return '-'
    }

    return count
  })

  const statusNote = computed<string>(() => {
    const refusedItems = mealsData.value?.refusedItems || []

    // Check for refused items first
    if (refusedItems.length > 0) {
      return `Refused ${refusedItems.join(', ')}`
    }

    // Get validated percentages
    const breakdown = mealBreakdown.value
    const breakfast = breakdown.find(m => m.name === 'Breakfast')?.percentage || 0
    const lunch = breakdown.find(m => m.name === 'Lunch')?.percentage || 0
    const dinner = breakdown.find(m => m.name === 'Dinner')?.percentage || 0

    // Check if we have any data at all (if all are 0, it means no data was input)
    const hasAnyData = breakfast > 0 || lunch > 0 || dinner > 0
    
    if (!hasAnyData) {
      return 'No meal data for this date'
    }

    // Categorize meals by intake level
    const noDataMeals = [] // No input (should show as dash)
    const refusedMeals = [] // 0% (actually refused)
    const poorMeals = [] // 25%
    const partialMeals = [] // 50%
    const goodMeals = [] // 75%+

    // Only categorize meals that have actual data input
    // For this logic, we need to distinguish between "no data" and "0% refused"
    // Since we don't have that distinction in the current data structure,
    // we'll treat all 0% as "no input" when showing with dashes
    
    const mealsWithData = []
    const mealsWithoutData = []
    
    if (breakfast > 0) {
      mealsWithData.push('breakfast')
      if (breakfast === 25) poorMeals.push('breakfast')
      else if (breakfast === 50) partialMeals.push('breakfast')
      else if (breakfast >= 75) goodMeals.push('breakfast')
    } else {
      mealsWithoutData.push('breakfast')
    }
    
    if (lunch > 0) {
      mealsWithData.push('lunch')
      if (lunch === 25) poorMeals.push('lunch')
      else if (lunch === 50) partialMeals.push('lunch')
      else if (lunch >= 75) goodMeals.push('lunch')
    } else {
      mealsWithoutData.push('lunch')
    }
    
    if (dinner > 0) {
      mealsWithData.push('dinner')
      if (dinner === 25) poorMeals.push('dinner')
      else if (dinner === 50) partialMeals.push('dinner')
      else if (dinner >= 75) goodMeals.push('dinner')
    } else {
      mealsWithoutData.push('dinner')
    }

    // Generate status message based on what we have
    if (mealsWithoutData.length > 0 && mealsWithData.length > 0) {
      if (mealsWithoutData.length === 1) {
        return `No ${mealsWithoutData[0]} input`
      } else {
        return `No input for ${mealsWithoutData.join(' and ')}`
      }
    } else if (poorMeals.length >= 2) {
      return `Poor intake at ${poorMeals.join(' and ')}`
    } else if (poorMeals.length === 1) {
      return `Low ${poorMeals[0]} intake`
    } else if (partialMeals.length >= 2) {
      return 'Partial intake today'
    } else if (goodMeals.length >= 2) {
      return 'Good eating day overall'
    } else if (goodMeals.length === 1) {
      return `Good ${goodMeals[0]} intake`
    } else {
      return 'Mixed eating day'
    }
  })

  const statusClass = computed<string>(() => {
    const refusedItems = mealsData.value?.refusedItems || []

    // Check for refused items
    if (refusedItems.length > 0) {
      return 'status-negative'
    }

    // Get validated percentages
    const breakdown = mealBreakdown.value
    const breakfast = breakdown.find(m => m.name === 'Breakfast')?.percentage || 0
    const lunch = breakdown.find(m => m.name === 'Lunch')?.percentage || 0
    const dinner = breakdown.find(m => m.name === 'Dinner')?.percentage || 0

    // Count meals by intake level
    const refusedCount = [breakfast, lunch, dinner].filter(p => p === 0).length
    const poorCount = [breakfast, lunch, dinner].filter(p => p === 25).length
    const goodCount = [breakfast, lunch, dinner].filter(p => p >= 75).length

    if (refusedCount >= 1 || poorCount >= 2) {
      return 'status-negative' // Red: Any refused OR 2+ poor meals
    } else if (poorCount === 1 || goodCount < 2) {
      return 'status-warning' // Yellow: 1 poor meal OR less than 2 good meals
    } else {
      return 'status-positive' // Green: 2+ good meals
    }
  })

  const getPieSlicePath = (percentage: number): string => {
    // Validate percentage before generating path
    const validPercentage = validatePercentage(percentage)

    if (validPercentage <= 0) return ''
    if (validPercentage >= 100) return 'M 8,2 A 6,6 0 1,1 7.99,2 Z'

    const angle = (validPercentage / 100) * 2 * Math.PI
    const x = 8 + 6 * Math.sin(angle)
    const y = 8 - 6 * Math.cos(angle)
    const largeArcFlag = angle > Math.PI ? 1 : 0

    return `M 8,8 L 8,2 A 6,6 0 ${largeArcFlag},1 ${x},${y} Z`
  }

  return {
    mealBreakdown,
    mealCount,
    statusNote,
    statusClass,
    getPieSlicePath,
  }
}