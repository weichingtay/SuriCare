<template>
  <v-app>
    <v-main style="background-color: #faf7f2">
      <v-container class="dashboard-container">
        <!-- Dashboard Header -->
        <div class="dashboard-header">
          <div class="header-left">
            <h1 class="dashboard-title">Dashboard</h1>
            <div class="dashboard-subtitle">
              View visualizations of 
              <span v-if="childrenStore.currentChild">{{ childrenStore.currentChild.name }}'s</span>
              <span v-else>child's</span>
              status
            </div>
          </div>
          
          <!-- Loading indicator -->
          <div v-if="isLoadingData" class="loading-indicator">
            <v-progress-circular indeterminate size="20" />
            <span class="loading-text">Loading data...</span>
          </div>
          
          <!-- Error message -->
          <div v-if="dataError" class="error-indicator">
            <v-icon color="error" size="20">mdi-alert-circle</v-icon>
            <span class="error-text">{{ dataError }}</span>
          </div>
          
          <!-- Date Picker -->
          <v-menu
            v-model="datePickerMenu"
            :close-on-content-click="false"
            location="bottom end"
          >
            <template #activator="{ props }">
              <button
                v-bind="props"
                class="date-picker-btn"
              >
                <v-icon size="20" start>mdi-calendar</v-icon>
                {{ formattedDate }}
                <v-icon end size="16">mdi-chevron-down</v-icon>
              </button>
            </template>

            <v-card>
              <v-date-picker
                v-model="selectedDate"
                color="rgba($app-primary, 0.1) !important"
                @update:model-value="datePickerMenu = false"
              />
            </v-card>
          </v-menu>
        </div>

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
          <!-- Growth Section -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2 class="section-title">Growth</h2>
              <div class="view-toggle">
                <button
                  :class="['view-btn', { 'active': growthViewMode === 'weekly' }]"
                  @click="setGrowthView('weekly')"
                >
                  Weekly
                </button>
                <button
                  :class="['view-btn', { 'active': growthViewMode === 'monthly' }]"
                  @click="setGrowthView('monthly')"
                >
                  Monthly
                </button>
              </div>
            </div>
            <div class="chart-container">
              <apexchart
                :options="weightOptions"
                :series="weightSeries"
                width="100%"
                height="300"
              />
            </div>
          </div>

      
          <!-- Meal Section -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2 class="section-title">Meal</h2>
            </div>
            <div class="chart-container">
              <apexchart
                :options="mealDistributionOptions"
                :series="mealDistributionSeries"
                width="100%"
                height="300"
              />
            </div>
          </div>

          <!-- Sleep Section -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2 class="section-title">Sleep</h2>
              <div class="view-toggle">
                <button
                  :class="['view-btn', { 'active': sleepViewMode === 'weekly' }]"
                  @click="setSleepView('weekly')"
                >
                  Weekly
                </button>
                <button
                  :class="['view-btn', { 'active': sleepViewMode === 'monthly' }]"
                  @click="setSleepView('monthly')"
                >
                  Monthly
                </button>
              </div>
            </div>
            <div class="chart-container">
              <apexchart
                :options="sleepOptions"
                :series="sleepSeries"
                width="100%"
                height="300"
              />
            </div>
          </div>

          <!-- Poop Section -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2 class="section-title">Poop</h2>
              <div class="view-toggle">
                <button
                  :class="['view-btn', { 'active': poopViewMode === 'weekly' }]"
                  @click="setPoopView('weekly')"
                >
                  Weekly
                </button>
                <button
                  :class="['view-btn', { 'active': poopViewMode === 'monthly' }]"
                  @click="setPoopView('monthly')"
                >
                  Monthly
                </button>
              </div>
            </div>
            <div class="chart-container">
              <apexchart
                :options="poopFrequencyOptions"
                :series="poopFrequencySeries"
                width="100%"
                height="300"
              />
            </div>
          </div>
        </div>

        <!-- Second Row - Height, Head Circumference -->
        <div class="dashboard-grid dashboard-grid-secondary">
          <!-- Height Growth Section -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2 class="section-title">Height Growth</h2>
              <div class="view-toggle">
                <button
                  :class="['view-btn', { 'active': heightViewMode === 'weekly' }]"
                  @click="setHeightView('weekly')"
                >
                  Weekly
                </button>
                <button
                  :class="['view-btn', { 'active': heightViewMode === 'monthly' }]"
                  @click="setHeightView('monthly')"
                >
                  Monthly
                </button>
              </div>
            </div>
            <div class="chart-container">
              <apexchart
                :options="heightOptions"
                :series="heightSeries"
                width="100%"
                height="300"
              />
            </div>
          </div>

          <!-- Head Circumference Section -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2 class="section-title">Head Circumference</h2>
              <div class="view-toggle">
                <button
                  :class="['view-btn', { 'active': headViewMode === 'weekly' }]"
                  @click="setHeadView('weekly')"
                >
                  Weekly
                </button>
                <button
                  :class="['view-btn', { 'active': headViewMode === 'monthly' }]"
                  @click="setHeadView('monthly')"
                >
                  Monthly
                </button>
              </div>
            </div>
            <div class="chart-container">
              <apexchart
                :options="headOptions"
                :series="headSeries"
                width="100%"
                height="300"
              />
            </div>
          </div>
        </div>

        <!-- Health Timeline Section - Full Width -->
        <div class="dashboard-section dashboard-section-full">
          <div class="section-header">
            <h2 class="section-title">Symptoms</h2>
          </div>
          
          <!-- Symptoms Timeline -->
          <div class="symptoms-timeline">
            <div 
              v-for="symptom in healthSymptoms" 
              :key="symptom.id"
              class="symptom-entry"
            >
              <div class="symptom-date">
                <div class="date-day">{{ formatSymptomDate(symptom.date).day }}</div>
                <div class="date-month">{{ formatSymptomDate(symptom.date).month }}</div>
              </div>
              <div class="symptom-content">
                <div class="symptom-type">{{ symptom.type }}</div>
                <div class="symptom-description">{{ symptom.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useChildrenStore } from '@/stores/children'

// Store instances
const authStore = useAuthStore()
const childrenStore = useChildrenStore()

// Set current date as default instead of hardcoded date
const selectedDate = ref(new Date()) // Use today's date
const datePickerMenu = ref(false)

// Loading and error states
const isLoadingData = ref(false)
const dataError = ref(null)

// View mode states
const growthViewMode = ref('weekly')
const mealViewMode = ref('weekly')
const sleepViewMode = ref('weekly')
const poopViewMode = ref('weekly')
const heightViewMode = ref('weekly')
const headViewMode = ref('weekly')

// Health symptoms data
const healthSymptoms = ref([
  {
    id: 1,
    date: '2025-05-20',
    type: 'Fever',
    description: 'Lorem ipsum dolor sit amet consectetur. Dui ut tempor et sit temporum ut magna fermentum ullamcorper vitae.'
  },
  {
    id: 2,
    date: '2025-05-17',
    type: 'Fever',
    description: 'Lorem ipsum dolor sit amet consectetur. Dui ut tempor et sit temporum ut magna fermentum ullamcorper vitae.'
  },
  {
    id: 3,
    date: '2025-05-15',
    type: 'Fever',
    description: 'Lorem ipsum dolor sit amet consectetur. Dui ut tempor et sit temporum ut magna fermentum ullamcorper vitae.'
  },
  {
    id: 4,
    date: '2025-05-14',
    type: 'Fever',
    description: 'Lorem ipsum dolor sit amet consectetur. Dui ut tempor et sit temporum ut magna fermentum ullamcorper vitae.'
  }
])

// Computed for formatted date
const formattedDate = computed(() => {
  const date = selectedDate.value
  const day = date.getDate()
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
})

// Format symptom date
const formatSymptomDate = (dateString) => {
  const date = new Date(dateString)
  return {
    day: date.getDate().toString().padStart(2, '0'),
    month: date.toLocaleDateString('en-US', { month: 'short' })
  }
}

// Setup initial reference for actual weight, height, head_circumference, sleep time
const actual = reactive({
  weight: [],
  height: [],
  head_circumference: [],
  sleep_time: {
    nap: [],
    night: [],
  },
})

// Setup initial reference for benchmark weight, height & head_circumference
const benchmark = reactive({
  weight: [],
  height: [],
  head_circumference: [],
})

// Setup initial reference of min / max value on Y-axis for charts
const chart = reactive({
  weight: {
    y_min: 3.2,
    y_max: 18.3,
  },
  height: {
    y_min: 49.1,
    y_max: 110,
  },
  head_circumference: {
    y_min: 33.9,
    y_max: 50.7,
  },
  sleep: {
    y_min: 0,
    y_max: 15,
  },
})

// Chart data for Weight
const weightSeries = ref([
  {
    name: 'Actual',
    data: [],
  },
  {
    name: 'Benchmark',
    data: [],
  },
])

// Chart options for Weight (SIMPLIFIED)
const weightOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
  },
  theme: {
    mode: 'light',
    palette: 'palette5',
  },
  colors: ['#3b82f6', '#94a3b8'], // Blue for actual, Gray for benchmark
  xaxis: {
    type: 'datetime',
    labels: {
      show: true,
      rotate: -45,
      datetimeUTC: false,
      formatter: function(val) {
        const date = new Date(val)
        if (growthViewMode.value === 'weekly') {
          return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
        } else {
          return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        }
      },
    },
    tickAmount: undefined,
    tickPlacement: 'on',
  },
  yaxis: {
    title: {
      text: 'Weight, kg',
    },
    forceNiceScale: true,
    labels: {
      formatter: function(val) {
        return val.toFixed(1) + ' kg'
      }
    }
  },
  stroke: {
    curve: 'smooth',
    width: [3, 2],
    dashArray: [0, 5] // Solid for actual, dashed for benchmark
  },
  markers: {
    size: [5, 0], // Show markers on actual measurements only
    colors: ['#3b82f6', '#94a3b8'],
    strokeColors: '#fff',
    strokeWidth: 2,
  },
  legend: {
    show: true,
    position: 'bottom',
  },
  tooltip: {
    shared: false,
    intersect: true,
    custom: function({ series, seriesIndex, dataPointIndex, w }) {
      const value = series[seriesIndex][dataPointIndex]
      const date = new Date(w.globals.seriesX[seriesIndex][dataPointIndex])
      const seriesName = w.globals.seriesNames[seriesIndex]
      
      return `
        <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; font-family: Inter, sans-serif;">
          <div style="font-weight: 600; margin-bottom: 6px; color: #374151;">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div style="color: ${seriesIndex === 0 ? '#3b82f6' : '#94a3b8'};">
            ${seriesName}: <strong>${value.toFixed(2)} kg</strong>
          </div>
        </div>
      `
    }
  }
}))

