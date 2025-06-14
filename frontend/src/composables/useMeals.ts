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

export function useMeals(mealsData: ComputedRef<MealsData | undefined>): UseMealsReturn {
  const mealBreakdown = computed<MealBreakdownItem[]>(() => [
    { name: 'Breakfast', percentage: mealsData.value?.percentages?.breakfast || 10 },
    { name: 'Lunch', percentage: mealsData.value?.percentages?.lunch || 40 },
    { name: 'Dinner', percentage: mealsData.value?.percentages?.dinner || 90 }
  ])

  const mealCount = computed<number>(() => {
    const { breakfast, lunch, dinner } = mealsData.value?.percentages || {}
    let count = 0
    if (breakfast && breakfast > 0) count++
    if (lunch && lunch > 0) count++
    if (dinner && dinner > 0) count++
    return Math.max(count, 1)
  })

  const statusNote = computed<string>(() => {
    const refusedItems = mealsData.value?.refusedItems || []
    if (refusedItems.length > 0) {
      return `Jennie ate poorly today, only wanted ${refusedItems.join(', ')}`
    }
    return "Good eating day overall"
  })

  const statusClass = computed<string>(() => {
    const refusedItems = mealsData.value?.refusedItems || []
    return refusedItems.length > 0 ? 'status-negative' : 'status-positive'
  })

  const getPieSlicePath = (percentage: number): string => {
    if (percentage <= 0) return ''
    if (percentage >= 100) return 'M 8,2 A 6,6 0 1,1 7.99,2 Z'

    const angle = (percentage / 100) * 2 * Math.PI
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
    getPieSlicePath
  }
} 