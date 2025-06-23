<template>
  <v-dialog
    v-model="isOpen"
    max-width="600px"
    persistent
    class="modern-dialog"
  >
    <v-card class="dialog-card">
      <!-- Header -->
      <v-card-title class="dialog-title">
        <div class="title-row">
          <div class="title-left">
            <v-icon size="20">mdi-silverware-fork-knife</v-icon>
            <h3>Log Meal</h3>
          </div>
          <v-btn icon variant="text" size="small" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p class="subtitle">What did Jennie eat?</p>
      </v-card-title>

      <v-card-text class="dialog-body">
        <!-- Meal Time -->
        <div class="section">
          <label class="label">Meal Time</label>
          <div class="options-row">
            <button
              v-for="time in mealTimes"
              :key="time.value"
              :class="['option-btn', { 'selected': selectedMealTime === time.value }]"
              @click="selectedMealTime = time.value"
            >
              <v-icon size="16">{{ time.icon }}</v-icon>
              {{ time.label }}
            </button>
          </div>
        </div>

        <!-- Consumption Level -->
        <div class="section">
          <label class="label">Consumption Level</label>
          <v-select
            v-model="selectedConsumption"
            :items="consumptionLevels"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </div>

        <!-- Meal Category -->
        <div class="section">
          <label class="label">Meal Category</label>
          <div class="options-row">
            <button
              v-for="category in mealCategories"
              :key="category.value"
              :class="['option-btn', { 'selected': selectedCategories.includes(category.value) }]"
              @click="toggleCategory(category.value)"
            >
              <v-icon size="16">{{ category.icon }}</v-icon>
              {{ category.label }}
            </button>
          </div>
          
          <div v-if="selectedCategories.includes('milk')" class="options-row subcategory">
            <button
              v-for="subcat in milkSubcategories"
              :key="subcat.value"
              :class="['option-btn', { 'selected': selectedSubcategories.includes(subcat.value) }]"
              @click="toggleSubcategory(subcat.value)"
            >
              {{ subcat.label }}
            </button>
          </div>
        </div>

        <!-- Remarks -->
        <div class="section">
          <label class="label">Remarks/Notes</label>
          <div class="custom-textarea">
            <textarea
              v-model="remarks"
              placeholder="Type details here"
              rows="2"
            ></textarea>
          </div>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn class="save-btn" @click="saveMeal">
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
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedMealTime = ref('breakfast')
const selectedConsumption = ref('0% (Refused)')
const selectedCategories = ref([])
const selectedSubcategories = ref([])
const remarks = ref('')

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

const toggleCategory = (category) => {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
    if (category === 'milk') selectedSubcategories.value = []
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
  emit('save', {
    type: 'meal',
    mealTime: selectedMealTime.value,
    consumption: selectedConsumption.value,
    categories: selectedCategories.value,
    subcategories: selectedSubcategories.value,
    remarks: remarks.value,
    timestamp: new Date()
  })
  closeDialog()
  selectedMealTime.value = 'breakfast'
  selectedConsumption.value = '0% (Refused)'
  selectedCategories.value = []
  selectedSubcategories.value = []
  remarks.value = ''
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.dialog-card {
  background: $dialog-background;
  border: 1px solid $dialog-border;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-lg;
}

.dialog-title {
  background: linear-gradient(135deg, rgba($app-primary, 0.1) 0%, rgba($app-primary-light, 0.05) 100%);
  border-bottom: 1px solid $dialog-border;
  padding: $spacing-lg;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.title-left {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  
  h3 {
    font-family: $font-heading;
    font-size: 20px;
    font-weight: 600;
    color: $dialog-text;
    margin: 0;
  }
  
  .v-icon {
    color: $dialog-text-secondary;
  }
}

.subtitle {
  font-family: $font-primary;
  font-size: 14px;
  color: $dialog-text-secondary;
  margin: 0;
}

.dialog-body {
  padding: $spacing-md $spacing-lg;
}

.section {
  margin-bottom: $spacing-lg;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  display: block;
  font-family: $font-primary;
  font-size: 14px;
  font-weight: 500;
  color: $dialog-text;
  margin-bottom: $spacing-md;
}

.options-row {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
  
  &.subcategory {
    margin-top: $spacing-md;
  }
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: $spacing-sm $spacing-lg;
  border: 1px solid $dialog-border;
  border-radius: $border-radius-lg;
  background: white;
  color: $dialog-text;
  font-family: $font-primary;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: $app-primary-light;
    background: $glass-white-light;
  }
  
  &.selected {
    border-color: $app-primary;
    background: white;
  }
}

.custom-textarea {
  border: 1px solid $app-primary;
  border-radius: $border-radius-lg;
  background: white;
  
  textarea {
    width: 100%;
    padding: $spacing-md;
    border: none;
    outline: none;
    background: transparent;
    font-family: $font-primary;
    font-size: 14px;
    color: $field-text;
    resize: vertical;
    
    &::placeholder {
      color: $field-label;
    }
  }
}

.dialog-actions {
  padding: $spacing-md $spacing-lg $spacing-lg;
  gap: $spacing-md;
}

.save-btn {
  background: white;
  color: $app-primary;
  border: 1px solid $app-primary;
  font-weight: 600;
  
  &:hover {
    background: $glass-white-light;
  }
}
</style>