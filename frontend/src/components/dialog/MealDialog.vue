<template>
  <BaseCheckInDialog
    class="mealdialog"
    icon="mdi-silverware-fork-knife"
    icon-color="#D87179"
    :loading="loading"
    max-width="1000px"
    :model-value="modelValue"
    :notes="notes"
    subtitle="What did Jennie eat?"
    title="Log Meal"
    @close="handleClose"
    @save="handleSave"
    @update:model-value="handleDialogUpdate"
    @update:notes="$emit('update:notes', $event)"
  >
    <template #custom-content>
      <div class="meal-content">
<<<<<<< HEAD
=======
        
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
        <!-- Meal Time and Consumption Level Row -->
        <div class="meal-time-consumption">
          <!-- Meal Time -->
          <div class="meal-time-section">
            <label class="section-label">Meal Time</label>
            
            <!-- Always show meal time buttons but disable/lock when editing -->
            <div class="meal-time-buttons">
              <div
                v-if="isMealOptionsLoading"
                class="d-flex justify-center pa-4"
              >
                <v-progress-circular
                  indeterminate
                  size="20"
                />
              </div>
              <v-btn
                v-for="time in mealTimeOptions"
                v-else
                :key="time.value"
                class="meal-time-btn"
                :class="{ 'locked-btn': isEditing && localMealTime !== time.value }"
                :color="localMealTime === time.value ? 'primary' : 'default'"
                :disabled="loading || (isEditing && localMealTime !== time.value)"
                size="small"
                :variant="localMealTime === time.value ? 'flat' : 'outlined'"
                @click="selectMealTime(time.value)"
              >
                <v-icon
                  v-if="isEditing && localMealTime === time.value"
                  class="mr-1"
                  color="white"
                  size="14"
                >
                  mdi-lock
                </v-icon>
                <v-icon
                  v-else
                  class="mr-1"
                  :icon="time.icon"
                  size="14"
                />
                {{ time.label }}
                <v-tooltip v-if="isEditing && localMealTime !== time.value" activator="parent" location="top">
                  Meal time cannot be changed when editing
                </v-tooltip>
                <v-tooltip v-if="isEditing && localMealTime === time.value" activator="parent" location="top">
                  Current meal time (locked)
                </v-tooltip>
              </v-btn>
            </div>
            <div
              v-if="errors.mealTime"
              class="error-message"
            >
              {{ errors.mealTime }}
            </div>
          </div>

          <div class="consumption-section">
            <label class="section-label">Consumption Level</label>
            <v-select
              v-model="localConsumptionLevel"
              class="consumption-select"
              density="compact"
              :disabled="loading || isMealOptionsLoading"
              :error="!!errors.consumptionLevel"
              hide-details
              item-title="label"
              item-value="value"
              :items="consumptionOptions"
              :loading="isMealOptionsLoading"
              placeholder="0% (Refused)"
              variant="outlined"
              @update:model-value="clearError('consumptionLevel')"
            >
              <template #prepend-inner>
                <v-icon
                  class="mr-1"
                  color="grey-darken-1"
                  size="16"
                >
                  mdi-percent
                </v-icon>
              </template>
            </v-select>
            <div
              v-if="errors.consumptionLevel"
              class="error-message"
            >
              {{ errors.consumptionLevel }}
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <!-- Consumption Level -->

=======
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
        <!-- Meal Category -->
        <div class="meal-category-section">
          <label class="section-label">Meal Category</label>
          <div class="meal-category-buttons">
            <div
              v-if="isMealOptionsLoading"
              class="d-flex justify-center pa-4"
            >
              <v-progress-circular
                indeterminate
                size="20"
              />
            </div>
            <v-btn
              v-for="category in mealCategoryOptions"
              v-else
              :key="category.value"
              class="meal-category-btn"
              :color="
                localMealCategory === category.value ? 'primary' : 'default'
              "
              :disabled="loading"
              rounded="20"
              size="small"
              :variant="
                localMealCategory === category.value ? 'flat' : 'outlined'
              "
              @click="selectMealCategory(category.value)"
            >
              <v-icon
                class="mr-1"
                :icon="category.icon"
                size="14"
              />
              {{ category.label }}
            </v-btn>
          </div>
          <div
            v-if="errors.mealCategory"
            class="error-message"
          >
            {{ errors.mealCategory }}
          </div>
        </div>

        <!-- Sub Categories for Milk -->
