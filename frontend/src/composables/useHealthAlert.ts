// src/composables/useHealthAlert.ts - Enhanced with Meals, Sleep, Poop, and Health Analysis
import { ref, computed } from 'vue'
import { useMealsStore } from '@/stores/meals'
import { useSleepStore } from '@/stores/sleep'
import { usePoopStore } from '@/stores/poop'
import { useHealthStore } from '@/stores/health'
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
  const poopStore = usePoopStore()
  const healthStore = useHealthStore()

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

  // NEW API FUNCTIONS
  const saveAlertToAPI = async (alert: SimpleAlert, analysisDate: string): Promise<void> => {
    if (!currentChild.value?.id) return

    const last7Days = getLast7Days(analysisDate)
    
    const alertData = {
      child_id: currentChild.value.id,
      alert_type: alert.id,
      title: alert.title,
      description: alert.description,
      severity: alert.type,
      suggestions: alert.suggestions,
      analysis_date: analysisDate,
      data_period_start: last7Days[last7Days.length - 1],
      data_period_end: last7Days[0]
    }

    try {
      await fetch('http://localhost:8000/health-alerts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      })
      console.log('✅ Alert saved:', alert.title)
    } catch (error) {
      console.error('Error saving alert:', error)
    }
  }

  const loadAlertsForTab = async (): Promise<SimpleAlert[]> => {
    if (!currentChild.value?.id) return []

    try {
      const response = await fetch(`http://localhost:8000/health-alerts/timeline/${currentChild.value.id}`)
      if (!response.ok) return []
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error loading alerts for tab:', error)
      return []
    }
  }

  const getBadgeCount = async (): Promise<number> => {
    if (!currentChild.value?.id) return 0

    try {
      const response = await fetch(`http://localhost:8000/health-alerts/unread-count/${currentChild.value.id}`)
      if (!response.ok) return 0
      
      const data = await response.json()
      return data.unread_count || 0
    } catch (error) {
      console.error('Error getting badge count:', error)
      return 0
    }
  }

  const markAlertRead = async (alertId: string): Promise<void> => {
    try {
      await fetch(`http://localhost:8000/health-alerts/${alertId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      })
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

// Fixed deleteAlert function for health alerts soft delete API
const deleteAlert = async (alertId: string): Promise<void> => {
  console.log('🗑️ Attempting to delete alert:', alertId);
  
  // Validate the alert ID
  if (!alertId || alertId === 'undefined' || alertId === 'null') {
    console.error('❌ Invalid alert ID:', alertId);
    throw new Error('Invalid alert ID provided');
  }

  try {
    const response = await fetch(`http://localhost:8000/health-alerts/${alertId}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Get error details from FastAPI response
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage += `: ${errorData.detail || 'Unknown error'}`;
      } catch {
        errorMessage += `: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse the success response (matches your backend)
    const result = await response.json();
    console.log('✅ Alert deleted successfully:', result.message, result.alert_id);
    
  } catch (error) {
    console.error('❌ Error deleting alert:', error);
    throw error;
  }
}

  // WORKING: Use the same data source as the summary card (FROM YOUR REFERENCE)
  const getMealsDataForDate = async (dateString: string) => {
    console.log(`📡 Getting meals data for ${dateString} via store`)
    
    // Ensure data is fetched
    await mealsStore.fetchMealsForDate(dateString)
    
    // Get processed data from store (same as summary card)
    const mealsData = mealsStore.getMealsForDate(dateString)
    
    console.log(`📊 Store returned data for ${dateString}:`, mealsData)
    
    return mealsData
  }

  // ADDED: Get sleep data (same pattern as working meals)
  const getSleepDataForDate = async (dateString: string) => {
    console.log(`💤 Getting sleep data for ${dateString} via store`)
    
    await sleepStore.fetchSleepForDate(dateString)
    const sleepData = sleepStore.getSleepForDate(dateString)
    
    console.log(`📊 Sleep store returned data for ${dateString}:`, sleepData)
    return sleepData
  }

  // ADDED: Get poop data (same pattern as working meals)
  const getPoopDataForDate = async (dateString: string) => {
    console.log(`💩 Getting poop data for ${dateString} via store`)
    
    await poopStore.fetchPoopForDate(dateString)
    const poopData = poopStore.getPoopForDate(dateString)
    
    console.log(`📊 Poop store returned data for ${dateString}:`, poopData)
    return poopData
  }

  // ADDED: Get health data (same pattern as working meals)
  const getHealthDataForDate = async (dateString: string) => {
    console.log(`🏥 Getting health data for ${dateString} via store`)
    
    await healthStore.fetchHealthForDate(dateString)
    const healthData = healthStore.getHealthForDate(dateString)
    
    console.log(`📊 Health store returned data for ${dateString}:`, healthData)
    return healthData
  }

  // WORKING: Calculate average consumption using store data (FROM YOUR REFERENCE)
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

  // WORKING: Check meal patterns with two-tier sensitivity (FROM YOUR REFERENCE - UNCHANGED)
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

  // ADDED: Check sleep patterns (following exact same structure as working meals)
  const checkSleepPatterns = async (contextDate: string): Promise<SimpleAlert | null> => {
    console.log('💤 Checking sleep patterns for:', contextDate)
    
    if (!currentChild.value?.id) {
      console.log('❌ No current child available')
      return null
    }

    const last7Days = getLast7Days(contextDate)
    console.log('📅 Analyzing sleep dates:', last7Days)
    
    let concerningSleepDays = 0  // 6-8 hours total sleep
    let poorSleepDays = 0        // <6 hours total sleep
    let totalDaysWithData = 0

    const dailyDataPromises = last7Days.map(date => getSleepDataForDate(date))
    const dailyDataResults = await Promise.all(dailyDataPromises)

    last7Days.forEach((date, index) => {
      const sleepData = dailyDataResults[index]
      
      console.log(`💤 Checking ${date}:`)
      
      // Check if we have sleep data (same logic as meals)
      const hasSleepData = sleepData.totalHours > 0 || sleepData.sleepSessions > 0
      
      if (hasSleepData) {
        const totalHours = sleepData.totalHours || 0
        totalDaysWithData++
        
        console.log(`  - Day has sleep data, total: ${totalHours}h`)
        
        if (totalHours < 6) {
          poorSleepDays++
          console.log(`  - 🚨 Poor sleep day detected (${totalHours}h < 6h)`)
        } else if (totalHours < 9) {
          concerningSleepDays++
          console.log(`  - ⚠️ Concerning sleep day (${totalHours}h = 6-9h)`)
        } else {
          console.log(`  - ✅ Good sleep day (${totalHours}h >= 9h)`)
        }
      } else {
        console.log(`  - No sleep data for ${date}`)
      }
    })

    console.log(`📈 Sleep Summary: ${poorSleepDays} poor days, ${concerningSleepDays} concerning days, ${totalDaysWithData} total days with data`)

    // Severe alert: 2+ days with <6 hours
    if (poorSleepDays >= 2 && totalDaysWithData >= 3) {
      const alert: SimpleAlert = {
        id: 'sleep-severe-deprivation',
        title: 'Severe Sleep Deprivation Detected',
        description: `${currentChild.value?.name || 'Your child'} has had severely insufficient sleep (<6 hours) for ${poorSleepDays} days over the past ${totalDaysWithData} days`,
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
    
    // Moderate alert: 3+ concerning days OR 1 poor + 2 concerning
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

  // ADDED: Check poop patterns (following exact same structure as working meals)
  const checkPoopPatterns = async (contextDate: string): Promise<SimpleAlert | null> => {
    console.log('💩 Checking poop patterns for:', contextDate)
    
    if (!currentChild.value?.id) {
      console.log('❌ No current child available')
      return null
    }

    const last7Days = getLast7Days(contextDate)
    console.log('📅 Analyzing poop dates:', last7Days)
    
    let concerningDays = 0    // any unusual characteristics
    let constipationDays = 0  // 0 bowel movements
    let totalDaysWithData = 0

    const dailyDataPromises = last7Days.map(date => getPoopDataForDate(date))
    const dailyDataResults = await Promise.all(dailyDataPromises)

    last7Days.forEach((date, index) => {
      const poopData = dailyDataResults[index]
      
      console.log(`💩 Checking ${date}:`)
      
      // Check if we have poop data (same logic as meals)
      const hasPoopData = poopData.lastUpdated && poopData.lastUpdated !== ''
      
      if (hasPoopData) {
        const count = poopData.count || 0
        const unusual = poopData.unusual || 0
        totalDaysWithData++
        
        console.log(`  - Day has poop data, count: ${count}, unusual: ${unusual}`)
        
        if (count === 0) {
          constipationDays++
          console.log(`  - 🚨 Constipation day detected (0 movements)`)
        } else if (unusual > 0) {
          concerningDays++
          console.log(`  - ⚠️ Concerning poop day (${unusual}/${count} unusual movements)`)
        } else {
          console.log(`  - ✅ Normal poop day (${count} normal movements)`)
        }
      } else {
        console.log(`  - No poop data for ${date}`)
      }
    })

    console.log(`📈 Poop Summary: ${constipationDays} constipation days, ${concerningDays} concerning days, ${totalDaysWithData} total days with data`)

    // Severe alert: 2+ days with constipation OR severe unusual patterns
    if (constipationDays >= 2 && totalDaysWithData >= 3) {
      const alert: SimpleAlert = {
        id: 'poop-severe-constipation',
        title: 'Severe Constipation Pattern Detected',
        description: `${currentChild.value?.name || 'Your child'} has had no bowel movements for ${constipationDays} days over the past ${totalDaysWithData} days`,
        type: 'error',
        suggestions: [
          {
            id: 1,
            title: 'Consider Medical Consultation',
            content: 'Prolonged constipation can be serious in children. Consult your pediatrician for proper evaluation and treatment.'
          },
          {
            id: 2,
            title: 'Focus on Hydration & Fiber',
            content: 'Increase fluid intake and offer fiber-rich foods appropriate for your child\'s age. Gentle movement can also help.'
          },
          {
            id: 3,
            title: 'Track Additional Symptoms',
            content: 'Monitor for signs of discomfort, fever, vomiting, or changes in appetite that may accompany digestive issues.'
          }
        ]
      }
      
      console.log('🚨 SEVERE POOP ALERT GENERATED:', alert.title)
      return alert
    }
    
    // Moderate alert: 3+ concerning days OR 1 constipation + 2 concerning
    if ((concerningDays >= 3 || (constipationDays >= 1 && concerningDays >= 2)) && totalDaysWithData >= 4) {
      const alert: SimpleAlert = {
        id: 'poop-concerning-pattern',
        title: 'Digestive Pattern Changes Detected',
        description: `${currentChild.value?.name || 'Your child'} has shown changes in bowel movement patterns over recent days`,
        type: 'warning',
        suggestions: [
          {
            id: 1,
            title: 'Monitor Bowel Patterns',
            content: 'Keep track of frequency, color, and consistency of bowel movements to identify any worsening trends.'
          },
          {
            id: 2,
            title: 'Review Recent Changes',
            content: 'Consider if dietary changes, new foods, medications, or stress might be affecting digestive patterns.'
          },
          {
            id: 3,
            title: 'Maintain Healthy Habits',
            content: 'Ensure adequate fluid intake and age-appropriate fiber sources to support healthy digestion.'
          }
        ]
      }
      
      console.log('⚠️ MODERATE POOP ALERT GENERATED:', alert.title)
      return alert
    }

    console.log('✅ No poop alerts generated - digestive patterns are normal')
    return null
  }

  // ADDED: Check health patterns (following exact same structure as working meals)
  const checkHealthPatterns = async (contextDate: string): Promise<SimpleAlert | null> => {
    console.log('🏥 Checking health patterns for:', contextDate)
    
    if (!currentChild.value?.id) {
      console.log('❌ No current child available')
      return null
    }

    const last7Days = getLast7Days(contextDate)
    console.log('📅 Analyzing health dates:', last7Days)
    
    let feverDays = 0        // High or Low fever days
    let symptomDays = 0      // Days with any symptoms
    let totalDaysWithData = 0

    const dailyDataPromises = last7Days.map(date => getHealthDataForDate(date))
    const dailyDataResults = await Promise.all(dailyDataPromises)

    last7Days.forEach((date, index) => {
      const healthData = dailyDataResults[index]
      
      console.log(`🏥 Checking ${date}:`)
      
      // Check if we have health data (same logic as meals)
      const hasHealthData = healthData.lastUpdated && healthData.lastUpdated !== ''
      
      if (hasHealthData) {
        const status = healthData.status || 'Healthy'
        const symptomsCount = healthData.symptoms?.length || 0
        totalDaysWithData++
        
        console.log(`  - Day has health data, status: ${status}, symptoms: ${symptomsCount}`)
        
        if (status.includes('High Fever')) {
          feverDays++
          symptomDays++
          console.log(`  - 🚨 High fever day detected (${status})`)
        } else if (status.includes('Low Fever')) {
          feverDays++
          symptomDays++
          console.log(`  - ⚠️ Low fever day detected (${status})`)
        } else if (symptomsCount > 0 && status !== 'Healthy') {
          symptomDays++
          console.log(`  - ⚠️ Symptom day detected (${symptomsCount} symptoms, ${status})`)
        } else {
          console.log(`  - ✅ Healthy day (${status})`)
        }
      } else {
        console.log(`  - No health data for ${date}`)
      }
    })

    console.log(`📈 Health Summary: ${feverDays} fever days, ${symptomDays} symptom days, ${totalDaysWithData} total days with data`)

    // Severe health alert: 2+ days with fever
    if (feverDays >= 2 && totalDaysWithData >= 3) {
      const alert: SimpleAlert = {
        id: 'health-severe-fever',
        title: 'Persistent Fever Pattern Detected',
        description: `${currentChild.value?.name || 'Your child'} has had fever for ${feverDays} days over the past ${totalDaysWithData} days`,
        type: 'error',
        suggestions: [
          {
            id: 1,
            title: 'Seek Medical Attention',
            content: 'Persistent fever in children can indicate serious infection and requires immediate medical evaluation.'
          },
          {
            id: 2,
            title: 'Monitor Temperature Closely',
            content: 'Check temperature regularly and keep detailed records. Watch for signs of dehydration or worsening symptoms.'
          },
          {
            id: 3,
            title: 'Maintain Hydration & Rest',
            content: 'Ensure adequate fluid intake and rest. Contact emergency services if temperature exceeds 40°C (104°F) or child shows signs of distress.'
          }
        ]
      }
      
      console.log('🚨 SEVERE HEALTH ALERT GENERATED:', alert.title)
      return alert
    }
    
    // Moderate health alert: 3+ symptom days OR 1 fever + 2 symptom days
    if ((symptomDays >= 3 || (feverDays >= 1 && symptomDays >= 2)) && totalDaysWithData >= 4) {
      const alert: SimpleAlert = {
        id: 'health-concerning-symptoms',
        title: 'Health Symptoms Pattern Detected',
        description: `${currentChild.value?.name || 'Your child'} has shown health symptoms over recent days`,
        type: 'warning',
        suggestions: [
          {
            id: 1,
            title: 'Monitor Symptom Progression',
            content: 'Keep track of symptoms and their severity. Watch for worsening patterns or new concerning signs.'
          },
          {
            id: 2,
            title: 'Consider Medical Consultation',
            content: 'If symptoms persist or worsen, consult your pediatrician for proper evaluation and treatment guidance.'
          },
          {
            id: 3,
            title: 'Supportive Care',
            content: 'Provide comfort measures, ensure adequate rest and hydration, and maintain a calm environment for recovery.'
          }
        ]
      }
      
      console.log('⚠️ MODERATE HEALTH ALERT GENERATED:', alert.title)
      return alert
    }

    console.log('✅ No health alerts generated - health patterns are normal')
    return null
  }

  // ENHANCED: Smart alert combination logic
  const createCombinedAlert = (individualAlerts: SimpleAlert[]): SimpleAlert => {
    console.log('🔗 Creating combined alert from:', individualAlerts.map(a => a.title))

    const hasError = individualAlerts.some(alert => alert.type === 'error')
    const combinedType = hasError ? 'error' : 'warning'
    
    const combinedTitle = combinedType === 'error' 
      ? 'Multiple Health Concerns Detected' 
      : 'Multiple Pattern Changes Detected'

    const issueDescriptions = individualAlerts.map(alert => {
      if (alert.id.includes('meal')) {
        return alert.title.includes('Significant') ? 'poor appetite' : 'reduced appetite'
      } else if (alert.id.includes('sleep')) {
        return alert.title.includes('Severe') ? 'sleep deprivation' : 'sleep concerns'
      } else if (alert.id.includes('poop')) {
        return alert.title.includes('Severe') ? 'bowel problems' : 'digestive concerns'
      } else if (alert.id.includes('health')) {
        return alert.title.includes('Persistent') ? 'fever symptoms' : 'health symptoms'
      }
      return 'health concerns'
    })
    
    const combinedDescription = `${currentChild.value?.name || 'Your child'} is showing ${issueDescriptions.join(', ')} patterns that may be related`

    const combinedSuggestions = [
      {
        id: 1,
        title: 'Monitor for Illness Signs',
        content: 'Multiple health pattern changes often indicate illness, infection, or systemic health issues. Watch for fever, signs of discomfort, or worsening symptoms.'
      },
      {
        id: 2,
        title: 'Maintain Basic Care & Comfort',
        content: 'Focus on hydration, comfort foods, consistent routines, and extra comfort during this challenging period.'
      },
      {
        id: 3,
        title: combinedType === 'error' ? 'Consider Medical Consultation' : 'Continue Close Monitoring',
        content: combinedType === 'error' 
          ? 'Multiple persistent issues may indicate a health problem that warrants professional medical assessment.'
          : 'Keep tracking all patterns closely as related changes often resolve together once the underlying cause is addressed.'
      }
    ]

    return {
      id: 'combined-health-concerns',
      title: combinedTitle,
      description: combinedDescription,
      type: combinedType,
      suggestions: combinedSuggestions
    }
  }

  // WORKING: Main analysis function (FROM YOUR REFERENCE - ENHANCED)
  const analyzeForDate = async (dateString: string): Promise<void> => {
    if (!currentChild.value?.id) {
      console.log('❌ No current child selected')
      return
    }

    console.log(`🔍 Starting analysis for: ${dateString}`)
    
    // STABLE: Clear previous alerts
    alerts.value = []
    
    try {
      // ENHANCED: Check all four patterns
      const mealAlert = await checkMealPatterns(dateString)
      const sleepAlert = await checkSleepPatterns(dateString)
      const poopAlert = await checkPoopPatterns(dateString)
      const healthAlert = await checkHealthPatterns(dateString)
      
      // ENHANCED: Smart alert combination logic for all check-ins
      const individualAlerts: SimpleAlert[] = []
      if (mealAlert) individualAlerts.push(mealAlert)
      if (sleepAlert) individualAlerts.push(sleepAlert)
      if (poopAlert) individualAlerts.push(poopAlert)
      if (healthAlert) individualAlerts.push(healthAlert)
     
     const newAlerts: SimpleAlert[] = []
     
     if (individualAlerts.length >= 2) {
       // Multiple issues - create combined alert
       const combinedAlert = createCombinedAlert(individualAlerts)
       newAlerts.push(combinedAlert)
     } else if (individualAlerts.length === 1) {
       // Single issue - show individual alert
       newAlerts.push(individualAlerts[0])
     }
     
     // SAVE ALERTS TO DATABASE
     for (const alert of newAlerts) {
       await saveAlertToAPI(alert, dateString)
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

 // 🚨 FIXED: Added deleteAlert to the return statement
 return {
   alerts: computed(() => alerts.value),
   analyzeForDate,
   saveAlertToAPI,
   loadAlertsForTab,
   getBadgeCount,
   markAlertRead,
   deleteAlert  // ⭐ THIS WAS MISSING!
 }
}