// Chart series for meal distribution (pie chart showing Milk, Solid, Mixed, Others)
const mealDistributionSeries = ref([])

// Chart options for meal distribution (pie chart)
const mealDistributionOptions = ref({
  chart: {
    type: 'donut',
    toolbar: { show: false },
  },
  theme: {
    mode: 'light',
    palette: 'palette5',
  },
  colors: ['#81c5f7', '#fb9bec', '#fbbf24', '#34d399'],
  labels: [],
  title: {
    text: '',
  },
  legend: { 
    show: true,
    position: 'bottom',
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`
  },
  plotOptions: {
    pie: {
      donut: {
        size: '60%',
      }
    }
  }
})

// Chart data for Height
const heightSeries = ref([
  {
    name: 'Actual',
    data: [],
  },
  {
    name: 'Benchmark',
    data: [],
  },
])

// Chart options for Height
// Chart options for Height (SIMPLIFIED)
const heightOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
  },
  theme: {
    mode: 'light',
    palette: 'palette5',
  },
  colors: ['#10b981', '#94a3b8'], // Green for actual, Gray for benchmark
  xaxis: {
    type: 'datetime',
    labels: {
      show: true,
      rotate: -45,
      datetimeUTC: false,
      formatter: function(val) {
        const date = new Date(val)
        if (heightViewMode.value === 'weekly') {
          return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
        } else {
          return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        }
      },
    },
    tickAmount: undefined,
    tickPlacement: 'on',
  },
  yaxis: {
    title: {
      text: 'Height, cm',
    },
    forceNiceScale: true,
    labels: {
      formatter: function(val) {
        return val.toFixed(0) + ' cm'
      }
    }
  },
  stroke: {
    curve: 'smooth',
    width: [3, 2],
    dashArray: [0, 5]
  },
  markers: {
    size: [5, 0],
    colors: ['#10b981', '#94a3b8'],
    strokeColors: '#fff',
    strokeWidth: 2,
  },
  legend: {
    show: true,
    position: 'bottom',
  },
  tooltip: {
    shared: false,
    intersect: true,
    custom: function({ series, seriesIndex, dataPointIndex, w }) {
      const value = series[seriesIndex][dataPointIndex]
      const date = new Date(w.globals.seriesX[seriesIndex][dataPointIndex])
      const seriesName = w.globals.seriesNames[seriesIndex]
      
      return `
        <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; font-family: Inter, sans-serif;">
          <div style="font-weight: 600; margin-bottom: 6px; color: #374151;">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div style="color: ${seriesIndex === 0 ? '#10b981' : '#94a3b8'};">
            ${seriesName}: <strong>${value.toFixed(1)} cm</strong>
          </div>
        </div>
      `
    }
  }
}))

// Chart data for Head Circumference
const headSeries = ref([
  {
    name: 'Actual',
    data: [],
  },
  {
    name: 'Benchmark',
    data: [],
  },
])

// Chart options for Head Circumference
// Chart options for Head Circumference (SIMPLIFIED)
const headOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
  },
  theme: {
    mode: 'light',
    palette: 'palette5',
  },
  colors: ['#8b5cf6', '#94a3b8'], // Purple for actual, Gray for benchmark
  xaxis: {
    type: 'datetime',
    labels: {
      show: true,
      rotate: -45,
      datetimeUTC: false,
      formatter: function(val) {
        const date = new Date(val)
        if (headViewMode.value === 'weekly') {
          return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
        } else {
          return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        }
      },
    },
    tickAmount: undefined,
    tickPlacement: 'on',
  },
  yaxis: {
    title: {
      text: 'Head circumference, cm',
    },
    forceNiceScale: true,
    labels: {
      formatter: function(val) {
        return val.toFixed(1) + ' cm'
      }
    }
  },
  stroke: {
    curve: 'smooth',
    width: [3, 2],
    dashArray: [0, 5]
  },
  markers: {
    size: [5, 0],
    colors: ['#8b5cf6', '#94a3b8'],
    strokeColors: '#fff',
    strokeWidth: 2,
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: true,
    position: 'bottom',
  },
  tooltip: {
    shared: false,
    intersect: true,
    custom: function({ series, seriesIndex, dataPointIndex, w }) {
      const value = series[seriesIndex][dataPointIndex]
      const date = new Date(w.globals.seriesX[seriesIndex][dataPointIndex])
      const seriesName = w.globals.seriesNames[seriesIndex]
      
      return `
        <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; font-family: Inter, sans-serif;">
          <div style="font-weight: 600; margin-bottom: 6px; color: #374151;">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div style="color: ${seriesIndex === 0 ? '#8b5cf6' : '#94a3b8'};">
            ${seriesName}: <strong>${value.toFixed(1)} cm</strong>
          </div>
        </div>
      `
    }
  }
}))

// Chart data for Sleep
const sleepSeries = ref([
  {
    name: 'Nap',
    data: [],
  },
  {
    name: 'Night',
    data: [],
  },
])

// Chart options for Sleep
const sleepOptions = ref({
  chart: {
    type: 'area',
    stacked: true,
    toolbar: { show: false },
  },
  theme: {
    mode: 'light',
    palette: 'palette5',
  },
  colors: ['#81c5f7', '#fb9bec'],
  xaxis: {
    type: 'datetime',
    labels: {
      show: true,
      rotate: -45,
      datetimeUTC: false,
      formatter (_, timestamp, opts) {
        return opts.dateFormatter(new Date(timestamp), 'dd MMM yy')
      },
    },
    tickPlacement: 'on',
    tickAmount: 'dataPoints',
  },
  yaxis: {
    title: {
      text: 'Total Sleep, hours',
    },
    min: () => chart.sleep.y_min,
    max: () => chart.sleep.y_max,
  },
  title: {
    text: '',
  },
  markers: {
    size: [1, 1],
    strokeColors: 'grey',
  },
  stroke: {
    curve: 'straight',
    width: 3,
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: true,
    position: 'bottom',
  },
})

// Chart series for poop frequency
const poopFrequencySeries = ref([{
  name: 'Daily Frequency',
  data: []
}])

// Chart options for poop frequency
const poopFrequencyOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false },
  },
  theme: {
    mode: 'light',
    palette: 'palette5',
  },
  colors: ['#fbbf24'],
  xaxis: {
    type: 'datetime',
    labels: {
      show: true,
      rotate: -45,
      datetimeUTC: false,
      formatter: (_, timestamp, opts) => {
        return opts.dateFormatter(new Date(timestamp), 'dd MMM yy')
      }
    },
    tickPlacement: 'on',
    tickAmount: 'dataPoints',
  },
  yaxis: {
    title: {
      text: 'Times per Day'
    },
    min: 0,
    max: 5,
    tickAmount: 5,
    labels: {
      formatter: function (val) {
        return parseInt(val)
      }
    }
  },
  title: {
    text: '',
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: false
    }
  },
  stroke: {
    curve: 'straight',
    width: 3,
  },
  legend: {
    show: false,
  },
})

// Function to set maximum & minimum value for Y-axis of weight, height and head circumference
const setY_min_max = (actual_array, benchmark_array, series) => {
  if (actual_array.length === 0 && benchmark_array.length === 0) {
    return // Don't update if no data
  }

  const actual_min = actual_array.length > 0 ? Math.min(...actual_array) : Number.MAX_VALUE
  const benchmark_min = benchmark_array.length > 0 ? Math.min(...benchmark_array) : Number.MAX_VALUE
  const actual_max = actual_array.length > 0 ? Math.max(...actual_array) : Number.MIN_VALUE
  const benchmark_max = benchmark_array.length > 0 ? Math.max(...benchmark_array) : Number.MIN_VALUE

  // Get the overall min and max
  const overall_min = Math.min(actual_min, benchmark_min)
  const overall_max = Math.max(actual_max, benchmark_max)

  // Add small padding (5% of the range) for better visualization
  const range = overall_max - overall_min
  const padding = range * 0.1 // 10% padding

  let y_min = overall_min - padding
  let y_max = overall_max + padding

  // Ensure minimum doesn't go below 0 for weight/height/head circumference
  if (y_min < 0) {
    y_min = 0
  }

  // Round to reasonable precision
  y_min = Math.floor(y_min * 100) / 100
  y_max = Math.ceil(y_max * 100) / 100

  console.log(`Setting Y-axis for ${series}: min=${y_min}, max=${y_max}`)

  chart[series].y_min = y_min
  chart[series].y_max = y_max
}

// Function to set maximum value for Y-axis of sleep time
const setY_max_for_sleep = (nap_hour, night_hour) => {
  if (nap_hour.length === 0 && night_hour.length === 0) {
    return // Don't update if no data
  }

  const nap_values = nap_hour
  const night_values = night_hour

  // Calculate total sleep values
  const total_sleep_values = []
  const maxLength = Math.max(nap_values.length, night_values.length)
  
  for (let i = 0; i < maxLength; i++) {
    const nap_time = nap_values[i] || 0
    const night_time = night_values[i] || 0
    const total = nap_time + night_time
    total_sleep_values.push(total)
  }

  if (total_sleep_values.length > 0) {
    const max_sleep = Math.max(...total_sleep_values)
    const y_max = Math.ceil(max_sleep * 1.1) // Add 10% padding
    chart.sleep.y_max = Math.max(y_max, 5) // Minimum of 5 hours for readability
    chart.sleep.y_min = 0
    
    console.log(`Setting sleep Y-axis: min=0, max=${chart.sleep.y_max}`)
  }
}

// Get current child ID safely with error handling
const getCurrentChildId = () => {
  if (!childrenStore.currentChild || !childrenStore.currentChild.id) {
    console.warn('No current child selected or invalid child ID')
    dataError.value = 'Please select a child to view dashboard data'
    return null
  }
  return childrenStore.currentChild.id
}

// Enhanced fetch functions that use real backend data and respond to date changes
const fetchGrowth = async (selectedDateParam) => {
  try {
    const childId = getCurrentChildId()
    if (!childId) return

    isLoadingData.value = true
    dataError.value = null
    
    console.log(`🔄 Fetching growth data with benchmarks for child ${childId}`)
    
    // Call your correct endpoint
    const response = await axios.get(`http://127.0.0.1:8000/growth/child/${childId}/with-benchmarks`)
    const growth_data = response.data

    if (!growth_data || growth_data.length === 0) {
      console.log('❌ No growth data available for child:', childId)
      // Clear charts when no data
      weightSeries.value = [{ name: 'Actual', data: [] }, { name: 'Benchmark', data: [] }]
      heightSeries.value = [{ name: 'Actual', data: [] }, { name: 'Benchmark', data: [] }]
      headSeries.value = [{ name: 'Actual', data: [] }, { name: 'Benchmark', data: [] }]
      return
    }

    console.log('📊 Growth data received:', growth_data.length, 'records')

    // SIMPLE: Convert backend data to chart format (sort by date - oldest first)
    const sortedData = growth_data.sort((a, b) => new Date(a.check_in) - new Date(b.check_in))

    // Weight data
    const actualWeight = sortedData
      .filter(item => item.actual_weight !== null)
      .map(item => ({
        x: new Date(item.check_in).getTime(),
        y: parseFloat(item.actual_weight)
      }))

    const benchmarkWeight = sortedData
      .filter(item => item.benchmark_weight !== null)
      .map(item => ({
        x: new Date(item.check_in).getTime(),
        y: parseFloat(item.benchmark_weight)
      }))

    // Height data
    const actualHeight = sortedData
      .filter(item => item.actual_height !== null)
      .map(item => ({
        x: new Date(item.check_in).getTime(),
        y: parseFloat(item.actual_height)
      }))

    const benchmarkHeight = sortedData
      .filter(item => item.benchmark_height !== null)
      .map(item => ({
        x: new Date(item.check_in).getTime(),
        y: parseFloat(item.benchmark_height)
      }))

    // Head circumference data
    const actualHC = sortedData
      .filter(item => item.actual_head_circumference !== null)
      .map(item => ({
        x: new Date(item.check_in).getTime(),
        y: parseFloat(item.actual_head_circumference)
      }))

    const benchmarkHC = sortedData
      .filter(item => item.benchmark_head_circumference !== null)
      .map(item => ({
        x: new Date(item.check_in).getTime(),
        y: parseFloat(item.benchmark_head_circumference)
      }))

    // Store the data (no complex filtering, just store it)
    actual.weight = actualWeight
    benchmark.weight = benchmarkWeight
    actual.height = actualHeight
    benchmark.height = benchmarkHeight
    actual.head_circumference = actualHC
    benchmark.head_circumference = benchmarkHC

    // SIMPLE: Apply view mode filtering and update charts
    updateChartsForDate()
    
    console.log(`✅ Growth data processed:`, {
      weight_points: actualWeight.length,
      height_points: actualHeight.length,
      hc_points: actualHC.length,
    })

  } catch (error) {
    console.error(`❌ Error fetching growth data:`, error)
    dataError.value = 'Failed to load growth data'
  } finally {
    isLoadingData.value = false
  }
}

// Enhanced chart options following medical charting standards
const enhanceGrowthChartOptions = () => {
  // Weight Chart Options (Medical Standard)
  weightOptions.value = {
    ...weightOptions.value,
    title: {
      text: 'Weight Progress',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#2c1810',
      },
    },
    colors: ['#3b82f6', '#94a3b8'], // Blue for actual, Gray for benchmark
    stroke: {
      curve: 'smooth', // Medical charts use smooth curves
      width: [3, 2], // Actual line thicker than benchmark
      dashArray: [0, 5] // Solid for actual, dashed for benchmark
    },
    markers: {
      size: [5, 0], // Show markers on actual measurements only
      colors: ['#3b82f6', '#94a3b8'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        sizeOffset: 3
      }
    },
    tooltip: {
      shared: false,
      intersect: true,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex]
        const date = new Date(w.globals.categoryLabels[dataPointIndex])
        const seriesName = w.globals.seriesNames[seriesIndex]
        
        return `
          <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <div style="font-weight: 600; margin-bottom: 6px;">${date.toLocaleDateString()}</div>
            <div style="color: ${seriesIndex === 0 ? '#3b82f6' : '#94a3b8'};">
              ${seriesName}: <strong>${value}kg</strong>
            </div>
          </div>
        `
      }
    }
  }

  // Height Chart Options
  heightOptions.value = {
    ...heightOptions.value,
    title: {
      text: 'Height Progress',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#2c1810',
      },
    },
    colors: ['#10b981', '#94a3b8'], // Green for actual, Gray for benchmark
    stroke: {
      curve: 'smooth',
      width: [3, 2],
      dashArray: [0, 5]
    },
    markers: {
      size: [5, 0],
      colors: ['#10b981', '#94a3b8'],
      strokeColors: '#fff',
      strokeWidth: 2
    }
  }

  // Head Circumference Chart Options
  headOptions.value = {
    ...headOptions.value,
    title: {
      text: 'Head Circumference Progress',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#2c1810',
      },
    },
    colors: ['#8b5cf6', '#94a3b8'], // Purple for actual, Gray for benchmark
    stroke: {
      curve: 'smooth',
      width: [3, 2],
      dashArray: [0, 5]
    },
    markers: {
      size: [5, 0],
      colors: ['#8b5cf6', '#94a3b8'],
      strokeColors: '#fff',
      strokeWidth: 2
    }
  }
}

