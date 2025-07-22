// src/composables/useHealthAlert.ts - Fixed Version with Date Context
import { computed, onMounted, ref, watch, readonly } from 'vue'
import { useHealthStore } from '@/stores/health'
import { useMealsStore } from '@/stores/meals'
import { usePoopStore } from '@/stores/poop'
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

export function useHealthAlert(viewingDate?: string) {
  // Initialize stores
  const mealsStore = useMealsStore()
  const poopStore = usePoopStore()
  const healthStore = useHealthStore()
  const childrenStore = useChildrenStore()

  // Get data from stores safely
  const mealsCache = computed(() => {
    try {
      return mealsStore.mealsCache || {}
    } catch (error) {
      return {}
    }
  })

  const poopByDate = computed(() => {
    try {
      return poopStore.poopByDate || {}
    } catch (error) {
      return {}
    }
  })

  const healthByDate = computed(() => {
    try {
      return healthStore.healthByDate || {}
    } catch (error) {
      return {}
    }
  })

  const currentChild = computed(() => childrenStore.currentChild)

  // Simple refs for alerts
  const alerts = ref<SimpleAlert[]>([])
  const isAnalyzing = ref(false)

  // FIXED: Get current date context from viewing date or app data
const getCurrentAppDate = () => {
  // If a specific viewing date is provided, use it
  if (viewingDate) {
    console.log('📅 Using provided viewing date as context:', viewingDate)
    return viewingDate
  }
  
  // Fallback to existing logic when no viewing date provided
  const mealDates = Object.keys(mealsCache.value).filter(date => date !== new Date().toISOString().split('T')[0])
  const poopDates = Object.keys(poopByDate.value).filter(date => date !== new Date().toISOString().split('T')[0])
  const healthDates = Object.keys(healthByDate.value).filter(date => date !== new Date().toISOString().split('T')[0])
  
  const allDates = [...mealDates, ...poopDates, ...healthDates]
    .filter(date => date !== new Date().toISOString().split('T')[0])
    .sort().reverse()
  
  console.log('🗓️ Available dates for context:', allDates)
  
  const contextDate = allDates[0] || new Date().toISOString().split('T')[0]
  console.log('📅 Selected context date:', contextDate)
  return contextDate
}

  // FIXED: Get last 7 days relative to current app context
  const getLast7Days = () => {
    const contextDate = getCurrentAppDate()
    const baseDate = new Date(contextDate + 'T00:00:00')
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(baseDate)
      date.setDate(date.getDate() - (6 - i)) // Include context date by starting from 6 days ago
      return date.toISOString().split('T')[0]
    }).reverse()
  }

  // Enhanced meal analysis with better debugging
  const checkMealPatterns = async () => {
    console.log('🔥 HOT RELOAD TEST - checkMealPatterns called!')
    
    const last7Days = getLast7Days()
    console.log('📅 Analyzing dates:', last7Days)
    
    // Force load data for all dates if missing
    for (const date of last7Days) {
      if (!mealsCache.value[date]) {
        console.log(`📥 Force loading data for ${date}...`)
        try {
          await mealsStore.fetchMealsForDate(date)
        } catch (error) {
          console.warn(`⚠️ Failed to load meals for ${date}:`, error)
        }
      }
    }
    
    let poorAppetiteDays = 0
    let totalDaysWithData = 0
    const analysisDetails: any[] = []

    last7Days.forEach(date => {
      const dayData = mealsCache.value[date]
      console.log(`📊 Checking ${date}:`, dayData)
      
      if (dayData && dayData.percentages) {
        totalDaysWithData++
        const percentages = dayData.percentages
        
        // Count as poor appetite if most meals are under 80%
        const mealValues = Object.values(percentages) as number[]
        const avgConsumption = mealValues.length > 0 
          ? mealValues.reduce((a, b) => a + b, 0) / mealValues.length 
          : 0
        
        analysisDetails.push({
          date,
          percentages,
          avgConsumption,
          isPoorAppetite: avgConsumption < 80
        })
        
        console.log(`  - Meals: ${JSON.stringify(percentages)}`)
        console.log(`  - Average: ${avgConsumption.toFixed(1)}%`)
        console.log(`  - Poor appetite: ${avgConsumption < 80}`)
          
        if (avgConsumption < 80) {
          poorAppetiteDays++
        }
      } else {
        console.log(`  - No meal data for ${date}`)
      }
    })

    console.log(`📈 Analysis Summary:`)
    console.log(`  - Days with data: ${totalDaysWithData}`)
    console.log(`  - Poor appetite days: ${poorAppetiteDays}`)
    console.log(`  - Threshold met: ${poorAppetiteDays >= 2 && totalDaysWithData >= 3}`)
    console.log('  - Details:', analysisDetails)

    // LOWERED threshold for testing: 2+ days and at least 3 days of data
    if (poorAppetiteDays >= 2 && totalDaysWithData >= 3) {
      const alert = {
        id: 'meal-reduced-appetite',
        title: 'Reduced Appetite Pattern Detected',
        description: `${currentChild.value?.name || 'Your child'} has shown reduced appetite for ${poorAppetiteDays} days over the past ${totalDaysWithData} days`,
        type: 'warning' as const,
        suggestions: [
          {
            id: 1,
            title: 'Monitor for Early Signs',
            content: 'Watch for signs of illness such as runny nose, cough, or increased fussiness. Teething can also cause decreased appetite, so check for swollen gums, drooling, or desire to chew on objects.'
          },
          {
            id: 2,
            title: 'Offer Preferred Foods',
            content: 'During periods of decreased appetite, focus on offering foods your child typically enjoys and finds comforting. Small, frequent offerings may be more appealing than large portions.'
          },
          {
            id: 3,
            title: 'Check for Discomfort',
            content: 'Gently feel around your child\'s neck for any swollen lymph nodes, and observe if they seem to have difficulty or pain when swallowing.'
          }
        ]
      }
      
      console.log('🚨 MEAL ALERT GENERATED:', alert)
      return alert
    }

    console.log('✅ No meal alerts generated')
    return null
  }

  // Simple poop analysis - check for unusual patterns
  const checkPoopPatterns = () => {
    const last7Days = getLast7Days()
    let unusualDays = 0
    let totalDaysWithData = 0

    last7Days.forEach(date => {
      const dayData = poopByDate.value[date]
      if (dayData && Array.isArray(dayData)) {
        totalDaysWithData++
        
        // Check each poop entry for unusual characteristics
        dayData.forEach((poop: any) => {
          const color = poop.color_name?.toLowerCase() || ''
          const texture = poop.texture_name?.toLowerCase() || ''
          
          // Flag as unusual if color is concerning or texture is very soft/watery
          const unusualColor = ['green', 'red', 'black', 'gray'].includes(color)
          const unusualTexture = ['watery', 'very soft'].includes(texture)
          
          if (unusualColor || unusualTexture) {
            unusualDays++
          }
        })
      }
    })

    // Generate alert if 2+ days of unusual bowel movements
    if (unusualDays >= 2 && totalDaysWithData >= 3) {
      return {
        id: 'poop-unusual-pattern',
        title: 'Unusual Bowel Movement Pattern',
        description: `Unusual bowel movements have been recorded for ${unusualDays} days over the past week`,
        type: 'warning' as const,
        suggestions: [
          {
            id: 1,
            title: 'Monitor Hydration',
            content: 'Ensure your child is getting adequate fluids. Watch for signs like decreased urination, dry mouth, or unusual fussiness that might indicate fluid loss.'
          },
          {
            id: 2,
            title: 'Review Recent Diet',
            content: 'Review any new foods introduced in the past few days, as well as changes in quantity or timing of meals. Keep a simple food log to identify potential triggers.'
          },
          {
            id: 3,
            title: 'Watch for Other Symptoms',
            content: 'Be alert for other signs of illness such as fever, decreased appetite, unusual fussiness, or changes in activity level. Contact your pediatrician if symptoms persist.'
          }
        ]
      }
    }

    return null
  }

  // Simple health/symptom analysis
  const checkHealthPatterns = () => {
    const last7Days = getLast7Days()
    let symptomDays = 0
    let feverDays = 0

    last7Days.forEach(date => {
      const dayData = healthByDate.value[date]
      if (dayData && Array.isArray(dayData)) {
        dayData.forEach((health: any) => {
          if (health.symptom) {
            symptomDays++
            if (health.symptom.toLowerCase().includes('fever')) {
              feverDays++
            }
          }
        })
      }
    })

    // Generate alert for persistent symptoms
    if (feverDays >= 3) {
      return {
        id: 'health-persistent-fever',
        title: 'Persistent Low-Grade Symptoms',
        description: `Low-grade fever and related symptoms have been consistently observed over ${feverDays} days`,
        type: 'error' as const,
        suggestions: [
          {
            id: 1,
            title: 'Schedule Medical Consultation',
            content: 'Contact your pediatrician to discuss the persistent symptoms. Keep a log of temperatures, timing, and any other symptoms to share with your healthcare provider.'
          },
          {
            id: 2,
            title: 'Monitor Temperature',
            content: 'Check your child\'s temperature regularly (every 4-6 hours) and keep a record. Note the time, temperature reading, and any medications given.'
          },
          {
            id: 3,
            title: 'Comfort and Hydration',
            content: 'Ensure your child stays well-hydrated and offer comfort measures like lukewarm baths, light clothing, and extra cuddles while awaiting medical guidance.'
          }
        ]
      }
    } else if (symptomDays >= 2) {
      return {
        id: 'health-multiple-symptoms',
        title: 'Multiple Symptoms Detected',
        description: `Various symptoms have been recorded over ${symptomDays} days this week`,
        type: 'info' as const,
        suggestions: [
          {
            id: 1,
            title: 'Keep a Symptom Log',
            content: 'Track when symptoms occur, their severity, and any potential triggers to help identify patterns.'
          },
          {
            id: 2,
            title: 'Monitor Overall Wellbeing',
            content: 'Watch your child\'s general mood, activity level, and appetite alongside specific symptoms.'
          },
          {
            id: 3,
            title: 'Consider Environmental Factors',
            content: 'Think about any changes in environment, routine, or diet that might be contributing to symptoms.'
          }
        ]
      }
    }

    return null
  }
  
  // Enhanced analysis function with better logging
  const analyzePatterns = async () => {
    if (!currentChild.value?.id) {
      console.log('❌ No current child selected')
      return
    }

    console.log('🔍 Starting health pattern analysis...')
    console.log('📅 Current date context:', getCurrentAppDate())
    console.log('🧒 Current child:', currentChild.value?.name)
    
    const newAlerts: SimpleAlert[] = []

    // Check each pattern type
    console.log('🍽️ Checking meal patterns...')
    const mealAlert = await checkMealPatterns()
    
    console.log('💩 Checking poop patterns...')
    const poopAlert = checkPoopPatterns()
    
    console.log('🌡️ Checking health patterns...')
    const healthAlert = checkHealthPatterns()

    if (mealAlert) {
      console.log('✅ Meal alert added:', mealAlert.title)
      newAlerts.push(mealAlert)
    }
    if (poopAlert) {
      console.log('✅ Poop alert added:', poopAlert.title)
      newAlerts.push(poopAlert)
    }
    if (healthAlert) {
      console.log('✅ Health alert added:', healthAlert.title)
      newAlerts.push(healthAlert)
    }

    // Sort by priority (error > warning > info)
    newAlerts.sort((a, b) => {
      const priority = { error: 3, warning: 2, info: 1 }
      return priority[b.type] - priority[a.type]
    })

    alerts.value = newAlerts
    console.log(`✅ Analysis complete: ${newAlerts.length} alerts generated`)
    console.log('🎯 Final alerts:', newAlerts)
  }

  // Debounce function
  function debounce(func: Function, wait: number) {
    let timeout: ReturnType<typeof setTimeout>
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const analyzeWithDebounce = debounce(async () => {
    if (!isAnalyzing.value) {
      isAnalyzing.value = true
      try {
        await analyzePatterns()
      } finally {
        isAnalyzing.value = false
      }
    }
  }, 1000)

  // Watch for data changes
  watch([mealsCache, poopByDate, healthByDate, currentChild], () => {
    if (currentChild.value?.id) {
      console.log('🔄 Data changed, triggering analysis...')
      analyzeWithDebounce()
    }
  }, { deep: true, immediate: false })

  // Computed properties to match the expected interface
  const hasHealthAlert = computed(() => alerts.value.length > 0)

  const healthData = computed(() => {
    const topAlert = alerts.value[0]
    if (!topAlert) {
      return {
        status: 'All patterns normal',
        message: `${currentChild.value?.name || 'Your child'} is showing normal patterns across all health metrics`,
        symptoms: [],
        temperature: undefined,
        lastUpdated: new Date().toISOString(),
        allAlerts: []
      }
    }

    return {
      status: topAlert.title,
      message: topAlert.description,
      symptoms: [],
      temperature: undefined,
      lastUpdated: new Date().toISOString(),
      allAlerts: alerts.value
    }
  })

  // Initialize
  onMounted(async () => {
    if (currentChild.value?.id) {
      console.log('🚀 Initializing simplified health alert system...')
      
      // Trigger initial analysis after a delay
      setTimeout(() => {
        console.log('🎬 Running initial analysis...')
        analyzeWithDebounce()
      }, 1000)
    }
  })

  return {
  healthData,
  hasHealthAlert,
  alerts: computed(() => alerts.value),
  // Debug function
  forceAnalysis: async () => {
    console.log('🎯 Force analysis triggered')
    await analyzePatterns()
  },
  // Add method to update viewing context
  updateContext: (newViewingDate: string) => {
    console.log('🔄 Updating viewing context to:', newViewingDate)
    // Update the viewingDate parameter
    viewingDate = newViewingDate
    // Clear existing alerts
    alerts.value = []
    // Trigger new analysis
    analyzeWithDebounce()
  }
}
}