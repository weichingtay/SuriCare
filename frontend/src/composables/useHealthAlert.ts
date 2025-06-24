// import { computed, onMounted } from 'vue'
// import { useHealthStore } from '@/stores/health'
// import { storeToRefs } from 'pinia'

// export function useHealthAlert() {
//   const healthStore = useHealthStore()
//   const { getHealthForDate } = storeToRefs(healthStore)

//   // Get current date
//   const currentDate = computed(() => new Date().toISOString().split('T')[0])

//   // Get health data
//   const healthData = computed(() => getHealthForDate.value(currentDate.value))

//   // Check if we should show the alert
//   const hasHealthAlert = computed(() => healthData.value?.status !== 'Healthy')

//   // Fetch health data on mount
//   onMounted(async () => {
//     await healthStore.fetchHealthForDate(currentDate.value)
//   })

//   return {
//     healthData,
//     hasHealthAlert
//   }
// } 

// src/composables/useHealthAlert.ts
// src/composables/useHealthAlert.ts
import { computed, onMounted, ref } from 'vue'
import { useHealthStore } from '@/stores/health'
import { storeToRefs } from 'pinia'

// Types for our data structures
interface MealEntry {
  date: string
  mealTime: 'breakfast' | 'lunch' | 'dinner'
  consumptionLevel: string // '0', '25', '50', '75', '100'
  mealCategory: 'milk' | 'solid' | 'mixed' | 'others'
  subCategory?: string
  customMeal?: string
  notes?: string
}

interface SleepEntry {
  date: string
  bedTime: string
  awakeTime: string
  duration: number // in minutes
  notes?: string
}

interface PoopEntry {
  date: string
  color: 'yellow' | 'red' | 'brown' | 'green' | 'black' | 'gray'
  texture: 'pellets' | 'lumpy' | 'cracked' | 'smooth' | 'soft' | 'mushy' | 'watery'
  notes?: string
}

interface GrowthEntry {
  date: string
  weight: number
  height: number
  headCircumference: number
  notes?: string
}

interface SymptomEntry {
  date: string
  symptoms: string[]
  otherSymptom?: string
  photo?: File
  notes?: string
}

interface PredictiveAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  status: string
  message: string
  symptoms?: string[]
  temperature?: string
  category: 'meal' | 'sleep' | 'poop' | 'growth' | 'health'
  pattern: string
  daysObserved: number
  significance: 'low' | 'medium' | 'high'
  recommendations?: string[]
}

// Dummy data for pattern detection
const generateDummyData = () => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  // Generate meal data showing gradual decrease in intake
  const mealData: MealEntry[] = last7Days.flatMap(date => [
    {
      date,
      mealTime: 'breakfast',
      consumptionLevel: date === last7Days[0] ? '100' : 
                       date === last7Days[1] ? '100' :
                       date === last7Days[2] ? '75' :
                       date === last7Days[3] ? '75' :
                       date === last7Days[4] ? '50' :
                       date === last7Days[5] ? '25' : '25',
      mealCategory: 'mixed',
      notes: date === last7Days[6] ? 'Seemed less interested in banana today' : ''
    },
    {
      date,
      mealTime: 'lunch',
      consumptionLevel: date === last7Days[0] ? '100' : 
                       date === last7Days[1] ? '75' :
                       date === last7Days[2] ? '75' :
                       date === last7Days[3] ? '50' :
                       date === last7Days[4] ? '50' :
                       date === last7Days[5] ? '25' : '0',
      mealCategory: 'solid'
    }
  ])

  // Generate sleep data showing increased night wakings
  const sleepData: SleepEntry[] = last7Days.map(date => ({
    date,
    bedTime: '20:30',
    awakeTime: date === last7Days[0] ? '07:00' : 
              date === last7Days[1] ? '06:45' :
              date === last7Days[2] ? '06:30' :
              date === last7Days[3] ? '06:15' :
              date === last7Days[4] ? '06:00' :
              date === last7Days[5] ? '05:45' : '05:30',
    duration: date === last7Days[0] ? 630 : 
             date === last7Days[1] ? 615 :
             date === last7Days[2] ? 600 :
             date === last7Days[3] ? 585 :
             date === last7Days[4] ? 570 :
             date === last7Days[5] ? 555 : 540,
    notes: date >= last7Days[4] ? 'Woke up several times during night' : ''
  }))

  // Generate poop data showing consistency changes
  const poopData: PoopEntry[] = last7Days.slice(0, 4).map((date, i) => ({
    date,
    color: i === 0 ? 'brown' : i === 1 ? 'brown' : i === 2 ? 'green' : 'green',
    texture: i === 0 ? 'smooth' : i === 1 ? 'soft' : i === 2 ? 'mushy' : 'watery',
    notes: i >= 2 ? 'Consistency softer than usual' : ''
  }))

  // Generate growth data showing plateau
  const growthData: GrowthEntry[] = last7Days.slice(0, 3).map((date, i) => ({
    date,
    weight: i === 0 ? 8.2 : i === 1 ? 8.2 : 8.1, // Weight plateau
    height: i === 0 ? 72 : i === 1 ? 72 : 72, // Height plateau
    headCircumference: 46.5
  }))

  // Generate symptom data showing persistent low-grade issues
  const symptomData: SymptomEntry[] = last7Days.slice(0, 3).map(date => ({
    date,
    symptoms: ['fever'],
    notes: 'Low-grade fever, seems slightly more tired than usual'
  }))

  return { mealData, sleepData, poopData, growthData, symptomData }
}