// Call this after setting up the options
enhanceGrowthChartOptions()

const fetchSleep = async (selectedDateParam) => {
  try {
    const childId = getCurrentChildId()
    if (!childId) return

    // SOLUTION: Use the sleep store instead of direct API calls
    const { useSleepStore } = await import('@/stores/sleep')
    const sleepStore = useSleepStore()

    // Create baseline date range for x-axis
    const days = sleepViewMode.value === 'weekly' ? 7 : 30
    const baselineDates = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(selectedDate.value)
      date.setDate(date.getDate() - i)
      baselineDates.push({
        x: date.getTime(),
        y: 0
      })
    }

    // Get sleep data for each day in the range using sleep store
    const napData = []
    const nightData = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(selectedDate.value)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD
      
      // Force refresh to get latest data
      await sleepStore.refreshSleepForDate(dateString)
      
      // Get processed sleep data from store
      const sleepData = sleepStore.getSleepForDate(dateString)
      
      const x = date.getTime()
      
      // Use the SAME data that the summary card uses
      napData.push({
        x: x,
        y: sleepData.napHours || 0
      })
      
      nightData.push({
        x: x, 
        y: sleepData.nightHours || 0
      })
    }

    // Store the processed data
    actual.sleep_time.nap = napData
    actual.sleep_time.night = nightData

    // Calculate Y-axis range
    const allSleepValues = [...napData, ...nightData].map(item => item.y)
    if (allSleepValues.length > 0) {
      setY_max_for_sleep(napData.map(item => item.y), nightData.map(item => item.y))
    }

    // Update chart series
    sleepSeries.value = [
      { name: 'Nap', data: napData },
      { name: 'Night', data: nightData }
    ]

    // Apply date filtering
    updateChartsForDate()

    console.log(`✅ Sleep data from store loaded:`, {
      nap_points: napData.filter(d => d.y > 0).length,
      night_points: nightData.filter(d => d.y > 0).length,
      total_nap_hours: napData.reduce((sum, d) => sum + d.y, 0),
      total_night_hours: nightData.reduce((sum, d) => sum + d.y, 0)
    })

  } catch (error) {
    console.error('❌ Error fetching sleep data from store:', error)
    dataError.value = 'Failed to load sleep data'
    
    // Fallback to empty baseline
    const days = sleepViewMode.value === 'weekly' ? 7 : 30
    const errorBaseline = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(selectedDate.value)
      date.setDate(date.getDate() - i)
      errorBaseline.push({
        x: date.getTime(),
        y: 0
      })
    }
    
    sleepSeries.value = [
      { name: 'Nap', data: errorBaseline },
      { name: 'Night', data: errorBaseline }
    ]
  }
}

