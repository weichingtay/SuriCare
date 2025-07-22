// src/composables/useHealthAlert.ts - Fixed Version
import { ref, computed } from 'vue'
import { useMealsStore } from '@/stores/meals'
import { useChildrenStore } from '@/stores/children'

interface SimpleAlert {
  id: string
  title: string
  description: string
  type: 'warning' | 'error' | 'info'
  suggestions: Array<{
    id: number
    title: string
    content: string
  }>
}

export function useHealthAlert() {
  // Stores
  const childrenStore = useChildrenStore()
  const mealsStore = useMealsStore()

  // STABLE: Single source of truth for alerts
  const alerts = ref<SimpleAlert[]>([])

  // STABLE: Safe access to current child
  const currentChild = computed(() => childrenStore.currentChild)

  // STABLE: Get 7 days relative to specific date
  const getLast7Days = (contextDate: string): string[] => {
    const baseDate = new Date(contextDate + 'T12:00:00') // Use noon to avoid timezone issues
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(baseDate)
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    }).reverse()
  }

  // FIXED: Use the same data source as the summary card
  const getMealsDataForDate = async (dateString: string) => {
    console.log(`📡 Getting meals data for ${dateString} via store`)
    
    // Ensure data is fetched
    await mealsStore.fetchMealsForDate(dateString)
    
    // Get processed data from store (same as summary card)
    const mealsData = mealsStore.getMealsForDate(dateString)
    
    console.log(`📊 Store returned data for ${dateString}:`, mealsData)
    
    return mealsData
  }

  // FIXED: Calculate average consumption using store data
  const calculateAverageConsumption = (mealsData: any): number => {
    if (!mealsData.statistics || Object.keys(mealsData.statistics).length === 0) {
      console.log('  - No meal statistics available')
      return 0
    }

    let totalConsumption = 0
    let totalMeals = 0

    Object.entries(mealsData.statistics).forEach(([mealType, stats]: [string, any]) => {
      const avgForType = stats.avgConsumption || 0
      const count = stats.count || 0
      
      console.log(`  - ${mealType}: ${avgForType}% avg (${count} meals)`)
      
      totalConsumption += avgForType * count
      totalMeals += count
    })

    const overallAverage = totalMeals > 0 ? totalConsumption / totalMeals : 0
    console.log(`  - Overall average: ${overallAverage.toFixed(1)}%`)
    
    return overallAverage
  }

  // FIXED: Check meal patterns using store data (same as summary card)
  const checkMealPatterns = async (contextDate: string): Promise<SimpleAlert | null> => {
    console.log('🔥 Checking meal patterns for:', contextDate)
    
    if (!currentChild.value?.id) {
      console.log('❌ No current child available')
      return null
    }

    const last7Days = getLast7Days(contextDate)
    console.log('📅 Analyzing dates:', last7Days)
    
    let poorAppetiteDays = 0
    let totalDaysWithData = 0

    // Use Promise.all to ensure all data is fetched
    const dailyDataPromises = last7Days.map(date => getMealsDataForDate(date))
    const dailyDataResults = await Promise.all(dailyDataPromises)

    last7Days.forEach((date, index) => {
      const mealsData = dailyDataResults[index]
      
      console.log(`📊 Checking ${date}:`)
      
      // Check if we have any meal data
      const hasMealData = Object.keys(mealsData.statistics || {}).length > 0
      
      if (hasMealData) {
        const averageConsumption = calculateAverageConsumption(mealsData)
        totalDaysWithData++
        
        console.log(`  - Day has meal data, average: ${averageConsumption.toFixed(1)}%`)
        
        if (averageConsumption < 80) {
          poorAppetiteDays++
          console.log(`  - 🚨 Poor appetite day detected (${averageConsumption.toFixed(1)}% < 80%)`)
        } else {
          console.log(`  - ✅ Normal appetite day (${averageConsumption.toFixed(1)}% >= 80%)`)
        }
      } else {
        console.log(`  - No meal data for ${date}`)
      }
    })

    console.log(`📈 Summary: ${poorAppetiteDays}/${totalDaysWithData} poor appetite days`)

    // STABLE: Generate alert if threshold met
    if (poorAppetiteDays >= 2 && totalDaysWithData >= 3) {
      const alert: SimpleAlert = {
        id: 'meal-reduced-appetite',
        title: 'Reduced Appetite Pattern Detected',
        description: `${currentChild.value?.name || 'Your child'} has shown reduced appetite for ${poorAppetiteDays} days over the past ${totalDaysWithData} days with data`,
        type: 'warning',
        suggestions: [
          {
            id: 1,
            title: 'Monitor for Early Signs',
            content: 'Watch for signs of illness such as runny nose, cough, or increased fussiness. Teething can also cause decreased appetite.'
          },
          {
            id: 2,
            title: 'Offer Preferred Foods',
            content: 'During periods of decreased appetite, focus on offering foods your child typically enjoys and finds comforting.'
          },
          {
            id: 3,
            title: 'Check for Discomfort',
            content: 'Gently feel around your child\'s neck for any swollen lymph nodes, and observe if they seem to have difficulty swallowing.'
          }
        ]
      }
      
      console.log('🚨 MEAL ALERT GENERATED:', alert.title)
      return alert
    }

    console.log('✅ No meal alerts generated - appetite patterns are normal')
    return null
  }

  // STABLE: Main analysis function
  const analyzeForDate = async (dateString: string): Promise<void> => {
    if (!currentChild.value?.id) {
      console.log('❌ No current child selected')
      return
    }

    console.log(`🔍 Starting analysis for: ${dateString}`)
    
    // STABLE: Clear previous alerts
    alerts.value = []
    
    try {
      // FIXED: Check patterns using store data
      const mealAlert = await checkMealPatterns(dateString)
      
      // STABLE: Add any alerts found
      const newAlerts: SimpleAlert[] = []
      if (mealAlert) newAlerts.push(mealAlert)
      
      // STABLE: Sort by priority
      newAlerts.sort((a, b) => {
        const priority = { error: 3, warning: 2, info: 1 }
        return priority[b.type] - priority[a.type]
      })
      
      alerts.value = newAlerts
      console.log(`✅ Analysis complete: ${newAlerts.length} alerts`)
      
    } catch (error) {
      console.error('❌ Analysis error:', error)
      alerts.value = []
    }
  }

  return {
    alerts: computed(() => alerts.value),
    analyzeForDate
  }
}