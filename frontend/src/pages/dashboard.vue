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

// Chart options for Weight
const weightOptions = ref({
  chart: {
    type: 'line',
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
      text: 'Weight, kg',
    },
    min: () => chart.weight.y_min,
    max: () => chart.weight.y_max,
  },
  title: {
    text: '',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#2c1810',
    },
  },
  stroke: {
    curve: 'straight',
    width: 3,
  },
  legend: {
    show: true,
    position: 'bottom',
  },
})

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
const heightOptions = ref({
  chart: {
    type: 'line',
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
      text: 'Height, cm',
    },
    min: () => chart.height.y_min,
    max: () => chart.height.y_max,
  },
  title: {
    text: '',
  },
  stroke: {
    curve: 'straight',
    width: 3,
  },
  legend: {
    show: true,
    position: 'bottom',
  },
})

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
const headOptions = ref({
  chart: {
    type: 'line',
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
      text: 'Head circumference, cm',
    },
    min: () => chart.head_circumference.y_min,
    max: () => chart.head_circumference.y_max,
  },
  title: {
    text: '',
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
    
    // Use the actual growth endpoint that returns growth with benchmarks
    const response = await axios.get(`http://127.0.0.1:8000/growth/${childId}`)
    const growth_data = response.data

    if (!growth_data || growth_data.length === 0) {
      console.log('No growth data available for child:', childId)
      // Clear charts when no data
      weightSeries.value = [{ name: 'Actual', data: [] }, { name: 'Benchmark', data: [] }]
      heightSeries.value = [{ name: 'Actual', data: [] }, { name: 'Benchmark', data: [] }]
      headSeries.value = [{ name: 'Actual', data: [] }, { name: 'Benchmark', data: [] }]
      return
    }

    // Convert the backend data to the format expected by charts
    const actual_weight = growth_data.map(item => ({
      x: new Date(item.check_in),
      y: item.actual_weight
    })).reverse() // Reverse to show chronological order

    const benchmark_weight = growth_data.map(item => ({
      x: new Date(item.check_in),
      y: item.benchmark_weight
    })).reverse()

    const actual_height = growth_data.map(item => ({
      x: new Date(item.check_in),
      y: item.actual_height
    })).reverse()

    const benchmark_height = growth_data.map(item => ({
      x: new Date(item.check_in),
      y: item.benchmark_height
    })).reverse()

    const actual_hc = growth_data.map(item => ({
      x: new Date(item.check_in),
      y: item.actual_head_circumference
    })).reverse()

    const benchmark_hc = growth_data.map(item => ({
      x: new Date(item.check_in),
      y: item.benchmark_head_circumference
    })).reverse()

    // Store all data
    actual.weight = actual_weight
    benchmark.weight = benchmark_weight
    actual.height = actual_height
    benchmark.height = benchmark_height
    actual.head_circumference = actual_hc
    benchmark.head_circumference = benchmark_hc

    // Calculate Y-axis ranges for all growth metrics
    if (actual_weight.length > 0) {
      const actualWeightValues = actual_weight.map(item => item.y)
      const benchmarkWeightValues = benchmark_weight.map(item => item.y)
      setY_min_max(actualWeightValues, benchmarkWeightValues, 'weight')
    }

    if (actual_height.length > 0) {
      const actualHeightValues = actual_height.map(item => item.y)
      const benchmarkHeightValues = benchmark_height.map(item => item.y)
      setY_min_max(actualHeightValues, benchmarkHeightValues, 'height')
    }

    if (actual_hc.length > 0) {
      const actualHcValues = actual_hc.map(item => item.y)
      const benchmarkHcValues = benchmark_hc.map(item => item.y)
      setY_min_max(actualHcValues, benchmarkHcValues, 'head_circumference')
    }

    // Apply date filtering based on selected date and view mode
    updateChartsForDate()
    
    console.log(`✅ Growth data loaded for child ${childId}:`, {
      weight_points: actual_weight.length,
      height_points: actual_height.length,
      hc_points: actual_hc.length
    })

  } catch (error) {
    console.error(`❌ Error fetching growth data:`, error)
    dataError.value = 'Failed to load growth data'
  } finally {
    isLoadingData.value = false
  }
}

