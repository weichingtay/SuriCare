<template>
    <BaseCheckInDialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        
        icon="mdi-food-apple"
        icon-color="#4CAF50"
        title="Growth"
        subtitle="How is Jennie growing?"
        :notes="notes"
        @update:notes="$emit('update:notes', $event)"
        :loading="loading"
        @save="handleSave"
        @close="$emit('close')"
    >
        <template #custom-content>
            <div class="growth-measurements" style="display: flex; gap: 16px; margin-bottom: 16px;">
                <!-- Weight Input -->
                <div class="measurement-field">
                    <label class="measurement-label">Weight</label>
                    <v-text-field
                        v-model="localWeight"
                        placeholder="Input weight here"
                        variant="outlined"
                        suffix="kg"
                        hide-details
                        :disabled="loading"
                        class="measurement-input"
                    >
                        <template #prepend-inner>
                            <v-icon size="20" color="grey-darken-1">
                                mdi-scale-bathroom
                            </v-icon>
                        </template>
                    </v-text-field>
                </div>

                <!-- Height Input -->
                <div class="measurement-field">
                    <label class="measurement-label">Height</label>
                    <v-text-field
                        v-model="localHeight"
                        placeholder="Input height here"
                        variant="outlined"
                        suffix="cm"
                        hide-details
                        :disabled="loading"
                        class="measurement-input"
                    >
                        <template #prepend-inner>
                            <v-icon size="20" color="grey-darken-1">
                                mdi-ruler
                            </v-icon>
                        </template>
                    </v-text-field>
                </div>

                <!-- Head Circumference Input -->
                <div class="measurement-field">
                    <label class="measurement-label">Head Circumference (cm)</label>
                    <v-text-field
                        v-model="localHeadCircumference"
                        placeholder="Input headcircumference"
                        variant="outlined"
                        suffix="cm"
                        hide-details
                        :disabled="loading"
                        class="measurement-input"
                    >
                        <template #prepend-inner>
                            <v-icon size="20" color="grey-darken-1">
                                mdi-head
                            </v-icon>
                        </template>
                    </v-text-field>
                </div>
            </div>
        </template>
    </BaseCheckInDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseCheckInDialog from '@/components/dialog/BaseCheckInDialog.vue'

const props = defineProps({
    // Dialog Control
    modelValue: {
        type: Boolean,
        default: false
    },
    
    // Growth Measurements
    weight: {
        type: [String, Number],
        default: ''
    },
    height: {
        type: [String, Number],
        default: ''
    },
    headCircumference: {
        type: [String, Number],
        default: ''
    },
    
    // Notes
    notes: {
        type: String,
        default: ''
    },
    
    // State
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits([
    'update:modelValue',
    'update:weight',
    'update:height', 
    'update:headCircumference',
    'update:notes',
    'save',
    'close'
])

// Local reactive variables for measurements
const localWeight = ref(props.weight)
const localHeight = ref(props.height)
const localHeadCircumference = ref(props.headCircumference)

// Watch for changes and emit to parent
watch(localWeight, (newValue) => {
    emit('update:weight', newValue)
})

watch(localHeight, (newValue) => {
    emit('update:height', newValue)
})

watch(localHeadCircumference, (newValue) => {
    emit('update:headCircumference', newValue)
})

// Watch for prop changes and update local values
watch(() => props.weight, (newValue) => {
    localWeight.value = newValue
})

watch(() => props.height, (newValue) => {
    localHeight.value = newValue
})

watch(() => props.headCircumference, (newValue) => {
    localHeadCircumference.value = newValue
})

// Handle save action
const handleSave = () => {
    const growthData = {
        weight: localWeight.value,
        height: localHeight.value,
        headCircumference: localHeadCircumference.value,
        notes: props.notes
    }
    emit('save', growthData)
}
</script>

<style scoped>
.growth-measurements {
    margin-bottom: 24px;
}

.measurement-field {
    margin-bottom: 20px;
}

.measurement-field:last-child {
    margin-bottom: 0;
}

.measurement-label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-size: 14px;
    font-weight: 500;
}

.measurement-input :deep(.v-field__outline) {
    border-radius: 8px;
}

.measurement-input :deep(.v-field__input) {
    padding-left: 8px;
}

.measurement-input :deep(.v-field__prepend-inner) {
    padding-top: 12px;
}
</style>