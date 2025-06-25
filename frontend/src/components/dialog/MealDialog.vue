<template>
    <BaseCheckInDialog
        :model-value="modelValue"
        @update:model-value="handleDialogUpdate"
        class="mealdialog"
        icon="mdi-food"
        icon-color="#000000"
        title="Log Meal"
        subtitle="What did Jennie eat?"
        :notes="notes"
        @update:notes="$emit('update:notes', $event)"
        :loading="loading"
        @save="handleSave"
        @close="handleClose"
        max-width="1000px"

    >
        <template #custom-content>
            <div class="meal-content">

                <!-- Meal Time and Consumption Level Row -->
                <div class="meal-time-consumption">
                    <!-- Meal Time -->
                    <div class="meal-time-section">
                        <label class="section-label">Meal Time</label>
                        <div class="meal-time-buttons">
                            <v-btn
                                v-for="time in mealTimeOptions"
                                :key="time.value"
                                :variant="localMealTime === time.value ? 'flat' : 'outlined'"
                                :color="localMealTime === time.value ? 'primary' : 'default'"
                                size="small"
                                @click="selectMealTime(time.value)"
                                :disabled="loading"
                                class="meal-time-btn"
                            >
                                <v-icon 
                                    :icon="time.icon" 
                                    size="14" 
                                    class="mr-1"
                                />
                                {{ time.label }}
                            </v-btn>
                        </div>
                        <div v-if="errors.mealTime" class="error-message">
                            {{ errors.mealTime }}
                        </div>
                    </div>

                    <div class="consumption-section">
                        <label class="section-label">Consumption Level</label>
                        <v-select
                            v-model="localConsumptionLevel"
                            :items="consumptionOptions"
                            item-title="label"
                            item-value="value"
                            placeholder="0% (Refused)"
                            variant="outlined"
                            hide-details
                            :disabled="loading"
                            density="compact"
                            :error="!!errors.consumptionLevel"
                            class="consumption-select"
                            @update:model-value="clearError('consumptionLevel')"
                        >
                            <template #prepend-inner>
                                <v-icon size="16" color="grey-darken-1" class="mr-1">
                                    mdi-percent
                                </v-icon>
                            </template>
                        </v-select>
                        <div v-if="errors.consumptionLevel" class="error-message">
                            {{ errors.consumptionLevel }}
                        </div>
                    </div>
                </div>

                <!-- Consumption Level -->
                    


                <!-- Meal Category -->
                <div class="meal-category-section">
                    <label class="section-label">Meal Category</label>
                    <div class="meal-category-buttons">
                        <v-btn
                            v-for="category in mealCategoryOptions"
                            :key="category.value"
                            :variant="localMealCategory === category.value ? 'flat' : 'outlined'"
                            :color="localMealCategory === category.value ? 'primary' : 'default'"
                            size="small"
                            rounded="20"
                            @click="selectMealCategory(category.value)"
                            :disabled="loading"
                            class="meal-category-btn"
                        >
                            <v-icon 
                                :icon="category.icon" 
                                size="14" 
                                class="mr-1"
                            />
                            {{ category.label }}
                        </v-btn>
                    </div>
                    <div v-if="errors.mealCategory" class="error-message">
                        {{ errors.mealCategory }}
                    </div>
                </div>

                <!-- Sub Categories for Milk -->
                <div v-if="localMealCategory === 'milk'" class="milk-subcategory">
                    <div class="milk-buttons">
                        <v-btn
                            v-for="subCat in milkSubCategories"
                            :key="subCat.value"
                            :variant="localSubCategory === subCat.value ? 'flat' : 'outlined'"
                            :color="localSubCategory === subCat.value ? 'primary' : 'default'"
                            size="small"
                            rounded="20"
                            @click="selectSubCategory(subCat.value)"
                            :disabled="loading"
                            class="milk-sub-btn"
                        >
                            {{ subCat.label }}
                        </v-btn>
                    </div>
                </div>

                <!-- Custom Meal Input for Others -->
                <div v-if="localMealCategory === 'others'" class="custom-meal-section">
                    <label class="section-label">Specify meal details</label>
                    <v-text-field
                        v-model="localCustomMeal"
                        placeholder="Enter specific meal details"
                        variant="outlined"
                        hide-details
                        :disabled="loading"
                        density="compact"
                        :error="!!errors.customMeal"
                        class="custom-meal-input"
                        @input="clearError('customMeal')"
                        @focus="clearError('customMeal')"
                    />
                    <div v-if="errors.customMeal" class="error-message">
                        {{ errors.customMeal }}
                    </div>
                </div>
            </div>
        </template>
    </BaseCheckInDialog>
</template>

<script setup>
// 🔧 修改1: 添加 nextTick 导入
import { ref, watch, nextTick } from 'vue'
import BaseCheckInDialog from '@/components/dialog/BaseCheckInDialog.vue'

const props = defineProps({
    width: {
        type: String,
        default: '800px'
    },
    modelValue: {
        type: Boolean,
        default: false
    },
    mealTime: {
        type: String,
        default: ''
    },
    consumptionLevel: {
        type: String,
        default: ''
    },
    mealCategory: {
        type: String,
        default: ''
    },
    subCategory: {
        type: String,
        default: ''
    },
    customMeal: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    loading: {
        type: Boolean,
        default: false
    }
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
    'close'
])

