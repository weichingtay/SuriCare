// src/composables/useHealthAlert.ts - Based on Working Meal Code + Sleep
import { ref, computed } from 'vue'
import { useMealsStore } from '@/stores/meals'
import { useSleepStore } from '@/stores/sleep'
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
  const sleepStore = useSleepStore()

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

  // ADDED: Get sleep data using store (same pattern as meals)
  const getSleepDataForDate = async (dateString: string) => {
    console.log(`💤 Getting sleep data for ${dateString} via store`)
    
    // Ensure data is fetched
    await sleepStore.fetchSleepForDate(dateString)
    
    // Get processed data from store (same as summary card)
    const sleepData = sleepStore.getSleepForDate(dateString)
    
    console.log(`📊 Sleep store returned data for ${dateString}:`, sleepData)
    
    return sleepData
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

  // ADDED: Create combined alert when multiple issues detected
  const createCombinedAlert = (mealAlert: SimpleAlert, sleepAlert: SimpleAlert): SimpleAlert => {
    console.log('🔗 Creating combined alert from:', {
      meal: mealAlert.title,
      sleep: sleepAlert.title
    })

    // Determine combined severity (error takes priority over warning)
    const combinedType = (mealAlert.type === 'error' || sleepAlert.type === 'error') ? 'error' : 'warning'
    
    // Create smart combined title based on severity levels
    let combinedTitle = ''
    if (combinedType === 'error') {
      combinedTitle = 'Multiple Health Concerns Detected'
    } else {
      combinedTitle = 'Multiple Pattern Changes Detected'
    }

    // Create combined description
    const mealIssue = mealAlert.title.includes('Significant') ? 'poor appetite' : 'reduced appetite'
    const sleepIssue = sleepAlert.title.includes('Persistent') ? 'sleep disruption' : 'sleep concerns'
    
    const combinedDescription = `${currentChild.value?.name || 'Your child'} is showing both ${mealIssue} and ${sleepIssue} patterns that may be related`

    // Combine suggestions from both alerts
    const combinedSuggestions = [
      {
        id: 1,
        title: 'Monitor for Illness Signs',
        content: 'Both appetite and sleep changes can indicate illness, teething, or developmental changes. Watch for fever, congestion, or unusual fussiness.'
      },
      {
        id: 2,
        title: 'Maintain Comfort & Routine',
        content: 'Focus on comforting foods your child enjoys and maintain consistent sleep routines to help during this challenging period.'
      },
      {
        id: 3,
        title: combinedType === 'error' ? 'Consider Medical Consultation' : 'Continue Close Monitoring',
        content: combinedType === 'error' 
          ? 'Multiple persistent changes may indicate a health issue that warrants professional assessment.'
          : 'Keep tracking patterns closely as combined changes often resolve together once the underlying cause is addressed.'
      }
    ]

    const combinedAlert: SimpleAlert = {
      id: 'combined-health-concerns',
      title: combinedTitle,
      description: combinedDescription,
      type: combinedType,
      suggestions: combinedSuggestions
    }

    console.log('🔗 Combined alert created:', combinedAlert.title)
    return combinedAlert
  }

  // ADDED: Check sleep patterns (following exact same pattern as meals)
  const checkSleepPatterns = async (contextDate: string): Promise<SimpleAlert | null> => {
    console.log('💤 Checking sleep patterns for:', contextDate)
    
    if (!currentChild.value?.id) {
      console.log('❌ No current child available')
      return null
    }

    const last7Days = getLast7Days(contextDate)
    console.log('📅 Analyzing sleep dates:', last7Days)
    
    let concerningSleepDays = 0  // 6-9 hours total sleep
    let poorSleepDays = 0        // <6 hours total sleep
    let restlessDays = 0         // 3+ wake-ups
    let totalDaysWithData = 0

    // Use Promise.all to ensure all data is fetched (same as meals)
    const dailySleepDataPromises = last7Days.map(date => getSleepDataForDate(date))
    const dailySleepResults = await Promise.all(dailySleepDataPromises)

    last7Days.forEach((date, index) => {
      const sleepData = dailySleepResults[index]
      
      console.log(`💤 Checking sleep for ${date}:`)
      
      // Check if we have sleep data (same pattern as meals - check if real data exists)
      const hasSleepData = sleepData.totalHours > 0 || sleepData.sleepSessions > 0
      
      if (hasSleepData) {
        const totalHours = sleepData.totalHours || 0
        const wakeCount = sleepData.wakeCount || 0
        totalDaysWithData++
        
        console.log(`  - Sleep data: ${totalHours}h total, ${wakeCount} wake-ups`)
        
        if (totalHours < 6) {
          poorSleepDays++
          console.log(`  - 🚨 Poor sleep day detected (${totalHours}h < 6h)`)
        } else if (totalHours < 9) {
          concerningSleepDays++
          console.log(`  - ⚠️ Concerning sleep day (${totalHours}h = 6-9h)`)
        } else {
          console.log(`  - ✅ Good sleep day (${totalHours}h >= 9h)`)
        }
        
        if (wakeCount >= 3) {
          restlessDays++
          console.log(`  - 😰 Restless sleep detected (${wakeCount} wake-ups >= 3)`)
        }
      } else {
        console.log(`  - No sleep data for ${date}`)
      }
    })

    console.log(`📈 Sleep Summary: ${poorSleepDays} poor days, ${concerningSleepDays} concerning days, ${restlessDays} restless days, ${totalDaysWithData} total days with data`)

    // ADDED: Sleep alert conditions (following same pattern as meals)
    
    // Severe sleep alert: 2+ days with <6 hours OR 2+ very restless days
    if ((poorSleepDays >= 2 || restlessDays >= 2) && totalDaysWithData >= 3) {
      const isRestlessnessPrimary = restlessDays >= poorSleepDays
      
      const alert: SimpleAlert = {
        id: 'sleep-severe-disruption',
        title: isRestlessnessPrimary ? 'Persistent Sleep Disruption Detected' : 'Severe Sleep Deprivation Detected',
        description: isRestlessnessPrimary 
          ? `${currentChild.value?.name || 'Your child'} has experienced restless sleep with frequent wake-ups for ${restlessDays} days over the past ${totalDaysWithData} days`
          : `${currentChild.value?.name || 'Your child'} has had severely insufficient sleep (<6 hours) for ${poorSleepDays} days over the past ${totalDaysWithData} days`,
        type: 'error',
        suggestions: [
          {
            id: 1,
            title: 'Consider Medical Consultation',
            content: 'Persistent severe sleep issues may indicate illness or discomfort. Monitor for fever, signs of infection, or other symptoms.'
          },
          {
            id: 2,
            title: 'Review Sleep Environment',
            content: 'Ensure optimal sleep conditions - appropriate temperature, darkness, minimal noise, and comfortable bedding.'
          },
          {
            id: 3,
            title: 'Monitor for Health Issues',
            content: 'Severe sleep disruption can indicate teething, illness, or developmental changes. Watch for other concerning symptoms.'
          }
        ]
      }
      
      console.log('🚨 SEVERE SLEEP ALERT GENERATED:', alert.title)
      return alert
    }
    
    // Moderate sleep alert: 3+ concerning days (6-9h) OR 1 poor + 2 concerning
    if ((concerningSleepDays >= 3 || (poorSleepDays >= 1 && concerningSleepDays >= 2)) && totalDaysWithData >= 4) {
      const alert: SimpleAlert = {
        id: 'sleep-concerning-pattern',
        title: 'Sleep Quality Concerns Detected',
        description: `${currentChild.value?.name || 'Your child'} has shown declining sleep patterns over recent days`,
        type: 'warning',
        suggestions: [
          {
            id: 1,
            title: 'Monitor Sleep Patterns',
            content: 'Keep track of bedtime routines and any factors that might be affecting sleep quality.'
          },
          {
            id: 2,
            title: 'Check for Growth Spurts',
            content: 'Sleep disruptions can be normal during growth spurts or developmental milestones.'
          },
          {
            id: 3,
            title: 'Maintain Consistent Routine',
            content: 'Try to maintain consistent bedtime and wake-up times to help regulate sleep patterns.'
          }
        ]
      }
      
      console.log('⚠️ MODERATE SLEEP ALERT GENERATED:', alert.title)
      return alert
    }

    console.log('✅ No sleep alerts generated - sleep patterns are normal')
    return null
  }

  // ENHANCED: Check meal patterns with two-tier sensitivity (YOUR WORKING CODE)
  const checkMealPatterns = async (contextDate: string): Promise<SimpleAlert | null> => {
    console.log('🔥 Checking meal patterns for:', contextDate)
    
    if (!currentChild.value?.id) {
      console.log('❌ No current child available')
      return null
    }

    const last7Days = getLast7Days(contextDate)
    console.log('📅 Analyzing dates:', last7Days)
    
    let concerningDays = 0  // 70-84% consumption
    let poorAppetiteDays = 0  // <70% consumption
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
        
        if (averageConsumption < 70) {
          poorAppetiteDays++
          console.log(`  - 🚨 Poor appetite day detected (${averageConsumption.toFixed(1)}% < 70%)`)
        } else if (averageConsumption < 85) {
          concerningDays++
          console.log(`  - ⚠️ Concerning appetite day (${averageConsumption.toFixed(1)}% = 70-84%)`)
        } else {
          console.log(`  - ✅ Normal appetite day (${averageConsumption.toFixed(1)}% >= 85%)`)
        }
      } else {
        console.log(`  - No meal data for ${date}`)
      }
    })

    console.log(`📈 Summary: ${poorAppetiteDays} poor days, ${concerningDays} concerning days, ${totalDaysWithData} total days with data`)

    // ENHANCED: Multiple alert conditions
    
    // Severe alert: 2+ days with <70% consumption
    if (poorAppetiteDays >= 2 && totalDaysWithData >= 3) {
      const alert: SimpleAlert = {
        id: 'meal-poor-appetite',
        title: 'Significant Appetite Decline Detected',
        description: `${currentChild.value?.name || 'Your child'} has shown poor appetite (<70%) for ${poorAppetiteDays} days over the past ${totalDaysWithData} days`,
        type: 'error',
        suggestions: [
          {
            id: 1,
            title: 'Consider Medical Consultation',
            content: 'Persistent poor appetite may indicate illness. Monitor for fever, signs of infection, or other symptoms.'
          },
          {
            id: 2,
            title: 'Offer High-Calorie Foods',
            content: 'Focus on nutrient-dense, high-calorie foods that your child enjoys to maintain nutrition during low appetite periods.'
          },
          {
            id: 3,
            title: 'Monitor Hydration',
            content: 'Ensure adequate fluid intake, especially if solid food consumption is very low.'
          }
        ]
      }
      
      console.log('🚨 SEVERE MEAL ALERT GENERATED:', alert.title)
      return alert
    }
    
    // Moderate alert: 3+ concerning days (70-84%) OR 1 poor + 2 concerning
    if ((concerningDays >= 3 || (poorAppetiteDays >= 1 && concerningDays >= 2)) && totalDaysWithData >= 4) {
      const alert: SimpleAlert = {
        id: 'meal-reduced-appetite',
        title: 'Reduced Appetite Pattern Detected',
        description: `${currentChild.value?.name || 'Your child'} has shown declining appetite patterns over recent days`,
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
      
      console.log('⚠️ MODERATE MEAL ALERT GENERATED:', alert.title)
      return alert
    }

    console.log('✅ No meal alerts generated - appetite patterns are normal')
    return null
  }

  // ENHANCED: Main analysis function (updated to handle combined alerts)
  const analyzeForDate = async (dateString: string): Promise<void> => {
    if (!currentChild.value?.id) {
      console.log('❌ No current child selected')
      return
    }

    console.log(`🔍 Starting analysis for: ${dateString}`)
    
    // STABLE: Clear previous alerts
    alerts.value = []
    
    try {
      // ENHANCED: Check both meal and sleep patterns
      const mealAlert = await checkMealPatterns(dateString)
      const sleepAlert = await checkSleepPatterns(dateString)
      
      // ENHANCED: Smart alert combination logic
      const newAlerts: SimpleAlert[] = []
      
      if (mealAlert && sleepAlert) {
        // BOTH issues detected - create combined alert
        const combinedAlert = createCombinedAlert(mealAlert, sleepAlert)
        newAlerts.push(combinedAlert)
      } else if (mealAlert) {
        // ONLY meal issue - show individual meal alert
        newAlerts.push(mealAlert)
      } else if (sleepAlert) {
        // ONLY sleep issue - show individual sleep alert
        newAlerts.push(sleepAlert)
      }
      
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