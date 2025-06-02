<!-- HistoricalOverview.vue -->
<template>
  <div class="historical-overview mb-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h6">Historical Overview</h2>
      
      <!-- Time range selector -->
      <v-btn-group rounded="pill" variant="outlined" density="comfortable">
        <v-btn 
          v-for="range in timeRanges" 
          :key="range.value"
          :color="selectedRange === range.value ? 'primary' : undefined"
          :variant="selectedRange === range.value ? 'tonal' : 'outlined'"
          @click="handleRangeChange(range.value)"
        >
          {{ range.label }}
        </v-btn>
      </v-btn-group>
    </div>

    <!-- Graphs grid -->
    <v-row>
      <v-col v-for="metric in metrics" :key="metric.id" cols="12" md="4">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-subtitle-1 font-weight-medium">{{ metric.title }}</span>
              <v-chip
                size="small"
                :color="getTrendColor(metric)"
                variant="tonal"
              >
                <v-icon
                  size="small"
                  :icon="getTrendIcon(metric)"
                  start
                  class="mr-1"
                ></v-icon>
                {{ getTrendLabel(metric) }}
              </v-chip>
            </div>
            
            <!-- Enhanced graph visualization -->
            <div class="graph-container" :style="{ '--graph-color': metric.color }">
              <!-- Y-axis labels -->
              <div class="y-axis">
                <span>{{ metric.valueRange.max }}{{ metric.unit }}</span>
                <span>{{ ((metric.valueRange.max + metric.valueRange.min) / 2).toFixed(1) }}{{ metric.unit }}</span>
                <span>{{ metric.valueRange.min }}{{ metric.unit }}</span>
              </div>

              <!-- Graph area -->
              <div class="graph-area">
                <!-- Grid lines -->
                <div class="grid-lines">
                  <div v-for="n in 5" :key="`grid-${n}`" class="grid-line"></div>
                </div>

                <!-- Data visualization -->
                <div class="data-visualization">
                  <!-- Lines connecting points -->
                  <svg class="graph-lines" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path
                      :d="getPathD(metric.id)"
                      :stroke="metric.color"
                      fill="none"
                    />
                    <!-- Area under the line -->
                    <path
                      :d="`${getPathD(metric.id)} L 100 100 L 0 100 Z`"
                      :fill="metric.color"
                      opacity="0.1"
                    />
                  </svg>

                  <!-- Data points -->
                  <div 
                    v-for="(point, index) in getDataPoints(metric.id)" 
                    :key="index"
                    class="data-point"
                    :style="{
                      '--x': `${(index / (getDataPoints(metric.id).length - 1)) * 100}%`,
                      '--y': `${getYPosition(point.value, metric)}%`
                    }"
                  >
                    <v-tooltip location="top">
                      <template v-slot:activator="{ props }">
                        <div class="point-dot" v-bind="props"></div>
                      </template>
                      {{ formatTooltip(point, metric) }}
                    </v-tooltip>
                  </div>
                </div>

                <!-- X-axis dates -->
                <div class="x-axis">
                  <span 
                    v-for="(point, index) in getDataPoints(metric.id)" 
                    :key="index"
                    :style="{ '--x': `${(index / (getDataPoints(metric.id).length - 1)) * 100}%` }"
                  >
                    {{ formatDate(point.date) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="text-caption text-medium-emphasis mt-2">
              {{ metric.summary }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHistoricalStore } from '../stores/historicalStore'

const selectedRange = ref('1w')
const historicalStore = useHistoricalStore()
const { historicalData, trends } = storeToRefs(historicalStore)

const timeRanges = [
  { label: '1W', value: '1w' },
  { label: '2W', value: '2w' },
  { label: '1M', value: '1m' }
]

const metrics = [
  {
    id: 'sleep',
    title: 'Sleep Pattern',
    color: '#7E57C2',
    summary: 'Sleep duration trend over the selected period',
    valueRange: { min: 6, max: 12 },
    unit: 'h'
  },
  {
    id: 'meals',
    title: 'Meal Completion',
    color: '#26A69A',
    summary: 'Percentage of meals completed as planned',
    valueRange: { min: 60, max: 100 },
    unit: '%'
  },
  {
    id: 'health',
    title: 'Health Status',
    color: '#EF5350',
    summary: 'Overall health status indicators',
    valueRange: { min: 0, max: 2 },
    unit: ''
  },
//   {
//     id: 'activities',
//     title: 'Daily Activities',
//     color: '#FFA726',
//     summary: 'Engagement in planned activities',
//     valueRange: { min: 40, max: 100 },
//     unit: '%'
//   }
]

// Handle range change
const handleRangeChange = (range) => {
  selectedRange.value = range
  historicalStore.fetchDataForRange(range)
}

// Get data points for a metric
const getDataPoints = (metricId) => {
  return historicalData.value[metricId] || []
}

// Calculate Y position for graph point (inverted percentage)
const getYPosition = (value, metric) => {
  const { min, max } = metric.valueRange
  return 100 - ((value - min) / (max - min) * 100)
}

// Get trend information
const getTrendIcon = (metric) => {
  const trend = trends.value[metric.id]
  return trend.direction === 'up' ? 'mdi-trending-up' 
       : trend.direction === 'down' ? 'mdi-trending-down' 
       : 'mdi-trending-neutral'
}

const getTrendColor = (metric) => {
  const trend = trends.value[metric.id]
  if (metric.id === 'health') {
    return trend.value < 1 ? 'success' : trend.value < 1.5 ? 'warning' : 'error'
  }
  return trend.direction === 'up' ? 'success' 
       : trend.direction === 'down' ? 'error' 
       : 'info'
}

const getTrendLabel = (metric) => {
  const trend = trends.value[metric.id]
  if (metric.id === 'health') {
    return trend.value < 1 ? 'All good' 
         : trend.value < 1.5 ? 'Minor issues' 
         : 'Needs attention'
  }
  return trend.direction === 'neutral' ? `${trend.value}% avg`
       : `${trend.direction === 'up' ? '+' : '-'}${trend.value}${metric.id === 'sleep' ? 'hrs' : '%'}`
}

// Format date for x-axis
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

// Format tooltip content
const formatTooltip = (point, metric) => {
  const date = new Date(point.date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
  return `${point.value}${metric.unit} on ${date}`
}

// Generate SVG path for the line
const getPathD = (metricId) => {
  const points = getDataPoints(metricId)
  if (!points.length) return ''

  return points.map((point, index) => {
    const x = (index / (points.length - 1)) * 100
    const y = getYPosition(point.value, metrics.find(m => m.id === metricId))
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
}

// Initialize data
onMounted(() => {
  historicalStore.fetchDataForRange(selectedRange.value)
})
</script>

<style scoped>
.graph-container {
  height: 250px;
  position: relative;
  margin: 1rem 0;
  display: flex;
  gap: 12px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.75rem;
  width: 40px;
}

.graph-area {
  flex: 1;
  position: relative;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  padding: 10px 0;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-line {
  height: 1px;
  width: 100%;
  background: rgba(0, 0, 0, 0.04);
}

.data-visualization {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  bottom: 25px;
}

.graph-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  path {
    stroke-width: 2;
    transition: all 0.3s ease;
  }
}

.data-point {
  position: absolute;
  left: var(--x);
  top: var(--y);
  transform: translate(-50%, -50%);
  z-index: 2;
}

.point-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--graph-color);
  border: 2px solid white;
  box-shadow: 0 0 0 1px var(--graph-color);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.5);
  }
}

.x-axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.75rem;

  span {
    position: absolute;
    transform: translateX(-50%);
    left: var(--x);
  }
}

.v-btn-group .v-btn {
  text-transform: none;
  font-weight: 500;
}

.v-card-text {
  padding: 24px;
}

.v-card {
  height: 100%;
}
</style> 