// Options exactly as shown in images
const mealTimeOptions = [
    { value: 'breakfast', label: 'Breakfast', icon: 'mdi-weather-sunny' },
    { value: 'lunch', label: 'Lunch', icon: 'mdi-white-balance-sunny' },
    { value: 'dinner', label: 'Dinner', icon: 'mdi-weather-night' }
]

const consumptionOptions = [
    { value: '0', label: '0% (Refused)' },
    { value: '25', label: '25% (Partial)' },
    { value: '50', label: '50% (Partial)' },
    { value: '75', label: '75% (Partial)' },
    { value: '100', label: '100% (Full)' }
]

const mealCategoryOptions = [
    { value: 'milk', label: 'Milk', icon: 'mdi-cup' },
    { value: 'solid', label: 'Solid', icon: 'mdi-food-apple' },
    { value: 'mixed', label: 'Mixed', icon: 'mdi-bowl-mix' },
    { value: 'others', label: 'Others', icon: 'mdi-dots-horizontal' }
]

const milkSubCategories = [
    { value: 'breast_milk', label: 'Breast Milk' },
    { value: 'formula', label: 'Formula' }
]

// 🔧 修改2: 本地变量初始化为空值
const localMealTime = ref('')
const localConsumptionLevel = ref('')
const localMealCategory = ref('')
const localSubCategory = ref('')
const localCustomMeal = ref('')
const errors = ref({})

// 🔧 修改3: 添加防抖变量
let mealTimeTimeout = null
let consumptionTimeout = null
let categoryTimeout = null
let subCategoryTimeout = null
let customMealTimeout = null

// 🔧 修改4: 监听dialog开关 - 重置所有状态
watch(() => props.modelValue, (newValue) => {
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

// 🔧 修改5: 条件性监听props变化
watch(() => props.mealTime, (newValue) => {
    if (props.modelValue) {
        localMealTime.value = newValue || ''
    }
})

watch(() => props.consumptionLevel, (newValue) => {
    if (props.modelValue) {
        localConsumptionLevel.value = newValue || ''
    }
})

watch(() => props.mealCategory, (newValue) => {
    if (props.modelValue) {
        localMealCategory.value = newValue || ''
    }
})

watch(() => props.subCategory, (newValue) => {
    if (props.modelValue) {
        localSubCategory.value = newValue || ''
    }
})

watch(() => props.customMeal, (newValue) => {
    if (props.modelValue) {
        localCustomMeal.value = newValue || ''
    }
})

// 🔧 修改6: 防抖动emit处理
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

// 🔧 修改7: 添加错误清除方法
const clearError = (field) => {
    if (errors.value[field]) {
        delete errors.value[field]
    }
}

// 🔧 修改8: 改进按钮选择方法 - 确保触发reactivity
const selectMealTime = (time) => {
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

// 🔧 修改9: 重写validateForm - 先清除所有错误
const validateForm = () => {
    errors.value = {}
    const isMealTimeValid = validateMealTime()
    const isConsumptionValid = validateConsumptionLevel()
    const isCategoryValid = validateMealCategory()
    const isCustomMealValid = validateCustomMeal()
    return isMealTimeValid && isConsumptionValid && isCategoryValid && isCustomMealValid
}

// 🔧 修改10: 重写handleDialogUpdate
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

// 🔧 修改11: 重写handleClose
const handleClose = () => {
    errors.value = {}
    localMealTime.value = ''
    localConsumptionLevel.value = ''
    localMealCategory.value = ''
    localSubCategory.value = ''
    localCustomMeal.value = ''
    emit('close')
}

// 🔧 修改12: 重写handleSave
const handleSave = () => {
    if (!validateForm()) {
        return
    }

    const mealData = {
        mealTime: localMealTime.value,
        consumptionLevel: localConsumptionLevel.value,
        mealCategory: localMealCategory.value,
        subCategory: localSubCategory.value,
        customMeal: localCustomMeal.value,
        notes: props.notes
    }
    
    errors.value = {}
    emit('save', mealData)
}
</script>

<style scoped>


.meal-content {
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
    border-radius:4px !important;
}

.section-label {
    font-size: 12px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
}

.meal-time-buttons {
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

.meal-time-btn.v-btn--variant-flat,
.meal-category-btn.v-btn--variant-flat {
    background-color: #D87179 !important;
    color: white !important;
}

.meal-time-btn.v-btn--variant-flat .v-icon,
.meal-category-btn.v-btn--variant-flat .v-icon {
    color: white !important;
}

.milk-sub-btn.v-btn--variant-flat {
    background-color:#D87179 !important;
    color: white !important;
}

.consumption-select {
    width: 160px !important;
    min-width: 170px !important;
    max-width: 170px !important;
    border-radius: 4px !important;
    font-size: 14px !important;
}

/* Updated styles for consumption dropdown */
.consumption-select :deep(.v-field) {
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

/* Dropdown menu width and options font size */
.consumption-select :deep(.v-overlay__content) {
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


.meal-category-section {
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
    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
}

/* Make textarea wider for meal dialog */
:deep(.notes-textarea) {
    width: 800px !important;
    min-width: 600px !important;
}

:deep(.notes-textarea .v-field) {
    width: 800px !important;
}

:deep(.dialog-notes-section) {
    width: 800px !important;
}
</style>