<<<<<<< HEAD
        <div
          v-if="localMealCategory === 'milk'"
          class="milk-subcategory"
        >
=======
        <div v-if="localMealCategory === 'Milk'" class="milk-subcategory">
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
          <div class="milk-buttons">
            <v-btn
              v-for="subCat in milkSubCategories"
              :key="subCat.value"
              class="milk-sub-btn"
              :color="localSubCategory === subCat.value ? 'primary' : 'default'"
              :disabled="loading"
              rounded="20"
              size="small"
              :variant="localSubCategory === subCat.value ? 'flat' : 'outlined'"
              @click="selectSubCategory(subCat.value)"
            >
              {{ subCat.label }}
            </v-btn>
          </div>
        </div>

        <!-- Custom Meal Input for Others -->
<<<<<<< HEAD
        <div
          v-if="localMealCategory === 'others'"
          class="custom-meal-section"
        >
=======
        <div v-if="localMealCategory === 'Others'" class="custom-meal-section">
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
          <label class="section-label">Specify meal details</label>
          <v-text-field
            v-model="localCustomMeal"
            class="custom-meal-input"
            density="compact"
            :disabled="loading"
            :error="!!errors.customMeal"
            hide-details
            placeholder="Enter specific meal details"
            variant="outlined"
            @focus="clearError('customMeal')"
            @input="clearError('customMeal')"
          />
          <div
            v-if="errors.customMeal"
            class="error-message"
          >
            {{ errors.customMeal }}
          </div>
        </div>
      </div>
    </template>
  </BaseCheckInDialog>
</template>

<script setup lang="ts">
  import { useMealOptions } from '@/composables/useMealOptions'
  import { nextTick, ref, watch } from 'vue'
  import BaseCheckInDialog from '@/components/dialog/BaseCheckInDialog.vue'
  import { useCheckinStore } from '@/stores/checkin'

  const props = defineProps({
    width: {
      type: String,
      default: '800px',
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
    mealTime: {
      type: String,
      default: '',
    },
    consumptionLevel: {
      type: String,
      default: '',
    },
    mealCategory: {
      type: String,
      default: '',
    },
    subCategory: {
      type: String,
      default: '',
    },
    customMeal: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    isEditing: {
      type: Boolean,
      default: false
    },
  })

  const emit = defineEmits([
    'update:modelValue',
    'update:mealTime',
    'update:consumptionLevel',
    'update:mealCategory',
    'update:subCategory',
    'update:customMeal',
    'update:notes',
    'save',
    'close',
  ])

  // Use dynamic options from database
  const {
    mealTimeOptions,
    mealCategoryOptions,
    consumptionOptions,
    milkSubCategories,
    isLoading: isMealOptionsLoading,
  } = useMealOptions()

  const checkinStore = useCheckinStore()
  const localMealTime = ref('')
  const localConsumptionLevel = ref('')
  const localMealCategory = ref('')
  const localSubCategory = ref('')
  const localCustomMeal = ref('')
  const errors = ref({})

  let mealTimeTimeout = null
  let consumptionTimeout = null
  let categoryTimeout = null
  let subCategoryTimeout = null
  let customMealTimeout = null

<<<<<<< HEAD
  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue) {
        // Reset all form data when opening dialog
        localMealTime.value = props.mealTime || ''
        localConsumptionLevel.value = props.consumptionLevel || ''
        localMealCategory.value = props.mealCategory || ''
        localSubCategory.value = props.subCategory || ''
        localCustomMeal.value = props.customMeal || ''
        // Clear all errors when opening
        errors.value = {}
      }
    },
    { immediate: true }
  )
