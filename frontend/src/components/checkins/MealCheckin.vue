<template>
  <v-dialog
    v-model="isOpen"
    max-width="500px"
    persistent
  >
    <v-card class="checkin-dialog">
      <!-- Header -->
      <v-card-title class="dialog-header">
        <div class="header-content">
          <div class="header-left">
            <v-icon class="header-icon" size="20">mdi-silverware-fork-knife</v-icon>
            <span class="dialog-title">Log Meal</span>
          </div>
          <v-btn
            icon
            variant="text"
            size="small"
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p class="dialog-subtitle">What did Jennie eat?</p>
      </v-card-title>

      <v-card-text class="dialog-content">
        <!-- Meal Time -->
        <div class="form-section">
          <label class="section-label">Meal Time</label>
          <div class="button-group">
            <button
              v-for="time in mealTimes"
              :key="time.value"
              :class="['option-btn', { 'active': selectedMealTime === time.value }]"
              @click="selectedMealTime = time.value"
            >
              <v-icon size="16" class="btn-icon">{{ time.icon }}</v-icon>
              {{ time.label }}
            </button>
          </div>
        </div>

        <!-- Consumption Level -->
        <div class="form-section">
          <label class="section-label">Consumption Level</label>
          <v-select
            v-model="selectedConsumption"
            :items="consumptionLevels"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            hide-details
            class="consumption-select"
          >
          </v-select>
        </div>

        <!-- Meal Category -->
        <div class="form-section">
          <label class="section-label">Meal Category</label>
          <div class="button-group">
            <button
              v-for="category in mealCategories"
              :key="category.value"
              :class="['option-btn', { 'active': selectedCategories.includes(category.value) }]"
              @click="toggleCategory(category.value)"
            >
              <v-icon size="16" class="btn-icon">{{ category.icon }}</v-icon>
              {{ category.label }}
            </button>
          </div>
          
          <!-- Additional category buttons for subcategories -->
          <div v-if="selectedCategories.includes('milk')" class="button-group mt-3">
            <button
              v-for="subcat in milkSubcategories"
              :key="subcat.value"
              :class="['option-btn', 'subcategory', { 'active': selectedSubcategories.includes(subcat.value) }]"
              @click="toggleSubcategory(subcat.value)"
            >
              {{ subcat.label }}
            </button>
          </div>
        </div>

        <!-- Remarks/Notes -->
        <div class="form-section">
          <label class="section-label">Remarks/Notes</label>
          <v-textarea
            v-model="remarks"
            placeholder="Type details here"
            variant="outlined"
            rows="3"
            hide-details
            class="remarks-textarea"
          />
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn
          color="primary"
          class="save-btn"
          @click="saveMeal"
        >
          <v-icon start>mdi-content-save</v-icon>
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// Dialog state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Form data
const selectedMealTime = ref('breakfast')
const selectedConsumption = ref('0% (Refused)')
const selectedCategories = ref([])
const selectedSubcategories = ref([])
const remarks = ref('')

// Options
const mealTimes = [
  { value: 'breakfast', label: 'Breakfast', icon: 'mdi-weather-sunny' },
  { value: 'lunch', label: 'Lunch', icon: 'mdi-weather-partly-cloudy' },
  { value: 'dinner', label: 'Dinner', icon: 'mdi-weather-night' }
]

const consumptionLevels = [
  { value: '0% (Refused)', label: '0% (Refused)' },
  { value: '25% (Partial)', label: '25% (Partial)' },
  { value: '50% (Partial)', label: '50% (Partial)' },
  { value: '75% (Partial)', label: '75% (Partial)' },
  { value: '100% (Full)', label: '100% (Full)' }
]

const mealCategories = [
  { value: 'milk', label: 'Milk', icon: 'mdi-cup' },
  { value: 'solid', label: 'Solid', icon: 'mdi-food-apple' },
  { value: 'mixed', label: 'Mixed', icon: 'mdi-bowl-mix' },
  { value: 'others', label: 'Others', icon: 'mdi-dots-horizontal' }
]

const milkSubcategories = [
  { value: 'breast-milk', label: 'Breast Milk' },
  { value: 'formula', label: 'Formula' }
]

// Methods
const toggleCategory = (category) => {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
    // Clear subcategories if parent category is deselected
    if (category === 'milk') {
      selectedSubcategories.value = []
    }
  } else {
    selectedCategories.value.push(category)
  }
}

const toggleSubcategory = (subcategory) => {
  const index = selectedSubcategories.value.indexOf(subcategory)
  if (index > -1) {
    selectedSubcategories.value.splice(index, 1)
  } else {
    selectedSubcategories.value.push(subcategory)
  }
}

const closeDialog = () => {
  isOpen.value = false
}

const saveMeal = () => {
  const mealData = {
    type: 'meal',
    mealTime: selectedMealTime.value,
    consumption: selectedConsumption.value,
    categories: selectedCategories.value,
    subcategories: selectedSubcategories.value,
    remarks: remarks.value,
    timestamp: new Date()
  }
  
  emit('save', mealData)
  closeDialog()
  
  // Reset form
  selectedMealTime.value = 'breakfast'
  selectedConsumption.value = '0% (Refused)'
  selectedCategories.value = []
  selectedSubcategories.value = []
  remarks.value = ''
}
</script>

<style lang="scss" scoped>
.checkin-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  padding: 24px 24px 16px 24px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  color: #666;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.dialog-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-weight: 400;
}

.dialog-content {
  padding: 24px;
  background: white;
}

.form-section {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #ccc;
    background: #f9f9f9;
  }
  
  &.active {
    background: #333;
    color: white;
    border-color: #333;
  }
  
  &.subcategory {
    background: #f5f5f5;
    border-color: #d0d0d0;
    
    &.active {
      background: #555;
      border-color: #555;
    }
  }
}

.btn-icon {
  color: inherit;
}

.consumption-select {
  :deep(.v-field) {
    border-radius: 8px;
  }
  
  :deep(.v-field__input) {
    font-size: 14px;
    color: #333;
  }
}

.remarks-textarea {
  :deep(.v-field) {
    border-radius: 8px;
  }
  
  :deep(.v-field__input) {
    font-size: 14px;
    color: #333;
  }
  
  :deep(.v-field__field) {
    textarea {
      &::placeholder {
        color: #999;
      }
    }
  }
}

.dialog-actions {
  padding: 16px 24px 24px 24px;
  background: white;
}

.save-btn {
  background: #d87179 !important;
  color: white;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  padding: 0 24px;
  height: 40px;
  
  &:hover {
    background: #c85f67 !important;
  }
}
</style>