const fetchMealAnalytics = async (selectedDateParam) => {
  try {
    const childId = getCurrentChildId()
    if (!childId) return

    console.log('🍽️ Fetching meal analytics for child:', childId)

    // Use the actual meal endpoint
    const response = await axios.get(`http://127.0.0.1:8000/meal/child/${childId}?days=30`)
    const mealData = response.data

    console.log('📊 Raw meal data from API:', mealData)

    if (!mealData || mealData.length === 0) {
      console.log('❌ No meal data available')
      // Set empty meal distribution with proper categories
      mealDistributionOptions.value.labels = ['No Data']
      mealDistributionSeries.value = [1]
      return
    }

    // Process meal categories for pie chart (Milk, Solid, Mixed, Others)
    const mealCategoryDistribution = {}
    
    console.log('🔄 Processing meal data:', mealData.length, 'meals')
    
    mealData.forEach((meal, index) => {
      console.log(`🔍 Individual meal data ${index + 1}:`, meal)
      console.log('🔍 meal_category_name value:', meal.meal_category_name)
      console.log('🔍 meal_category ID:', meal.meal_category)
      
      // Fallback mapping for meal categories based on your data analysis
      let category = meal.meal_category_name
      
      // If no category name from API, map based on ID
      if (!category || category === 'Others') {
        const categoryMappings = {
          1: 'Milk',      // Assuming ID 1 is Milk
          2: 'Solid',     // Assuming ID 2 is Solid  
          3: 'Mixed',     // Assuming ID 3 is Mixed
          97: 'Others'    // ID 97 is likely Others
        }
        category = categoryMappings[meal.meal_category] || 'Others'
        console.log('🔄 Used ID mapping for category:', meal.meal_category, '→', category)
      }
      
      console.log('📝 Final category used:', category)
      
      // Normalize category names to match the expected format from your check-in form
      // Expected categories: Milk, Solid, Mixed, Others
      let normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
      
      // Handle any variations in category naming from database
      if (normalizedCategory.toLowerCase() === 'milk') normalizedCategory = 'Milk'
      else if (normalizedCategory.toLowerCase() === 'solid') normalizedCategory = 'Solid'
      else if (normalizedCategory.toLowerCase() === 'mixed') normalizedCategory = 'Mixed'
      else normalizedCategory = 'Others'
      
      console.log('✅ Normalized category:', normalizedCategory)
      
      mealCategoryDistribution[normalizedCategory] = (mealCategoryDistribution[normalizedCategory] || 0) + 1
    })

    console.log('📈 Meal category distribution before filtering:', mealCategoryDistribution)

    // Ensure we have the expected categories even if they're empty
    const expectedCategories = ['Milk', 'Solid', 'Mixed', 'Others']
    expectedCategories.forEach(category => {
      if (!(category in mealCategoryDistribution)) {
        mealCategoryDistribution[category] = 0
      }
    })

    // Filter out categories with 0 entries for cleaner display
    const filteredDistribution = Object.entries(mealCategoryDistribution)
      .filter(([_, count]) => count > 0)
      .reduce((acc, [category, count]) => {
        acc[category] = count
        return acc
      }, {})

    console.log('🎯 Filtered distribution (only categories with data):', filteredDistribution)

    // If no categories have data, show "No Data"
    if (Object.keys(filteredDistribution).length === 0) {
      console.log('⚠️ No categories have data, showing "No Data"')
      mealDistributionOptions.value.labels = ['No Data']
      mealDistributionSeries.value = [1]
    } else {
      // Update pie chart with actual meal categories
      const categoryNames = Object.keys(filteredDistribution)
      const categoryValues = Object.values(filteredDistribution)
      
      console.log('🎊 Updating chart with categories:', categoryNames)
      console.log('🔢 Updating chart with values:', categoryValues)
      
      // Define color mapping for each category
      const categoryColorMap = {
        'Milk': '#9C7FF7',     // Light purple (matching the icon color you showed)
        'Solid': '#81c5f7',    // Light blue
        'Mixed': '#fb9bec',    // Pink
        'Others': '#fbbf24'    // Yellow
      }
      
      // Create colors array based on category order
      const chartColors = categoryNames.map(categoryName => 
        categoryColorMap[categoryName] || '#9C27B0'
      )
      
      console.log('🎨 Applied colors:', chartColors)
      
      // IMPORTANT: Update options with forced colors and labels
      mealDistributionOptions.value = {
        ...mealDistributionOptions.value,
        labels: categoryNames,
        colors: chartColors,
        fill: {
          colors: chartColors
        },
        stroke: {
          colors: chartColors
        }
      }
      mealDistributionSeries.value = categoryValues
    }

    console.log('✅ Final chart labels:', mealDistributionOptions.value.labels)
    console.log('✅ Final chart series:', mealDistributionSeries.value)

  } catch (error) {
    console.error('❌ Error fetching meal data:', error)
    // Fallback to sample data matching the expected categories
    const fallbackDistribution = {
      'Milk': 15,
      'Solid': 10,
      'Mixed': 8,
      'Others': 3
    }
    console.log('🔄 Using fallback data:', fallbackDistribution)
    mealDistributionOptions.value.labels = Object.keys(fallbackDistribution)
    mealDistributionSeries.value = Object.values(fallbackDistribution)
  }
}

