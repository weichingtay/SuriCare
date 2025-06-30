import { defineStore } from 'pinia'

// TypeScript Interfaces
interface SymptomsData {
  symptoms: string[]
  photo: File | null
  notes: string
}

interface PoopData {
  color: string
  texture: string
  notes: string
}

interface SleepData {
  bedTime: string
  awakeTime: string
  notes: string
}

interface MealData {
  mealTime: string
  consumptionLevel: string
  mealCategory: string
  subCategory: string
  customMeal: string
  notes: string
}

interface GrowthData {
  weight: string
  height: string
  headCircumference: string
  notes: string
}

interface CheckinEntry {
  id: number
  timestamp: string
}

interface SymptomsEntry extends CheckinEntry, SymptomsData {}
interface PoopEntry extends CheckinEntry, PoopData {}
interface SleepEntry extends CheckinEntry, SleepData {}
interface MealEntry extends CheckinEntry, MealData {}
interface GrowthEntry extends CheckinEntry, GrowthData {}

interface CheckinState {
  symptomsData: SymptomsData
  poopData: PoopData
  sleepData: SleepData
  mealData: MealData
  growthData: GrowthData
  history: {
    symptoms: SymptomsEntry[]
    poop: PoopEntry[]
    sleep: SleepEntry[]
    meal: MealEntry[]
    growth: GrowthEntry[]
  }
}

// Store Definition
export const useCheckinStore = defineStore('checkin', {
  state: (): CheckinState => ({
    // Symptoms data
    symptomsData: {
      symptoms: [], // Array for multiple selection
      photo: null,
      notes: '',
    },

    // Poop data
    poopData: {
      color: '',
      texture: '',
      notes: '',
    },

    // Sleep data
    sleepData: {
      bedTime: '',
      awakeTime: '',
      notes: '',
    },

    // Meal data
    mealData: {
      mealTime: '',
      consumptionLevel: '',
      mealCategory: '',
      subCategory: '', // For Breast Milk/Formula
      customMeal: '', // For "Others" input
      notes: '',
    },

    // Growth data
    growthData: {
      weight: '',
      height: '',
      headCircumference: '',
      notes: '',
    },

    // History for each type
    history: {
      symptoms: [],
      poop: [],
      sleep: [],
      meal: [],
      growth: [],
    },
  }),

  getters: {
    // Get latest entry for each type
    latestSymptoms: (state): SymptomsEntry | null => state.history.symptoms[0] || null,
    latestPoop: (state): PoopEntry | null => state.history.poop[0] || null,
    latestSleep: (state): SleepEntry | null => state.history.sleep[0] || null,
    latestMeal: (state): MealEntry | null => state.history.meal[0] || null,
    latestGrowth: (state): GrowthEntry | null => state.history.growth[0] || null,

    // Get today's entries
    todaysEntries: state => {
      const today = new Date().toDateString()
      return {
        symptoms: state.history.symptoms.filter(entry =>
          new Date(entry.timestamp).toDateString() === today
        ),
        poop: state.history.poop.filter(entry =>
          new Date(entry.timestamp).toDateString() === today
        ),
        sleep: state.history.sleep.filter(entry =>
          new Date(entry.timestamp).toDateString() === today
        ),
        meal: state.history.meal.filter(entry =>
          new Date(entry.timestamp).toDateString() === today
        ),
        growth: state.history.growth.filter(entry =>
          new Date(entry.timestamp).toDateString() === today
        ),
      }
    },

    // Get total count for each type
    totalCounts: state => ({
      symptoms: state.history.symptoms.length,
      poop: state.history.poop.length,
      sleep: state.history.sleep.length,
      meal: state.history.meal.length,
      growth: state.history.growth.length,
    }),
  },

  actions: {
    // Save symptoms data
    saveSymptoms (data: SymptomsData): SymptomsEntry {
      const entry: SymptomsEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...data,
      }
      this.history.symptoms.unshift(entry)
      this.clearSymptomsForm()
      console.log('Symptoms saved:', entry)
      return entry
    },

    // Save poop data
    savePoop (data: PoopData): PoopEntry {
      const entry: PoopEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...data,
      }
      this.history.poop.unshift(entry)
      this.clearPoopForm()
      console.log(' Poop data saved:', entry)
      return entry
    },

    // Save sleep data
    saveSleep (data: SleepData): SleepEntry {
      const entry: SleepEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...data,
      }
      this.history.sleep.unshift(entry)
      this.clearSleepForm()
      console.log('Sleep data saved:', entry)
      return entry
    },

    // Save meal data
    saveMeal (data: MealData): MealEntry {
      const entry: MealEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...data,
      }
      this.history.meal.unshift(entry)
      this.clearMealForm()
      console.log(' Meal data saved:', entry)
      return entry
    },

    // Save growth data
    saveGrowth (data: GrowthData): GrowthEntry {
      const entry: GrowthEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...data,
      }
      this.history.growth.unshift(entry)
      this.clearGrowthForm()
      console.log('Growth data saved:', entry)
      return entry
    },

    // Clear form methods
    clearSymptomsForm (): void {
      this.symptomsData = {
        symptoms: [],
        photo: null,
        notes: '',
      }
    },

    clearPoopForm (): void {
      this.poopData = {
        color: '',
        texture: '',
        notes: '',
      }
    },

    clearSleepForm (): void {
      this.sleepData = {
        bedTime: '',
        awakeTime: '',
        notes: '',
      }
    },

    clearMealForm (): void {
      this.mealData = {
        mealTime: '',
        consumptionLevel: '',
        mealCategory: '',
        subCategory: '',
        customMeal: '',
        notes: '',
      }
    },

    clearGrowthForm (): void {
      this.growthData = {
        weight: '',
        height: '',
        headCircumference: '',
        notes: '',
      }
    },

    // Delete entry methods
    deleteEntry (type: 'symptoms' | 'poop' | 'sleep' | 'meal' | 'growth', id: number): boolean {
      const index = this.history[type].findIndex(entry => entry.id === id)
      if (index > -1) {
        this.history[type].splice(index, 1)
        console.log(` Deleted ${type} entry:`, id)
        return true
      }
      return false
    },

    // Clear all history
    clearAllHistory (): void {
      this.history = {
        symptoms: [],
        poop: [],
        sleep: [],
        meal: [],
        growth: [],
      }
      console.log('All history cleared')
    },

    // Clear today's entries only
    clearTodaysEntries (): void {
      const today = new Date().toDateString()

      this.history.symptoms = this.history.symptoms.filter(entry =>
        new Date(entry.timestamp).toDateString() !== today
      )
      this.history.poop = this.history.poop.filter(entry =>
        new Date(entry.timestamp).toDateString() !== today
      )
      this.history.sleep = this.history.sleep.filter(entry =>
        new Date(entry.timestamp).toDateString() !== today
      )
      this.history.meal = this.history.meal.filter(entry =>
        new Date(entry.timestamp).toDateString() !== today
      )
      this.history.growth = this.history.growth.filter(entry =>
        new Date(entry.timestamp).toDateString() !== today
      )

      console.log('✅ Today\'s entries cleared')
    },

    // Export data for backup
    exportData (): string {
      return JSON.stringify({
        history: this.history,
        exportDate: new Date().toISOString(),
      }, null, 2)
    },

    // Import data from backup
    importData (jsonData: string): boolean {
      try {
        const data = JSON.parse(jsonData)
        if (data.history) {
          this.history = data.history
          console.log('✅ Data imported successfully')
          return true
        }
        return false
      } catch (error) {
        console.error(' Failed to import data:', error)
        return false
      }
    },


  },
})