// Pattern detection functions
const analyzeMealPatterns = (mealData: MealEntry[]): PredictiveAlert[] => {
  const alerts: PredictiveAlert[] = []
  
  // Detect gradual decrease in intake
  const breakfastIntakes = mealData
    .filter(meal => meal.mealTime === 'breakfast')
    .map(meal => parseInt(meal.consumptionLevel))
    .slice(-5) // Last 5 days
  
  if (breakfastIntakes.length >= 3) {
    const isDecreasing = breakfastIntakes.every((intake, i) => 
      i === 0 || intake <= breakfastIntakes[i - 1]
    )
    
    const averageDecrease = breakfastIntakes[0] - breakfastIntakes[breakfastIntakes.length - 1]
    
    if (isDecreasing && averageDecrease >= 25) {
      alerts.push({
        id: 'meal-decrease-001',
        type: 'warning',
        status: 'Gradual Meal Intake Decrease Detected',
        message: `Breakfast consumption has decreased by ${averageDecrease}% over ${breakfastIntakes.length} days`,
        category: 'meal',
        pattern: 'gradual_intake_decrease',
        daysObserved: breakfastIntakes.length,
        significance: averageDecrease >= 50 ? 'high' : 'medium',
        recommendations: [
          'Monitor for signs of illness or teething',
          'Try offering preferred foods',
          'Check for any throat discomfort',
          'Consider consulting pediatrician if pattern continues'
        ]
      })
    }
  }

  // Detect food aversion patterns
  const recentMeals = mealData.slice(-7)
  const refusalPattern = recentMeals.filter(meal => 
    meal.consumptionLevel === '0' && meal.notes?.toLowerCase().includes('refused')
  )
  
  if (refusalPattern.length >= 2) {
    alerts.push({
      id: 'meal-aversion-001',
      type: 'warning',
      status: 'Sudden Food Aversion Pattern',
      message: `Child has been refusing previously liked foods over ${refusalPattern.length} recent meals`,
      category: 'meal',
      pattern: 'food_aversion',
      daysObserved: refusalPattern.length,
      significance: 'medium',
      recommendations: [
        'Note which specific foods are being refused',
        'Consider food sensitivity or allergy',
        'Try alternative preparations of the same food',
        'Monitor for other symptoms'
      ]
    })
  }

  return alerts
}