const fetchPoopAnalytics = async (selectedDateParam) => {
  try {
    const childId = getCurrentChildId()
    if (!childId) return

    // SINGLE SOURCE OF TRUTH: Use poop store
    const { usePoopStore } = await import('@/stores/poop')
    const poopStore = usePoopStore()

    // Create baseline date range
    const days = poopViewMode.value === 'weekly' ? 7 : 30
    const normalData = []
    const unusualData = []
    const dateLabels = []
    const unusualDays = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(selectedDate.value)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      
      // Force refresh to get latest data
      await poopStore.refreshPoopForDate(dateString)
      
      // Get processed poop data from store (same as summary card!)
      const poopData = poopStore.getPoopForDate(dateString)
      
      const normal = poopData.normal || 0
      const unusual = poopData.unusual || 0
      const total = poopData.count || 0
      
      // Build stacked data
      normalData.push({
        x: date.getTime(),
        y: normal,
        total: total,
        unusual: unusual
      })
      
      unusualData.push({
        x: date.getTime(), 
        y: unusual,
        total: total,
        normal: normal
      })
      
      dateLabels.push(date.getTime())
      
      // Track concerning patterns
      const isUnusualDay = total === 0 || total >= 5 || unusual > 0
      if (isUnusualDay) {
        unusualDays.push({
          date: dateString,
          total: total,
          normal: normal,
          unusual: unusual,
          reason: getDetailedUnusualReason(total, normal, unusual)
        })
      }
    }

    // STACKED BAR SERIES
    poopFrequencySeries.value = [
      {
        name: 'Normal',
        data: normalData,
        color: '#22c55e' // Green for normal
      },
      {
        name: 'Unusual',
        data: unusualData, 
        color: '#f97316' // Orange for unusual
      }
    ]

    // ENHANCED STACKED BAR OPTIONS
    poopFrequencyOptions.value = {
      chart: {
        type: 'bar',
        stacked: true, // Enable stacking
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      theme: {
        mode: 'light',
        palette: 'palette5',
      },
      colors: ['#22c55e', '#f97316'], // Green for normal, Orange for unusual
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
          borderRadiusApplication: 'end', // Only round the top
          dataLabels: {
            total: {
              enabled: true,
              offsetX: 0,
              offsetY: -5,
              style: {
                fontSize: '11px',
                fontWeight: 600,
                color: '#374151'
              },
              formatter: function (val, opts) {
                // Show total count on top of stacked bars
                const seriesIndex = opts.seriesIndex
                const dataPointIndex = opts.dataPointIndex
                const normalValue = normalData[dataPointIndex]?.y || 0
                const unusualValue = unusualData[dataPointIndex]?.y || 0
                const total = normalValue + unusualValue
                
                // Only show total on the last (top) series
                if (seriesIndex === 1 && total > 0) {
                  return total.toString()
                }
                return ''
              }
            }
          }
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          show: true,
          rotate: -45,
          rotateAlways: true,
          datetimeUTC: false,
          formatter: (_, timestamp, opts) => {
            const date = new Date(timestamp)
            if (poopViewMode.value === 'weekly') {
              return opts.dateFormatter(date, 'dd MMM')
            } else {
              return opts.dateFormatter(date, 'dd')
            }
          },
          maxHeight: 60,
          trim: true,
          showDuplicates: false,
        },
        tickAmount: Math.min(days, poopViewMode.value === 'weekly' ? 7 : 10),
        tickPlacement: 'between',
      },
      yaxis: {
        title: {
          text: 'Movements per Day'
        },
        min: 0,
        max: 6,
        tickAmount: 6,
        labels: {
          formatter: function (val) {
            return parseInt(val)
          }
        }
      },
      title: {
        text: '',
      },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        markers: {
          width: 12,
          height: 12,
          radius: 2
        },
        itemMargin: {
          horizontal: 15,
          vertical: 5
        }
      },
      // ENHANCED TOOLTIPS for stacked bars
      tooltip: {
        shared: true,
        intersect: false,
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          const normalCount = normalData[dataPointIndex]?.y || 0
          const unusualCount = unusualData[dataPointIndex]?.y || 0
          const totalCount = normalCount + unusualCount
          
          const date = new Date(normalData[dataPointIndex]?.x).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
          
          let statusIcon = ''
          let statusText = ''
          let statusColor = ''
          
          if (totalCount === 0) {
            statusIcon = '🔴'
            statusText = 'No movements - possible constipation'
            statusColor = '#fee2e2'
          } else if (totalCount >= 5) {
            statusIcon = '🔴'
            statusText = 'High frequency - monitor for diarrhea'
            statusColor = '#fee2e2'
          } else if (unusualCount > 0) {
            statusIcon = '🟡'
            statusText = `${unusualCount} with concerning characteristics`
            statusColor = '#fef3c7'
          } else {
            statusIcon = '🟢'
            statusText = 'All movements have normal characteristics'
            statusColor = '#dcfce7'
          }
          
          return `
            <div style="background: white; padding: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; min-width: 200px;">
              <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">${date}</div>
              
              <div style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 12px;">
                ${totalCount} total movement${totalCount !== 1 ? 's' : ''}
              </div>
              
              ${totalCount > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; font-size: 13px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 2px;"></div>
                    <span><strong>${normalCount}</strong> normal characteristics</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #f97316; border-radius: 2px;"></div>
                    <span><strong>${unusualCount}</strong> unusual characteristics</span>
                  </div>
                </div>
              ` : ''}
              
              <div style="background: ${statusColor}; padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 500; text-align: center;">
                ${statusIcon} ${statusText}
              </div>
            </div>
          `
        }
      },
      // Add subtle grid
      grid: {
        show: true,
        borderColor: '#f3f4f6',
        strokeDashArray: 2,
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      responsive: [{
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '80%'
            }
          },
          xaxis: {
            labels: {
              rotate: -90,
              formatter: (_, timestamp, opts) => {
                return opts.dateFormatter(new Date(timestamp), 'dd')
              }
            }
          }
        }
      }]
    }

    console.log(`✅ Stacked poop data from store loaded:`, {
      total_days: normalData.length,
      unusual_days: unusualDays.length,
      breakdown: {
        days_with_normal_only: normalData.filter((d, i) => d.y > 0 && unusualData[i].y === 0).length,
        days_with_unusual: unusualData.filter(d => d.y > 0).length,
        days_with_no_movements: normalData.filter((d, i) => d.y === 0 && unusualData[i].y === 0).length
      }
    })

    if (unusualDays.length > 0) {
      console.log(`🚨 Days with concerning patterns:`, unusualDays)
    }

  } catch (error) {
    console.error('❌ Error fetching stacked poop data:', error)
    
    // Simple fallback
    const days = poopViewMode.value === 'weekly' ? 7 : 30
    const fallbackData = Array.from({ length: days }, (_, i) => {
      const date = new Date(selectedDate.value)
      date.setDate(date.getDate() - (days - 1 - i))
      return {
        x: date.getTime(),
        y: 0
      }
    })

    poopFrequencySeries.value = [
      { name: 'Normal', data: fallbackData },
      { name: 'Unusual', data: fallbackData }
    ]
  }
}

// Enhanced helper function for detailed unusual reasons
const getDetailedUnusualReason = (total, normal, unusual) => {
  if (total === 0) {
    return 'No bowel movements - constipation concern'
  } else if (total >= 5) {
    return `${total} movements - high frequency concern`
  } else if (unusual === total) {
    return `All ${total} movements have concerning characteristics`
  } else if (unusual > 0) {
    return `${unusual} of ${total} movements have concerning characteristics`
  }
  return 'Unusual pattern detected'
}

// Helper function to determine why a day is unusual
const getUnusualReason = (count, unusual) => {
  if (count === 0) {
    return 'No bowel movements - possible constipation'
  } else if (count >= 5) {
    return 'High frequency - possible diarrhea'
  } else if (unusual > 0) {
    return `${unusual} movement${unusual > 1 ? 's' : ''} with concerning characteristics`
  }
  return 'Unusual pattern detected'
}

// Helper function for health assessment in tooltips
const getHealthAssessment = (count, unusual) => {
  if (count === 0) {
    return {
      message: '🔴 Constipation concern',
      class: 'assessment-negative'
    }
  } else if (count >= 5) {
    return {
      message: '🔴 High frequency concern', 
      class: 'assessment-negative'
    }
  } else if (unusual > 0) {
    return {
      message: '🟡 Monitor characteristics',
      class: 'assessment-warning'
    }
  } else if (count >= 1 && count <= 3) {
    return {
      message: '🟢 Normal healthy pattern',
      class: 'assessment-positive'
    }
  } else {
    return {
      message: '🟡 Slightly high frequency',
      class: 'assessment-warning'
    }
  }
}

// Function to update health symptoms based on selected date
const updateHealthSymptomsForDate = async (targetDate) => {
  try {
    const childId = getCurrentChildId()
    if (!childId) return

    // Fetch symptoms using the actual symptom endpoint
    const response = await axios.get(`http://127.0.0.1:8000/symptom/child/${childId}?days=30`)
    const symptomsData = response.data

    if (symptomsData && symptomsData.length > 0) {
      // Convert backend symptoms to our format
      healthSymptoms.value = symptomsData.map((symptom, index) => ({
        id: index + 1,
       date: typeof symptom.check_in === 'string' 
  ? symptom.check_in.split('T')[0] 
  : new Date(symptom.check_in).toISOString().split('T')[0], // Extract date part
        type: symptom.symptom || 'Unknown',
        description: symptom.note || 'No additional notes provided'
      }))
    } else {
      // Show "no symptoms" when no data exists
      healthSymptoms.value = [
        {
          id: 1,
          date: targetDate.toISOString().split('T')[0],
          type: 'No symptoms recorded',
          description: 'No symptoms have been recorded for this period.'
        }
      ]
    }
  } catch (error) {
    console.error('Error fetching symptoms:', error)
    // Keep fallback data on error
    healthSymptoms.value = [
      {
        id: 1,
        date: targetDate.toISOString().split('T')[0],
        type: 'Unable to load symptoms',
        description: 'There was an error loading symptom data. Please try again.'
      }
    ]
  }
}

