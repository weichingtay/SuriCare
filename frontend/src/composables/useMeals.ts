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
  mealCount: ComputedRef<number>
  statusNote: ComputedRef<string>
  statusClass: ComputedRef<string>
  getPieSlicePath: (percentage: number) => string
}

// Valid consumption levels from the check-in system
const VALID_PERCENTAGES = [0, 25, 50, 75, 100]

// Function to ensure percentage is valid
const validatePercentage = (percentage: number): number => {
  if (!percentage || percentage === 0) return 0

  // Find the closest valid percentage
  const closest = VALID_PERCENTAGES.reduce((prev, curr) => {
    return Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev
  })

  return closest
}

export function useMeals (mealsData: ComputedRef<MealsData | undefined>): UseMealsReturn {
  const mealBreakdown = computed<MealBreakdownItem[]>(() => {
    const percentages = mealsData.value?.percentages || { breakfast: 0, lunch: 0, dinner: 0 }

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

  const mealCount = computed<number>(() => {
    const breakdown = mealBreakdown.value
    let count = 0

    breakdown.forEach(meal => {
      if (meal.percentage > 0) count++
    })

    return Math.max(count, 1) // At least 1 to match your current logic
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

    // Categorize meals by intake level
    const refusedMeals = [] // 0%
    const poorMeals = [] // 25%
    const partialMeals = [] // 50%
    const goodMeals = [] // 75%+

    if (breakfast === 0) refusedMeals.push('breakfast')
    else if (breakfast === 25) poorMeals.push('breakfast')
    else if (breakfast === 50) partialMeals.push('breakfast')
    else if (breakfast >= 75) goodMeals.push('breakfast')

    if (lunch === 0) refusedMeals.push('lunch')
    else if (lunch === 25) poorMeals.push('lunch')
    else if (lunch === 50) partialMeals.push('lunch')
    else if (lunch >= 75) goodMeals.push('lunch')

    if (dinner === 0) refusedMeals.push('dinner')
    else if (dinner === 25) poorMeals.push('dinner')
    else if (dinner === 50) partialMeals.push('dinner')
    else if (dinner >= 75) goodMeals.push('dinner')

    // Generate status message based on meal intake patterns
    if (refusedMeals.length >= 2) {
      return `Refused ${refusedMeals.join(' and ')}`
    } else if (refusedMeals.length === 1) {
      return `Refused ${refusedMeals[0]}`
    } else if (poorMeals.length >= 2) {
      return `Poor intake at ${poorMeals.join(' and ')}`
    } else if (poorMeals.length === 1) {
      return `Low ${poorMeals[0]} intake`
    } else if (partialMeals.length >= 2) {
      return 'Partial intake today'
    } else if (goodMeals.length >= 2) {
      return 'Good eating day overall'
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