=======
  // Get current meal time label for locked display
  const getCurrentMealTimeLabel = () => {
    const mealTimeOption = mealTimeOptions.value.find(option => option.value === localMealTime.value)
    return mealTimeOption ? mealTimeOption.label : localMealTime.value
  }

  watch(() => props.modelValue, newValue => {
    if (newValue) {
      // Reset all form data when opening dialog
      localMealTime.value = props.mealTime || ''
      localConsumptionLevel.value = props.consumptionLevel || ''
      localMealCategory.value = props.mealCategory || ''
      localSubCategory.value = props.subCategory || ''
      localCustomMeal.value = props.customMeal || ''
      // Clear all errors when opening
      errors.value = {}
    }
  }, { immediate: true })
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04

  watch(
    () => props.mealTime,
    (newValue) => {
      if (props.modelValue) {
        localMealTime.value = newValue || ''
      }
    }
  )

  watch(
    () => props.consumptionLevel,
    (newValue) => {
      if (props.modelValue) {
        localConsumptionLevel.value = newValue || ''
      }
    }
  )

  watch(
    () => props.mealCategory,
    (newValue) => {
      if (props.modelValue) {
        localMealCategory.value = newValue || ''
      }
    }
  )

  watch(
    () => props.subCategory,
    (newValue) => {
      if (props.modelValue) {
        localSubCategory.value = newValue || ''
      }
    }
  )

  watch(
    () => props.customMeal,
    (newValue) => {
      if (props.modelValue) {
        localCustomMeal.value = newValue || ''
      }
    }
  )

  watch(localMealTime, (newValue) => {
    if (mealTimeTimeout) clearTimeout(mealTimeTimeout)
    mealTimeTimeout = setTimeout(() => {
      emit('update:mealTime', newValue)
      if (newValue && errors.value.mealTime) {
        delete errors.value.mealTime
      }
    }, 100)
  })

  watch(localConsumptionLevel, (newValue) => {
    if (consumptionTimeout) clearTimeout(consumptionTimeout)
    consumptionTimeout = setTimeout(() => {
      emit('update:consumptionLevel', newValue)
      if (newValue && errors.value.consumptionLevel) {
        delete errors.value.consumptionLevel
      }
    }, 100)
  })

  watch(localMealCategory, (newValue) => {
    if (categoryTimeout) clearTimeout(categoryTimeout)
    categoryTimeout = setTimeout(() => {
      emit('update:mealCategory', newValue)
      if (newValue && errors.value.mealCategory) {
        delete errors.value.mealCategory
      }
      // Clear sub-category when main category changes
      if (newValue !== 'milk') {
        localSubCategory.value = ''
      }
      if (newValue !== 'others') {
        localCustomMeal.value = ''
      }
    }, 100)
  })

  watch(localSubCategory, (newValue) => {
    if (subCategoryTimeout) clearTimeout(subCategoryTimeout)
    subCategoryTimeout = setTimeout(() => {
      emit('update:subCategory', newValue)
    }, 100)
  })

  watch(localCustomMeal, (newValue) => {
    if (customMealTimeout) clearTimeout(customMealTimeout)
    customMealTimeout = setTimeout(() => {
      emit('update:customMeal', newValue)
      if (newValue && errors.value.customMeal) {
        delete errors.value.customMeal
      }
    }, 100)
  })

  const clearError = (field) => {
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

<<<<<<< HEAD
  const selectMealTime = (time) => {
=======
  const selectMealTime = time => {
    if (props.isEditing && localMealTime.value !== time) {
      // Show alert if trying to change meal time while editing
      alert('Meal time cannot be changed when editing an existing entry.')
      return
    }
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
    localMealTime.value = time
  }

  const selectMealCategory = (category) => {
    localMealCategory.value = category
  }

  const selectSubCategory = (subCat) => {
    localSubCategory.value = subCat
  }

  // Validation methods
  const validateMealTime = () => {
    if (!localMealTime.value) {
      errors.value.mealTime = 'Please select meal time'
      return false
    }
    delete errors.value.mealTime
    return true
  }

  const validateConsumptionLevel = () => {
    if (!localConsumptionLevel.value && localConsumptionLevel.value !== '0') {
      errors.value.consumptionLevel = 'Please select consumption level'
      return false
    }
    delete errors.value.consumptionLevel
    return true
  }

  const validateMealCategory = () => {
    if (!localMealCategory.value) {
      errors.value.mealCategory = 'Please select meal category'
      return false
    }
    delete errors.value.mealCategory
    return true
  }

  const validateCustomMeal = () => {
    if (localMealCategory.value === 'others' && !localCustomMeal.value) {
      errors.value.customMeal = 'Please enter meal details'
      return false
    }
    delete errors.value.customMeal
    return true
  }

  const validateForm = () => {
    errors.value = {}
    const isMealTimeValid = validateMealTime()
    const isConsumptionValid = validateConsumptionLevel()
    const isCategoryValid = validateMealCategory()
    const isCustomMealValid = validateCustomMeal()
    return (
      isMealTimeValid &&
      isConsumptionValid &&
      isCategoryValid &&
      isCustomMealValid
    )
  }

  const handleDialogUpdate = (value) => {
    emit('update:modelValue', value)
    if (!value) {
      nextTick(() => {
        errors.value = {}
        localMealTime.value = ''
        localConsumptionLevel.value = ''
        localMealCategory.value = ''
        localSubCategory.value = ''
        localCustomMeal.value = ''
      })
    }
  }

  const handleClose = () => {
    errors.value = {}
    localMealTime.value = ''
    localConsumptionLevel.value = ''
    localMealCategory.value = ''
    localSubCategory.value = ''
    localCustomMeal.value = ''
    emit('close')
  }

  const handleSave = async () => {
    console.log('🍽️ MealDialog handleSave clicked!')
    
    if (!validateForm()) {
      console.log('❌ Meal validation failed')
      return
    }

    const mealData = {
      mealTime: localMealTime.value,
      consumptionLevel: localConsumptionLevel.value,
      mealCategory: localMealCategory.value,
      subCategory: localSubCategory.value,
      customMeal: localCustomMeal.value,
      notes: props.notes,
    }

    console.log('🍽️ Meal data to save:', mealData)
    errors.value = {}

<<<<<<< HEAD
    try {
      // Save to store (which handles backend integration)
      await checkinStore.saveMeal(mealData)
      emit('save', mealData)
      // Close dialog on success
      handleDialogUpdate(false)
    } catch (error) {
      console.error('Failed to save meal data:', error)
      // Error is already handled by the store
=======
    if (props.isEditing) {
      // 🖊️ EDIT MODE: Just emit to parent timeline, don't call store
      console.log('📝 Edit mode: emitting save to timeline')
      emit('save', mealData)
    } else {
      // ➕ CREATE MODE: Call store to create new entry (normal check-in)
      console.log('➕ Create mode: calling checkinStore.saveMeal for new entry')
    
      try {
        // Save to store (which handles backend integration)
        console.log('🍽️ About to call checkinStore.saveMeal...')
        await checkinStore.saveMeal(mealData)
        console.log('✅ Meal save completed successfully!')
        
        // Emit save event to parent for reload
        console.log('🍽️ Emitting save event to parent...')
        emit('save')
        
        // Close dialog on success
        handleDialogUpdate(false)
      } catch (error) {
        console.error('❌ Failed to save meal data:', error)
        // Error is already handled by the store
      }
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
    }
  }
</script>

<style scoped>
<<<<<<< HEAD
  .meal-content {
=======
.meal-content {
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .meal-time-consumption {
    display: flex;
    gap: 28px;
  }

  .meal-time-section,
  .consumption-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 4px !important;
  }

  .section-label {
    font-size: 12px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }

<<<<<<< HEAD
  .meal-time-buttons {
=======
.locked-text {
    font-weight: 600;
}

.meal-time-buttons {
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
    display: flex;
    gap: 8px;
  }

  .meal-time-btn,
  .meal-category-btn,
  .milk-sub-btn {
    text-transform: none;
    font-weight: 400;
    min-width: 70px;
    height: 32px;
    font-size: 12px;
    border: 1px solid #e0e0e0 !important;
    border-radius: 4px;
    color: #333 !important;
  }

<<<<<<< HEAD
  .meal-time-btn.v-btn--variant-flat,
  .meal-category-btn.v-btn--variant-flat {
    background-color: #d87179 !important;
=======
.meal-time-btn.locked-btn {
    opacity: 0.5;
    background-color: #f5f5f5 !important;
    color: #999 !important;
    cursor: not-allowed;
}

.meal-time-btn.locked-btn .v-icon {
    color: #999 !important;
}

.meal-time-btn.v-btn--variant-flat,
.meal-category-btn.v-btn--variant-flat {
    background-color: #D87179 !important;
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
    color: white !important;
  }

  .meal-time-btn.v-btn--variant-flat .v-icon,
  .meal-category-btn.v-btn--variant-flat .v-icon {
    color: white !important;
  }

  .milk-sub-btn.v-btn--variant-flat {
    background-color: #d87179 !important;
    color: white !important;
  }

  .consumption-select {
    width: 160px !important;
    min-width: 170px !important;
    max-width: 170px !important;
    border-radius: 4px !important;
    font-size: 14px !important;
  }

<<<<<<< HEAD
  /* Updated styles for consumption dropdown */
  .consumption-select :deep(.v-field) {
=======
.consumption-select :deep(.v-field) {
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
    min-height: 32px !important;
    border-radius: 4px !important;
    width: 120px !important;
    font-size: 14px !important;
  }

  .consumption-select :deep(.v-field__input) {
    min-height: 32px !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    font-size: 14px !important;
  }

  .consumption-select :deep(.v-field__input input) {
    font-size: 14px !important;
  }

  .consumption-select :deep(.v-field__input .v-field__field) {
    font-size: 14px !important;
  }

  .consumption-select :deep(.v-select__selection) {
    font-size: 14px !important;
  }

  .consumption-select :deep(.v-select__selection-text) {
    font-size: 14px !important;
  }

  .consumption-select :deep(.v-field__overlay) {
    font-size: 14px !important;
  }

  .consumption-select :deep(.v-field__outline) {
    border-radius: 4px !important;
  }

<<<<<<< HEAD
  /* Dropdown menu width and options font size */
  .consumption-select :deep(.v-overlay__content) {
=======
.consumption-select :deep(.v-overlay__content) {
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
    width: 200px !important;
  }

  .consumption-select :deep(.v-list) {
    width: 200px !important;
  }

  .consumption-select :deep(.v-list-item) {
    font-size: 14px !important;
    min-height: 32px !important;
  }

  .consumption-select :deep(.v-list-item-title) {
    font-size: 14px !important;
  }

  .consumption-select :deep(.v-list-item__content) {
    font-size: 14px !important;
  }

<<<<<<< HEAD
  .meal-category-section {
=======
.meal-category-section {
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
    display: flex;
    flex-direction: column;
  }

  .meal-category-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .milk-subcategory {
    display: flex;
    flex-direction: column;
  }

  .milk-buttons {
    display: flex;
    gap: 8px;
  }

  .custom-meal-section {
    display: flex;
    flex-direction: column;
  }

  .custom-meal-input {
    min-width: 300px;
  }

  .error-message {
    color: #d32f2f;
    font-size: 12px;
    margin-top: 8px;
  }

  .v-btn {
    box-shadow: none !important;
  }

  .v-btn:hover {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  }

<<<<<<< HEAD
  /* Make textarea wider for meal dialog */
  :deep(.notes-textarea) {
=======
:deep(.notes-textarea) {
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
    width: 800px !important;
    min-width: 600px !important;
  }

  :deep(.notes-textarea .v-field) {
    width: 800px !important;
  }

  :deep(.dialog-notes-section) {
    width: 800px !important;
<<<<<<< HEAD
  }
</style>
=======
}
</style>
>>>>>>> 06d178eac6de5efac03ecbebf8f19fc981c1cb04