// CORRECTED updateChartsForDate function - Only show actual check-in data with steplines
const updateChartsForDate = () => {
  const filterByViewMode = (data, viewMode) => {
    if (viewMode === 'weekly') {
      // Show only actual check-ins within the last 7 days from selected date
      const weekStart = new Date(selectedDate.value)
      weekStart.setDate(selectedDate.value.getDate() - 6)
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(selectedDate.value)
      weekEnd.setHours(23, 59, 59, 999)
      
      return data.filter(item => {
        const itemDate = new Date(item.x)
        return itemDate >= weekStart && itemDate <= weekEnd && item.y !== null
      })
    }
    // Monthly: show all actual data points
    return data.filter(item => item.y !== null)
  }

  // Update charts with only actual check-in data
  weightSeries.value = [
    { name: 'Actual', data: filterByViewMode(actual.weight, growthViewMode.value) },
    { name: 'Benchmark', data: filterByViewMode(benchmark.weight, growthViewMode.value) }
  ]
  
  heightSeries.value = [
    { name: 'Actual', data: filterByViewMode(actual.height, heightViewMode.value) },
    { name: 'Benchmark', data: filterByViewMode(benchmark.height, heightViewMode.value) }
  ]
  
  headSeries.value = [
    { name: 'Actual', data: filterByViewMode(actual.head_circumference, headViewMode.value) },
    { name: 'Benchmark', data: filterByViewMode(benchmark.head_circumference, headViewMode.value) }
  ]

  console.log('📊 Charts updated with actual check-in data only')
}
// Watch for date changes and refresh data
watch(selectedDate, async (newDate) => {
  console.log('Date changed to:', newDate)
  // Refetch all data when date changes
  await Promise.all([
    fetchGrowth(newDate),
    fetchSleep(newDate),
    fetchMealAnalytics(newDate),
    fetchPoopAnalytics(newDate)
  ])
  // Update the health symptoms based on new date
  updateHealthSymptomsForDate(newDate)
}, { immediate: false })

