import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHistoricalStore = defineStore('historical', () => {
  // State
  const historicalData = ref({
    sleep: [],
    meals: [],
    health: [],
    activities: []
  })

  // Helper function to generate random data points
  const generateRandomData = (days, { min, max, trend = 'neutral', volatility = 0.7 }) => {
    const data = []
    let value = (max + min) / 2
    let momentum = 0 // Add momentum for more natural-looking trends

    for (let i = 0; i < days; i++) {
      // Add momentum to create smoother trends
      momentum = momentum * 0.7 + (Math.random() - 0.5) * volatility
      
      // Add trend bias
      const trendStrength = trend === 'neutral' ? 0 : 0.4
      const trendBias = trend === 'up' ? trendStrength : trend === 'down' ? -trendStrength : 0
      
      // Calculate new value with increased volatility and momentum
      const range = max - min
      const change = (momentum + trendBias) * range
      value = Math.min(max, Math.max(min, value + change))
      
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      
      data.push({
        date: date.toISOString(),
        value: Number(value.toFixed(1))
      })
    }
    return data
  }

  // Generate random data for different time ranges
  const generateDataForRange = (range) => {
    const days = range === '1w' ? 7 : range === '2w' ? 14 : 30

    historicalData.value = {
      sleep: generateRandomData(days, {
        min: 6,
        max: 10,
        trend: 'neutral',
        volatility: 0.7 // More variance in sleep patterns
      }),
      meals: generateRandomData(days, {
        min: 20,
        max: 90,
        trend: 'neutral',
        volatility: 0.5 // Moderate variance in meal completion
      }),
      health: generateRandomData(days, {
        min: 0,
        max: 2,
        trend: 'neutral',
        volatility: 0.35 // More dramatic health status changes
      }),
      activities: generateRandomData(days, {
        min: 40,
        max: 100,
        trend: 'up',
        volatility: 0.3 // Normal variance in activities
      })
    }
  }

  // Computed properties for trends
  const trends = computed(() => {
    const calculateTrend = (data) => {
      if (!data.length) return { value: 0, direction: 'neutral' }
      
      const recentValues = data.slice(-7)
      const avgRecent = recentValues.reduce((sum, d) => sum + d.value, 0) / recentValues.length
      const avgPrevious = data.slice(-14, -7).reduce((sum, d) => sum + d.value, 0) / 7
      
      const change = avgRecent - avgPrevious
      return {
        value: Math.abs(change).toFixed(1),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
      }
    }

    return {
      sleep: calculateTrend(historicalData.value.sleep),
      meals: calculateTrend(historicalData.value.meals),
      health: calculateTrend(historicalData.value.health),
      activities: calculateTrend(historicalData.value.activities)
    }
  })

  // Action to fetch data for a specific range
  const fetchDataForRange = (range) => {
    // TODO: Replace with actual API call to fetch historical data from database
    generateDataForRange(range)
  }

  return {
    historicalData,
    trends,
    fetchDataForRange
  }
}) 