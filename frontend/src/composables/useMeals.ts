// src/composables/useMeals.ts
import { computed } from 'vue'
import type { ComputedRef } from 'vue'

interface MealPercentages {
  [mealType: string]: number
}

interface MealStats {
  consumption: number
  count: number
  avgConsumption: number
}

interface MealStatistics {
  [mealType: string]: MealStats
}

interface MealsData {
  percentages: MealPercentages
  statistics: MealStatistics
  refusedItems: string[]
  preferences: string[]
}

interface MealBreakdownItem {
  name: string
  percentage: number
  count: number
  totalConsumption: number
  displayName: string
  hasData: boolean  // Track if meal has actual data
}

interface UseMealsReturn {
  mealBreakdown: ComputedRef<MealBreakdownItem[]>
  mealCount: ComputedRef<number | string>
  statusNote: ComputedRef<string>
  statusClass: ComputedRef<string>
  getPieSlicePath: (percentage: number) => string
}

// Valid consumption levels from the check-in system
const VALID_PERCENTAGES = [0, 25, 50, 75, 100]

// Function to ensure percentage is valid
const validatePercentage = (percentage: number): number => {
  console.log('Validating percentage:', percentage, 'Type:', typeof percentage)
  
  if (!percentage || percentage === 0) return 0

  // Find the closest valid percentage
  const closest = VALID_PERCENTAGES.reduce((prev, curr) => {
    return Math.abs(curr - percentage) < Math.abs(prev - percentage) ? curr : prev
  })

  console.log('Closest valid percentage found:', closest)
  return closest
}

export function useMeals (mealsData: ComputedRef<MealsData | undefined>): UseMealsReturn {
  const mealBreakdown = computed<MealBreakdownItem[]>(() => {
    const percentages = mealsData.value?.percentages || {}
    const statistics = mealsData.value?.statistics || {}

    console.log('Raw percentages in useMeals:', percentages)
    console.log('Raw statistics in useMeals:', statistics)
    
    // Generate dynamic meal breakdown based on available data
    const breakdown: MealBreakdownItem[] = []
    
    // Fixed order: breakfast, lunch, dinner
    const mealTypes = ['breakfast', 'lunch', 'dinner']
    
    console.log('🔍 Available percentages:', Object.keys(percentages))
    console.log('🔍 Available statistics:', Object.keys(statistics))
    
    mealTypes.forEach(mealType => {
      // Try to find the meal type in a case-insensitive way
      const percentageKey = Object.keys(percentages).find(key => key.toLowerCase() === mealType.toLowerCase())
      const statisticsKey = Object.keys(statistics).find(key => key.toLowerCase() === mealType.toLowerCase())
      
      const stats = statisticsKey ? statistics[statisticsKey] : null
      const percentage = percentageKey ? percentages[percentageKey] : 0
      
      // ⬅️ KEY CHANGE: hasData is true only if there are actual meal records
      const hasData = stats && stats.count > 0
      
      console.log(`🔍 ${mealType}: percentage=${percentage}, stats=`, stats, `hasData=${hasData}`)
      
      breakdown.push({
        name: mealType,
        percentage: hasData ? validatePercentage(percentage) : 0,
        count: stats?.count || 0,
        totalConsumption: stats?.consumption || 0,
        displayName: mealType.charAt(0).toUpperCase() + mealType.slice(1),
        hasData: hasData  // ⬅️ ADD THIS
      })
    })
    
    // If no data at all, show default meal types with no data
    if (breakdown.length === 0) {
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        breakdown.push({
          name: mealType,
          percentage: 0,
          count: 0,
          totalConsumption: 0,
          displayName: mealType.charAt(0).toUpperCase() + mealType.slice(1),
          hasData: false  // No data for default entries
        })
      })
    }
    
    return breakdown
  })

  // Get total meal instances (not just meal types)
  const mealCount = computed<number | string>(() => {
    const breakdown = mealBreakdown.value
    const totalMealInstances = breakdown.reduce((total, meal) => total + meal.count, 0)

    // If no meals have data, return dash
    if (totalMealInstances === 0) {
      return '-'
    }

    return totalMealInstances
  })

  const statusNote = computed<string>(() => {
    const refusedItems = mealsData.value?.refusedItems || []
    const breakdown = mealBreakdown.value

    // Check for refused items first
    if (refusedItems.length > 0) {
      return `Refused ${refusedItems.join(', ')}`
    }

    // Check if we have any data at all - ⬅️ UPDATED LOGIC
    const hasAnyData = breakdown.some(meal => meal.hasData)
    
    if (!hasAnyData) {
      return 'No meal data for this date'
    }

    // Get total meal instances
    const totalMealInstances = breakdown.reduce((total, meal) => total + meal.count, 0)
    
    // Show meal count and quality - only consider meals with data
    const mealsWithData = breakdown.filter(meal => meal.hasData)
    const poorMeals = mealsWithData.filter(meal => meal.percentage === 25)
    const partialMeals = mealsWithData.filter(meal => meal.percentage === 50)
    const goodMeals = mealsWithData.filter(meal => meal.percentage >= 75)
    const refusedMeals = mealsWithData.filter(meal => meal.percentage === 0)
    
    // Generate smart status message
    if (totalMealInstances > 3) {
      return `${totalMealInstances} meals today`
    } else if (refusedMeals.length >= 1) {
      return `Refused ${refusedMeals.map(m => m.name).join(' and ')}`
    } else if (poorMeals.length >= 2) {
      return `Poor intake at ${poorMeals.map(m => m.name).join(' and ')}`
    } else if (goodMeals.length >= 2) {
      return 'Good eating day overall'
    } else if (goodMeals.length === 1) {
      return `Good ${goodMeals[0].name} intake`
    } else if (partialMeals.length >= 2) {
      return 'Partial intake today'
    } else {
      return 'Mixed eating day'
    }
  })

  const statusClass = computed<string>(() => {
    const refusedItems = mealsData.value?.refusedItems || []
    const breakdown = mealBreakdown.value

    // Check for refused items
    if (refusedItems.length > 0) {
      return 'status-negative'
    }

    // Only consider meals with actual data
    const mealsWithData = breakdown.filter(meal => meal.hasData)
    const refusedCount = mealsWithData.filter(meal => meal.percentage === 0).length
    const poorCount = mealsWithData.filter(meal => meal.percentage === 25).length
    const goodCount = mealsWithData.filter(meal => meal.percentage >= 75).length
    const totalMealInstances = breakdown.reduce((total, meal) => total + meal.count, 0)

    // Smart status based on meal instances and quality
    if (refusedCount >= 1 || poorCount >= 2) {
      return 'status-negative' // Red: Any refused OR 2+ poor meals
    } else if (totalMealInstances > 3 && goodCount >= 2) {
      return 'status-positive' // Green: Multiple meals with good intake
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