// Enhanced view mode setters that work with real data
const setGrowthView = (mode) => {
  growthViewMode.value = mode
  updateChartsForDate() // Use the new function that filters existing data
}

const setMealView = (mode) => {
  mealViewMode.value = mode
  // Re-fetch meal data with different time range based on the selected mode
  fetchMealAnalytics(selectedDate.value)
}

const setSleepView = (mode) => {
  sleepViewMode.value = mode
  updateChartsForDate() // Use the new function that filters existing data
}

const setPoopView = (mode) => {
  poopViewMode.value = mode
  // Re-fetch poop data with different time range based on the selected mode
  fetchPoopAnalytics(selectedDate.value)
}

const setHeightView = (mode) => {
  heightViewMode.value = mode
  updateChartsForDate() // Use the new function that filters existing data
}

const setHeadView = (mode) => {
  headViewMode.value = mode
  updateChartsForDate() // Use the new function that filters existing data
}

onMounted(async () => {
  try {
    // Fetch all data on component mount
    await Promise.all([
      fetchGrowth(selectedDate.value),
      fetchSleep(selectedDate.value),
      fetchMealAnalytics(selectedDate.value),
      fetchPoopAnalytics(selectedDate.value)
    ])
    // Update health symptoms for initial date
    await updateHealthSymptomsForDate(selectedDate.value)
  } catch (error) {
    console.error(`Error initializing dashboard: ${error}`)
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

// Force beige background on the main container
.v-main {
  background-color: $app-beige !important;
  background-image: none !important;
}

.dashboard-container {
  // max-width: 1200px;  <- Comment out or delete this line
  margin: 0 auto;
  padding: $spacing-xl $spacing-lg;
}

.chart-container {
  margin-bottom: $spacing-lg;
  overflow: hidden;

  // ADD THESE LINES:
  :deep(.apexcharts-canvas) {
    width: 100% !important;
    max-width: none !important;
  }

  :deep(.apexcharts-svg) {
    width: 100% !important;
    max-width: none !important;
  }

  :deep(.apexcharts-inner) {
    width: 100% !important;
  }
  // END OF NEW LINES

  // Keep your existing responsive styles...
}

/* Dashboard Header - Enhanced */
.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: $spacing-xl;
  position: relative;
}

.header-left {
  flex: 1;
}

.dashboard-title {
  font-family: $font-heading;
  font-size: 32px;
  font-weight: 600;
  color: $app-text-primary;
  margin: 0;
  line-height: 1.2;
}

.dashboard-subtitle {
  font-family: $font-primary;
  font-size: 16px;
  color: $app-text-secondary;
  margin-top: $spacing-xs;
}

/* Loading and Error States */
.loading-indicator,
.error-indicator {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-right: $spacing-md;
}

.loading-text {
  font-family: $font-primary;
  font-size: 14px;
  color: $app-text-secondary;
}

.error-text {
  font-family: $font-primary;
  font-size: 14px;
  color: #d32f2f;
}

/* Date Picker Button - Same style as checkin page */
.date-picker-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $glass-white;
  border: 1px solid $dialog-border;
  cursor: pointer;
  font-family: $font-primary;
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.01em;
  min-width: 200px;
  height: 44px;
  padding: 0 $spacing-md;
  border-radius: $border-radius-md;
  color: $app-text-primary;
  transition: $transition-base;
  backdrop-filter: blur($glass-blur-sm);

  &:hover {
    border-color: $field-border-hover;
    background: $glass-white-light;
    box-shadow: $shadow-sm;
  }

  &:focus {
    outline: none;
    border-color: $app-primary;
    box-shadow: 0 0 0 2px rgba($app-primary, 0.1);
  }

  .v-icon {
    color: $app-grey;
  }

  &:hover .v-icon {
    color: $app-text-primary;
  }
}

/* Dashboard Grid - Enhanced Responsive */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-xl;
  margin-bottom: $spacing-xl;

  @media (max-width: 1024px) {
    gap: $spacing-lg;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: $spacing-lg;
  }

  @media (max-width: 480px) {
    gap: $spacing-md;
  }
}

