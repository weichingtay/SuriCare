<template>
    <div class="dialog-page">
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Dialog Components</h1>
            <p class="page-subtitle">Growth Dialog Component Demo</p>
        </div>

        <!-- Button to open dialog -->
        <div class="button-section">
            <v-btn 
                @click="openDialog"
                color="success"
                size="large"
                rounded="8"
            >
                <v-icon class="mr-2">mdi-food-apple</v-icon>
                Open Growth Dialog
            </v-btn>
        </div>

        <!-- Growth Dialog Component -->
        <GrowthDialog
            v-model="showDialog"
            :weight="growthData.weight"
            :height="growthData.height"
            :head-circumference="growthData.headCircumference"
            :notes="growthData.notes"
            :loading="isLoading"
            @update:weight="growthData.weight = $event"
            @update:height="growthData.height = $event"
            @update:head-circumference="growthData.headCircumference = $event"
            @update:notes="growthData.notes = $event"
            @save="handleSave"
            @close="closeDialog"
        />

        <!-- Data Preview (if any data exists) -->
        <div v-if="hasData" class="data-preview">
            <h3>Current Data:</h3>
            <v-card variant="outlined" class="pa-4">
                <div v-if="growthData.weight"><strong>Weight:</strong> {{ growthData.weight }} kg</div>
                <div v-if="growthData.height"><strong>Height:</strong> {{ growthData.height }} cm</div>
                <div v-if="growthData.headCircumference"><strong>Head Circumference:</strong> {{ growthData.headCircumference }} cm</div>
                <div v-if="growthData.notes"><strong>Notes:</strong> {{ growthData.notes }}</div>
            </v-card>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import GrowthDialog from '@/components/dialog/GrowthDialog.vue'

// Dialog state
const showDialog = ref(false)
const isLoading = ref(false)

// Growth data
const growthData = reactive({
    weight: '',
    height: '',
    headCircumference: '',
    notes: ''
})

// Computed
const hasData = computed(() => {
    return growthData.weight || growthData.height || growthData.headCircumference || growthData.notes
})

// Methods
const openDialog = () => {
    showDialog.value = true
}

const closeDialog = () => {
    showDialog.value = false
}

const handleSave = async (data) => {
    try {
        isLoading.value = true
        
        // Simulate API call
        console.log('Saving growth data:', data)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update local data
        Object.assign(growthData, data)
        
        // Close dialog
        closeDialog()
        
        console.log('Data saved successfully!')
        
    } catch (error) {
        console.error('Error saving growth data:', error)
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.dialog-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

.page-header {
    text-align: center;
    margin-bottom: 32px;
}

.page-title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 8px;
}

.page-subtitle {
    color: #666;
    font-size: 1.1rem;
}

.button-section {
    text-align: center;
    margin-bottom: 32px;
}

.data-preview {
    margin-top: 24px;
}

.data-preview h3 {
    margin-bottom: 16px;
}

.data-preview div {
    margin-bottom: 8px;
}
</style>