const analyzeSleepPatterns = (sleepData: SleepEntry[]): PredictiveAlert[] => {
  const alerts: PredictiveAlert[] = []
  
  // Detect sleep duration changes
  const recentSleep = sleepData.slice(-5)
  if (recentSleep.length >= 3) {
    const durations = recentSleep.map(sleep => sleep.duration)
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const normalDuration = 600 // 10 hours normal for toddler
    
    if (averageDuration < normalDuration - 60) { // More than 1 hour less
      alerts.push({
        id: 'sleep-duration-001',
        type: 'warning',
        status: 'Sleep Duration Changes Detected',
        message: `Sleep has decreased by ${Math.round((normalDuration - averageDuration) / 60 * 10) / 10} hours on average over the past ${recentSleep.length} nights`,
        category: 'sleep',
        pattern: 'duration_decrease',
        daysObserved: recentSleep.length,
        significance: averageDuration < normalDuration - 90 ? 'high' : 'medium',
        recommendations: [
          'Check sleep environment for disturbances',
          'Monitor for signs of discomfort or pain',
          'Review bedtime routine consistency',
          'Consider growth spurt or developmental changes'
        ]
      })
    }
  }

  // Detect night waking patterns
  const nightWakingNotes = sleepData.slice(-4).filter(sleep => 
    sleep.notes?.toLowerCase().includes('woke') || 
    sleep.notes?.toLowerCase().includes('wake')
  )
  
  if (nightWakingNotes.length >= 3) {
    alerts.push({
      id: 'sleep-waking-001',
      type: 'warning',
      status: 'Increased Night Wakings Detected',
      message: `More frequent night wakings have been observed over the past ${nightWakingNotes.length} nights`,
      category: 'sleep',
      pattern: 'night_wakings',
      daysObserved: nightWakingNotes.length,
      significance: 'medium',
      recommendations: [
        'Check for teething symptoms',
        'Evaluate room temperature and comfort',
        'Monitor for signs of sleep apnea',
        'Consider recent routine changes'
      ]
    })
  }

  return alerts
}

const analyzePoopPatterns = (poopData: PoopEntry[]): PredictiveAlert[] => {
  const alerts: PredictiveAlert[] = []
  
  // Detect consistency changes
  const recentPoops = poopData.slice(-3)
  if (recentPoops.length >= 2) {
    const textures = recentPoops.map(poop => poop.texture)
    const progressiveSoftening = ['smooth', 'soft', 'mushy', 'watery']
    
    let isSoftening = true
    for (let i = 1; i < textures.length; i++) {
      const currentIndex = progressiveSoftening.indexOf(textures[i])
      const previousIndex = progressiveSoftening.indexOf(textures[i - 1])
      if (currentIndex <= previousIndex) {
        isSoftening = false
        break
      }
    }
    
    if (isSoftening && textures[textures.length - 1] === 'watery') {
      alerts.push({
        id: 'poop-consistency-001',
        type: 'warning',
        status: 'Stool Consistency Changes Detected',
        message: `Stool has been progressively becoming softer over the past ${recentPoops.length} bowel movements`,
        category: 'poop',
        pattern: 'consistency_softening',
        daysObserved: recentPoops.length,
        significance: 'medium',
        recommendations: [
          'Monitor hydration levels',
          'Review recent dietary changes',
          'Watch for signs of illness or infection',
          'Consider consulting pediatrician if continues'
        ]
      })
    }
  }

  // Detect unusual color patterns
  const unusualColors = poopData.slice(-3).filter(poop => 
    ['green', 'red', 'black', 'gray'].includes(poop.color)
  )
  
  if (unusualColors.length >= 2) {
    alerts.push({
      id: 'poop-color-001',
      type: 'error',
      status: 'Unusual Stool Colors Detected',
      message: `Persistent unusual stool colors have been observed over the past ${unusualColors.length} bowel movements`,
      category: 'poop',
      pattern: 'unusual_colors',
      daysObserved: unusualColors.length,
      significance: 'high',
      recommendations: [
        'Document exact colors and frequency',
        'Review recent foods and medications',
        'Contact pediatrician promptly',
        'Monitor for other symptoms'
      ]
    })
  }

  return alerts
}