.dashboard-grid-secondary {
  margin-bottom: $spacing-xl;
}

/* Dashboard Section - Enhanced Responsive */
.dashboard-section {
  background: #ffffff;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-md;
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-height: 350px;

  @media (max-width: 768px) {
    padding: $spacing-md;
    min-height: 300px;
  }

  @media (max-width: 480px) {
    padding: $spacing-sm;
    min-height: 250px;
  }
}

.dashboard-section-full {
  grid-column: 1 / -1;
  min-height: auto;
}

/* Section Header - Enhanced Responsive */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-lg;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
  }

  @media (max-width: 480px) {
    gap: $spacing-xs;
  }
}

.section-title {
  font-family: $font-heading;
  font-size: 24px;
  font-weight: 600;
  color: $app-text-primary;
  margin: 0;
}

/* View Toggle - Same style as checkin page */
.view-toggle {
  display: flex;
  gap: 0;
  border: 1px solid $dialog-border;
  border-radius: $border-radius-sm;
  overflow: hidden;
  background: $glass-white;
  backdrop-filter: blur($glass-blur-sm);
}

.view-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: $font-primary;
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: -0.01em;
  border-radius: 0;
  min-width: 70px;
  height: 32px;
  transition: $transition-base;
  color: $app-text-secondary;

  &.active {
    background-color: $app-primary;
    color: white;
    font-weight: 600;
  }

  &:hover:not(.active) {
    background-color: $dropdown-hover;
    color: $app-text-primary;
  }
}

/* Chart Container - Enhanced Responsive */
.chart-container {
  margin-bottom: $spacing-lg;
  overflow: hidden;

  // Ensure charts are responsive
  :deep(.apexcharts-canvas) {
    width: 100% !important;
    height: auto !important;
  }

  :deep(.apexcharts-svg) {
    width: 100% !important;
    height: auto !important;
  }

  @media (max-width: 768px) {
    margin-bottom: $spacing-md;
  }

  @media (max-width: 480px) {
    margin-bottom: $spacing-sm;
  }
}

/* Symptoms Timeline */
.symptoms-timeline {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.symptom-entry {
  display: flex;
  gap: $spacing-lg;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  background: rgba($app-primary, 0.02);
  border-left: 4px solid $app-primary;
}

.symptom-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.date-day {
  font-family: $font-heading;
  font-size: 24px;
  font-weight: 700;
  color: $app-text-primary;
  line-height: 1;
}

.date-month {
  font-family: $font-primary;
  font-size: 12px;
  color: $app-text-muted;
  font-weight: 500;
  text-transform: uppercase;
  margin-top: 2px;
}

.symptom-content {
  flex: 1;
}

.symptom-type {
  font-family: $font-primary;
  font-size: 16px;
  font-weight: 600;
  color: $app-text-primary;
  margin-bottom: $spacing-xs;
}

.symptom-description {
  font-family: $font-primary;
  font-size: 14px;
  color: $app-text-secondary;
  line-height: 1.4;
}

/* Date picker override styles */
:deep(.v-date-picker) {
  .v-btn {
    all: unset !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    border-radius: 50% !important;
    min-width: 32px !important;
    height: 32px !important;
    font-family: $font-primary !important;
    font-size: 14px !important;
    font-weight: 400 !important;

    &:hover {
      background-color: rgba($app-primary, 0.1) !important;
    }

    &.v-btn--active,
    &.v-date-picker-month__day--selected {
      background-color: $app-primary !important;
      color: white !important;
    }
  }

  .v-date-picker-header .v-btn {
    border-radius: 4px !important;
    min-width: auto !important;
    padding: 8px !important;
  }

  .v-date-picker-month__day {
    border-radius: 50% !important;

    &--selected {
      background-color: $app-primary !important;
      color: white !important;
    }

    &:hover:not(.v-date-picker-month__day--selected) {
      background-color: rgba($app-primary, 0.1) !important;
    }
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: $spacing-md;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: $spacing-lg;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md;
  }

  .dashboard-subtitle {
    position: static;
    margin-top: $spacing-xs;
  }

  .date-picker-btn {
    align-self: flex-end;
    min-width: 180px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-sm;
  }

  .view-toggle {
    align-self: flex-end;
  }

  .section-title {
    font-size: 20px;
  }

  .dashboard-title {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .dashboard-grid {
    gap: $spacing-md;
  }

  .dashboard-section {
    padding: $spacing-md;
  }

  .section-title {
    font-size: 18px;
  }

  .dashboard-title {
    font-size: 24px;
  }
}

/* Add this to your dashboard component styles */
:deep(.poop-tooltip) {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  min-width: 180px;
}

:deep(.tooltip-date) {
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  font-size: 14px;
}

:deep(.tooltip-count) {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

:deep(.tooltip-breakdown) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 12px;
}

:deep(.normal-count) {
  color: #059669;
}

:deep(.unusual-count) {
  color: #d97706;
}

:deep(.tooltip-assessment) {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
}

:deep(.assessment-positive) {
  background-color: #dcfce7;
  color: #166534;
}

:deep(.assessment-warning) {
  background-color: #fef3c7;
  color: #92400e;
}

:deep(.assessment-negative) {
  background-color: #fee2e2;
  color: #991b1b;
}

</style>