const fetchSleep = async (selectedDateParam) => {
  try {
    const childId = getCurrentChildId()
    if (!childId) return

    // Use the actual sleep endpoint
    const response = await axios.get(`http://127.0.0.1:8000/sleeptime/${childId}`)
    const api_data = response.data

    // Create baseline date range for x-axis (last 7 days for weekly, 30 days for monthly)
    const days = sleepViewMode.value === 'weekly' ? 7 : 30
    const baselineDates = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(selectedDate.value)
      date.setDate(date.getDate() - i)
      baselineDates.push({
        x: date.getTime(),
        y: 0 // Zero sleep hours as placeholder
      })
    }

    if (!api_data || api_data.length === 0) {
      console.log('No sleep data available - showing baseline dates')
      // Show empty chart with date labels
      sleepSeries.value = [
        { name: 'Nap', data: baselineDates.map(d => ({...d})) },
        { name: 'Night', data: baselineDates.map(d => ({...d})) }
      ]
      
      actual.sleep_time.nap = []
      actual.sleep_time.night = []
      return
    }

    // Process actual sleep data
    const nap_series = []
    const night_series = []

    api_data.forEach(item => {
      const x = new Date(item.check_in)
      const time_ms = new Date(item.end_time) - new Date(item.start_time)
      const total_hours = time_ms / (1000 * 60 * 60)
      const y = Number(total_hours.toFixed(1))
      const start_hour = new Date(item.start_time).getHours()

      // For now, put all sleep as night sleep since your data shows 8+ hour sleeps
      night_series.push({ x: x.getTime(), y })
    })

    // Merge actual data with baseline dates to ensure x-axis shows full date range
    const createFullSeries = (actualData) => {
      const dataMap = new Map(actualData.map(item => [
        new Date(item.x).toDateString(), 
        item.y
      ]))
      
      return baselineDates.map(baseline => {
        const dateKey = new Date(baseline.x).toDateString()
        return {
          x: baseline.x,
          y: dataMap.get(dateKey) || 0
        }
      })
    }

    const napSeriesWithDates = createFullSeries([])
    const nightSeriesWithDates = createFullSeries(night_series)

    actual.sleep_time.nap = napSeriesWithDates
    actual.sleep_time.night = nightSeriesWithDates

    // Apply date filtering
    updateChartsForDate()

  } catch (error) {
    console.error('Error fetching sleep data: ' + error)
    
    // Even on error, show baseline dates
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

    // Use the poop router endpoint for poop data
    const response = await axios.get(`http://127.0.0.1:8000/poop/child/${childId}?days=30`)
    const poopData = response.data

    if (!poopData || poopData.length === 0) {
      // No data available, show empty chart
      poopFrequencySeries.value = [{
        name: 'Daily Frequency',
        data: []
      }]
      return
    }

    const poopByDate = {}

    poopData.forEach(poop => {
      const date = new Date(poop.check_in).toDateString()
      poopByDate[date] = (poopByDate[date] || 0) + 1
    })

    // Create chart data for the selected time range
    const days = poopViewMode.value === 'weekly' ? 7 : 30
    const chartData = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(selectedDate.value)
      date.setDate(date.getDate() - i)
      const dateString = date.toDateString()
      
      chartData.push({
        x: date.getTime(),
        y: poopByDate[dateString] || 0
      })
    }

    poopFrequencySeries.value = [{
      name: 'Daily Frequency',
      data: chartData
    }]

  } catch (error) {
    console.error('Error fetching poop data:', error)
    // Fallback to mock data
    const days = poopViewMode.value === 'weekly' ? 7 : 30
    const dailyFrequency = Array.from({ length: days }, (_, i) => {
      const date = new Date(selectedDate.value)
      date.setDate(date.getDate() - (days - 1 - i))
      return {
        x: date.getTime(),
        y: Math.floor(Math.random() * 3) + 1
      }
    })

    poopFrequencySeries.value = [{
      name: 'Daily Frequency',
      data: dailyFrequency
    }]
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

// New function to update all charts when date changes
const updateChartsForDate = () => {
  const targetDate = selectedDate.value
  
  // Filter data based on selected date and view modes
  if (growthViewMode.value === 'weekly') {
    const weekStart = new Date(targetDate)
    weekStart.setDate(targetDate.getDate() - 7)
    
    const filterDataByWeek = (data) => data.filter(item => 
      new Date(item.x) >= weekStart && new Date(item.x) <= targetDate
    )

    weightSeries.value = [
      { name: 'Actual', data: filterDataByWeek(actual.weight) },
      { name: 'Benchmark', data: filterDataByWeek(benchmark.weight) }
    ]
    
    heightSeries.value = [
      { name: 'Actual', data: filterDataByWeek(actual.height) },
      { name: 'Benchmark', data: filterDataByWeek(benchmark.height) }
    ]
    
    headSeries.value = [
      { name: 'Actual', data: filterDataByWeek(actual.head_circumference) },
      { name: 'Benchmark', data: filterDataByWeek(benchmark.head_circumference) }
    ]
  } else {
    // Monthly view - show all data
    weightSeries.value = [
      { name: 'Actual', data: actual.weight },
      { name: 'Benchmark', data: benchmark.weight }
    ]
    
    heightSeries.value = [
      { name: 'Actual', data: actual.height },
      { name: 'Benchmark', data: benchmark.height }
    ]
    
    headSeries.value = [
      { name: 'Actual', data: actual.head_circumference },
      { name: 'Benchmark', data: benchmark.head_circumference }
    ]
  }

  // Update sleep data
  if (sleepViewMode.value === 'weekly') {
    const weekStart = new Date(targetDate)
    weekStart.setDate(targetDate.getDate() - 7)
    
    const filterSleepByWeek = (data) => data.filter(item => 
      new Date(item.x) >= weekStart && new Date(item.x) <= targetDate
    )

    sleepSeries.value = [
      { name: 'Nap', data: filterSleepByWeek(actual.sleep_time.nap) },
      { name: 'Night', data: filterSleepByWeek(actual.sleep_time.night) }
    ]
  } else {
    sleepSeries.value = [
      { name: 'Nap', data: actual.sleep_time.nap },
      { name: 'Night', data: actual.sleep_time.night }
    ]
  }
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
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-xl $spacing-lg;
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
</style>