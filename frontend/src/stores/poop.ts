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
import { timestampToDateString, dateToString } from '@/utils/dateUtils'

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
  invalidateCache: (date?: string) => void
  refreshPoopForDate: (date: string) => Promise<void>
}

export const usePoopStore = defineStore('poop', (): PoopStore => {
  // State
  const poopByDate = ref<PoopByDate>({})
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

   // Date utilities are now imported from shared utils

  // REMOVE THIS ENTIRE MOCK FUNCTION:
  // const generateMockPoopData = (date: string): PoopData => ({
  //   count: Math.floor(Math.random() * 4) + 1, // 1-4 times
  //   unusual: Math.random() > 0.7 ? 1 : 0, // 30% chance of unusual
  //   normal: Math.floor(Math.random() * 3) + 1, // 1-3 normal
  //   lastUpdated: new Date().toISOString(),
  // })

  // Bristol Stool Chart classification function
  const classifyStoolType = (poop: any): 'normal' | 'unusual' => {
    const color = poop.color_name?.toLowerCase() || ''
    const texture = poop.texture_name?.toLowerCase() || ''
    
    // Concerning colors (always unusual regardless of texture)
    const concerningColors = ['red', 'black', 'white', 'pale', 'clay', 'green']
    if (concerningColors.includes(color)) {
      return 'unusual'
    }
    
    // Bristol Chart Type 1 & 2 (Constipated)
    const hardTextures = ['hard', 'pellets', 'lumpy', 'sausage-lumpy', 'cracked']
    if (hardTextures.includes(texture)) {
      return 'unusual'
    }
    
    // Bristol Chart Type 3 & 4 (Normal/Ideal)
    const normalTextures = ['sausage', 'smooth', 'soft', 'formed', 'log']
    if (normalTextures.includes(texture)) {
      return 'normal'
    }
    
    // Bristol Chart Type 5, 6 & 7 (Loose/Diarrhea)
    const looseTextures = ['soft-blobs', 'mushy', 'watery', 'liquid', 'loose']
    if (looseTextures.includes(texture)) {
      return 'unusual'
    }
    
    // Default classification based on common descriptors
    const additionalNormal = ['brown', 'tan', 'yellow'] // normal colors
    const additionalUnusual = ['sticky', 'foamy', 'floating', 'mucus'] // texture concerns
    
    if (additionalNormal.includes(color) && !additionalUnusual.some(desc => texture.includes(desc))) {
      return 'normal'
    }
    
    // When in doubt, classify as unusual for safety (especially for children)
    return 'unusual'
  }

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
      const response = await axios.get(`http://127.0.0.1:8000/poop/child/${childrenStore.currentChild.id}?days=90`)
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
  
        let unusualCount = 0
        poopsForDate.forEach((poop, index) => {
          const classification = classifyStoolType(poop)
          if (classification === 'unusual') unusualCount++
          
          console.log(`  💩 Poop ${index + 1}: Color=${poop.color_name}, Texture=${poop.texture_name}, Classification=${classification}`)
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

  // Invalidate cache for specific date or all dates
  const invalidateCache = (date?: string) => {
    if (date) {
      delete poopByDate.value[date]
      console.log(`🗑️ Invalidated poop cache for ${date}`)
    } else {
      poopByDate.value = {}
      console.log(`🗑️ Cleared entire poop cache`)
    }
    // Force reactivity update
    poopByDate.value = { ...poopByDate.value }
  }

  // Force refresh for specific date
  const refreshPoopForDate = async (date: string): Promise<void> => {
    console.log(`🔄 Force refreshing poop data for ${date}`)
    invalidateCache(date)
    await fetchPoopForDate(date)
  }

  return {
    poopByDate,
    isLoading,
    error,
    getPoopForDate,
    fetchPoopForDate,
    updatePoopForDate,
    invalidateCache,
    refreshPoopForDate,
  }
})