const analyzeGrowthPatterns = (growthData: GrowthEntry[]): PredictiveAlert[] => {
  const alerts: PredictiveAlert[] = []
  
  if (growthData.length >= 2) {
    const weights = growthData.map(entry => entry.weight)
    const heights = growthData.map(entry => entry.height)
    
    // Detect weight plateau
    const weightChanges = weights.slice(1).map((weight, i) => Math.abs(weight - weights[i]))
    const hasWeightPlateau = weightChanges.every(change => change <= 0.1) // Less than 100g change
    
    if (hasWeightPlateau && growthData.length >= 3) {
      alerts.push({
        id: 'growth-plateau-001',
        type: 'warning',
        status: 'Growth Plateau Detected',
        message: `Weight has remained stable across the past ${growthData.length} measurements over recent weeks`,
        category: 'growth',
        pattern: 'weight_plateau',
        daysObserved: growthData.length,
        significance: 'medium',
        recommendations: [
          'Review nutritional intake adequacy',
          'Monitor overall health and activity',
          'Consider growth spurt timing',
          'Discuss with pediatrician at next visit'
        ]
      })
    }
  }

  return alerts
}

const analyzeHealthPatterns = (symptomData: SymptomEntry[]): PredictiveAlert[] => {
  const alerts: PredictiveAlert[] = []
  
  // Detect persistent low-grade symptoms
  const feverDays = symptomData.filter(entry => 
    entry.symptoms.includes('fever')
  )
  
  if (feverDays.length >= 3) {
    alerts.push({
      id: 'health-persistent-001',
      type: 'error',
      status: 'Persistent Low-Grade Symptoms',
      message: `Low-grade fever and fatigue have been consistently observed over the past ${feverDays.length} days`,
      symptoms: ['Persistent fever', 'Increased fatigue'],
      temperature: '37.8°C',
      category: 'health',
      pattern: 'persistent_symptoms',
      daysObserved: feverDays.length,
      significance: 'high',
      recommendations: [
        'Schedule pediatrician appointment',
        'Monitor temperature regularly',
        'Ensure adequate hydration',
        'Watch for additional symptoms'
      ]
    })
  }

  return alerts
}

export function useHealthAlert() {
  const healthStore = useHealthStore()
  const { getHealthForDate } = storeToRefs(healthStore)
  
  // Get current date
  const currentDate = computed(() => new Date().toISOString().split('T')[0])
  
  const analyzeAllPatterns = () => {
    const { mealData, sleepData, poopData, growthData, symptomData } = generateDummyData()
    
    const allAlerts = [
      ...analyzeMealPatterns(mealData),
      ...analyzeSleepPatterns(sleepData),
      ...analyzePoopPatterns(poopData),
      ...analyzeGrowthPatterns(growthData),
      ...analyzeHealthPatterns(symptomData)
    ]
    
    // Sort by significance and return the most important alert
    const sortedAlerts = allAlerts.sort((a, b) => {
      const significanceOrder = { high: 3, medium: 2, low: 1 }
      return significanceOrder[b.significance] - significanceOrder[a.significance]
    })
    
    return sortedAlerts[0] || null
  }

  // Get health data with predictive analysis
  const healthData = computed(() => {
    const topAlert = analyzeAllPatterns()
    
    if (!topAlert) {
      return {
        status: 'All patterns normal',
        message: 'No unusual patterns detected in recent data',
        symptoms: [],
        temperature: undefined,
        lastUpdated: new Date().toISOString()
      }
    }
    
    // Transform PredictiveAlert to HealthData format
    return {
      status: topAlert.status,
      message: topAlert.message,
      symptoms: topAlert.symptoms || [],
      temperature: topAlert.temperature ? parseFloat(topAlert.temperature.replace('°C', '')) : undefined,
      lastUpdated: new Date().toISOString(),
      // Additional predictive fields for enhanced UI
      category: topAlert.category,
      pattern: topAlert.pattern,
      daysObserved: topAlert.daysObserved,
      significance: topAlert.significance,
      recommendations: topAlert.recommendations
    }
  })

  // Check if we should show the alert
  const hasHealthAlert = computed(() => {
    const data = healthData.value
    return data.status !== 'All patterns normal' && data.status !== 'Healthy'
  })

  // Initialize pattern analysis and fetch health data
  onMounted(async () => {
    // Fetch health data from store (this will generate mock data if none exists)
    await healthStore.fetchHealthForDate(currentDate.value)
    console.log('Initialized predictive pattern analysis with health store integration')
  })

  return {
    healthData,
    hasHealthAlert
  }
}

//  TODO: REUSE THE FIRST HALF OF THE CODES AFTER PRESENTATION