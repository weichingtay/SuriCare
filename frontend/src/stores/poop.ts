// import { defineStore } from 'pinia'
// import { computed, ref } from 'vue'
// import type { ComputedRef, Ref } from 'vue'

// export interface PoopData {
//   count: number
//   unusual: number
//   normal: number
//   lastUpdated: string
// }

// interface PoopByDate {
//   [date: string]: PoopData
// }

// interface PoopStore {
//   poopByDate: Ref<PoopByDate>
//   isLoading: Ref<boolean>
//   error: Ref<string | null>
//   getPoopForDate: ComputedRef<(date: string) => PoopData>
//   fetchPoopForDate: (date: string) => Promise<void>
//   updatePoopForDate: (date: string, poopData: PoopData) => Promise<void>
// }

// export const usePoopStore = defineStore('poop', (): PoopStore => {
//   // State
//   const poopByDate = ref<PoopByDate>({})
//   const isLoading = ref<boolean>(false)
//   const error = ref<string | null>(null)

//   // HACK: This will eventually be connected to our database
//   // Mock data generator for development
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const generateMockPoopData = (date: string): PoopData => ({
//     count: Math.floor(Math.random() * 4) + 1, // 1-4 times
//     unusual: Math.random() > 0.7 ? 1 : 0, // 30% chance of unusual
//     normal: Math.floor(Math.random() * 3) + 1, // 1-3 normal
//     lastUpdated: new Date().toISOString(),
//   })

//   // Getters
//   const getPoopForDate = computed(() => (date: string): PoopData => {
//     return poopByDate.value[date] || generateMockPoopData(date)
//   })

//   // Actions
//   const fetchPoopForDate = async (date: string): Promise<void> => {
//     isLoading.value = true
//     error.value = null

//     try {
//       // TODO: Replace with actual API call
//       // const response = await axios.get<PoopData>(`/api/poop/${date}`)
//       // poopByDate.value[date] = response.data

//       // Using mock data for now
//       poopByDate.value[date] = generateMockPoopData(date)
//     } catch (err) {
//       error.value = err instanceof Error ? err.message : 'An unknown error occurred'
//       console.error('Error fetching poop data:', err)
//     } finally {
//       isLoading.value = false
//     }
//   }

//   const updatePoopForDate = async (date: string, poopData: PoopData): Promise<void> => {
//     isLoading.value = true
//     error.value = null

//     try {
//       // TODO: Replace with actual API call
//       // await axios.put<PoopData>(`/api/poop/${date}`, poopData)
//       // poopByDate.value[date] = poopData

//       // Using mock data for now
//       poopByDate.value[date] = poopData
//     } catch (err) {
//       error.value = err instanceof Error ? err.message : 'An unknown error occurred'
//       console.error('Error updating poop data:', err)
//     } finally {
//       isLoading.value = false
//     }
//   }

//   return {
//     poopByDate,
//     isLoading,
//     error,
//     getPoopForDate,
//     fetchPoopForDate,
//     updatePoopForDate,
//   }
// })


import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
// ADD THESE TWO IMPORTS:
import axios from 'axios'
import { useChildrenStore } from './children'

export interface PoopData {
  count: number
  unusual: number
  normal: number
  lastUpdated: string
}

interface PoopByDate {
  [date: string]: PoopData
}

interface PoopStore {
  poopByDate: Ref<PoopByDate>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  getPoopForDate: ComputedRef<(date: string) => PoopData>
  fetchPoopForDate: (date: string) => Promise<void>
  updatePoopForDate: (date: string, poopData: PoopData) => Promise<void>
}

export const usePoopStore = defineStore('poop', (): PoopStore => {
  // State
  const poopByDate = ref<PoopByDate>({})
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

   // ADD THIS HELPER FUNCTION HERE:
  const timestampToDateString = (timestamp: string): string => {
    const date = new Date(timestamp)

    // Get the date in your local timezone (GMT+8)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }

  // REMOVE THIS ENTIRE MOCK FUNCTION:
  // const generateMockPoopData = (date: string): PoopData => ({
  //   count: Math.floor(Math.random() * 4) + 1, // 1-4 times
  //   unusual: Math.random() > 0.7 ? 1 : 0, // 30% chance of unusual
  //   normal: Math.floor(Math.random() * 3) + 1, // 1-3 normal
  //   lastUpdated: new Date().toISOString(),
  // })

  // UPDATE THIS GETTER:
// REPLACE THIS ENTIRE FUNCTION:
const getPoopForDate = computed(() => (date: string): PoopData => {
  console.log(`🔍 Getting poop for ${date}`) // ADD THIS
  console.log(`🗂️ Available cached dates:`, Object.keys(poopByDate.value)) // ADD THIS
  
  const cachedData = poopByDate.value[date]
  
  if (!cachedData) {
    console.log(`📥 Not cached, triggering fetch for ${date}`) // ADD THIS
    fetchPoopForDate(date)
    
    return {
      count: 0,
      unusual: 0,
      normal: 0,
      lastUpdated: '',
    }
  }
  
  console.log(`📤 Returning cached poop data for ${date}:`, cachedData) // ADD THIS
  return cachedData
})

  // REPLACE THIS ENTIRE FUNCTION:
  const fetchPoopForDate = async (date: string): Promise<void> => {
      console.log(`🚀 Fetching poop for date: ${date}`) // ADD THIS
    // Don't fetch if already cached
    if (poopByDate.value[date]) {
          console.log(`📋 Already cached for ${date}`) // ADD THIS

      return
    }

    isLoading.value = true
    error.value = null

    try {
      const childrenStore = useChildrenStore()
      
      if (!childrenStore.currentChild) {
             console.warn('⚠️ No current child selected') // ADD THIS

        return
      }

      // Fetch real poop data from API
      const response = await axios.get(`http://127.0.0.1:8000/poop/child/${childrenStore.currentChild.id}`)
      const allPoops = response.data || []
      
          console.log(`📊 API returned ${allPoops.length} total poop records`) // ADD THIS

const samplePoops = allPoops.slice(0, 3).map((poop: any) => ({
      id: poop.id,
      check_in: poop.check_in,
      converted_date: timestampToDateString(poop.check_in)
    }))
    console.log(`🔍 Sample poop dates:`, samplePoops) // ADD THIS


      // Filter for target date
      const poopsForDate = allPoops.filter((poop: any) => {
  const poopDate = timestampToDateString(poop.check_in)
  const matches = poopDate === date
      
      if (!matches) {
        console.log(`❌ Poop ${poop.id}: ${poop.check_in} → ${poopDate} ≠ ${date}`) // ADD THIS
      } else {
        console.log(`✅ Poop ${poop.id}: ${poop.check_in} → ${poopDate} = ${date}`) // ADD THIS
      }
      
      return matches
})

    console.log(`📅 Found ${poopsForDate.length} poop records for ${date}`) // ADD THIS


      // Process into your existing format
      if (poopsForDate.length === 0) {
  poopByDate.value[date] = {
    count: 0,
    unusual: 0,
    normal: 0,
    lastUpdated: '',
  }
  console.log(`📭 No poop data for ${date}`)
} else {
  console.log(`🔄 Processing ${poopsForDate.length} poop records...`)
  
  // Count unusual vs normal based on colors/textures
  const concerningColors = ['red', 'black']
  const concerningTextures = ['watery', 'pellets']
  
  let unusualCount = 0
  poopsForDate.forEach((poop, index) => {
    const hasUnusual = concerningColors.includes(poop.color_name?.toLowerCase()) || 
                      concerningTextures.includes(poop.texture_name?.toLowerCase())
    if (hasUnusual) unusualCount++
    
    console.log(`  💩 Poop ${index + 1}: Color=${poop.color_name}, Texture=${poop.texture_name}, Unusual=${hasUnusual}`)
  })

  poopByDate.value[date] = {
    count: poopsForDate.length,
    unusual: unusualCount,
    normal: poopsForDate.length - unusualCount,
    lastUpdated: new Date().toISOString(),
  }
  
  console.log(`✅ Cached poop data for ${date}:`, poopByDate.value[date])
}
    poopByDate.value = { ...poopByDate.value }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error fetching poop data:', err)
      
      // Set empty data on error
      poopByDate.value[date] = {
        count: 0,
        unusual: 0,
        normal: 0,
        lastUpdated: '',
      }
    } finally {
      isLoading.value = false
    }
  }

  const updatePoopForDate = async (date: string, poopData: PoopData): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // await axios.put<PoopData>(`/api/poop/${date}`, poopData)
      // poopByDate.value[date] = poopData

      // Using mock data for now
      poopByDate.value[date] = poopData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error updating poop data:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    poopByDate,
    isLoading,
    error,
    getPoopForDate,
    fetchPoopForDate,
    updatePoopForDate,
  }
})