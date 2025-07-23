<!-- index.vue -->
<template>
    <!-- Main application container with light theme -->
    <v-app theme="light">
        <v-row>
            <v-col cols="4">
                <!-- Welcome text -->
                <div class="welcome-content">
                    <h1 class="welcome-text mb-1">Welcome, Wei Ching</h1>
                    <p class="welcome-subtitle">
                        Let's check on your little one today
                    </p>
                </div>
            </v-col>

            <v-col cols="4">
                <!-- Show alert if needed -->
                <v-alert
                    v-if="alert.show"
                    :type="alert.type"
                    :text="alert.message"
                    class="mb-4 centered-alert"
                    closable
                ></v-alert>
            </v-col>
        </v-row>
        <!-- Main content area -->
        <v-main style="background-color: #faf7f2">
            <v-container
                class="pa-1 pt-2"
                fluid
            >
                <!-- Welcome section -->
                <!-- <div class="mb-6">
          <h1 class="text-h5 font-weight-medium mb-1 text-warm">
            Welcome, {{ caregiverName }}
          </h1>
        </div> -->

                <!-- Health Issue Alert -->
                <HealthAlert
                    :current-child="childrenStore.currentChild"
                    @view-more="handleHealthAlert"
                />

                <!-- Check-ins History section -->
                <CheckInsHistory
                    :current-child="childrenStore.currentChild"
                    @view-history="handleViewHistory"
                />

                <!-- Today's Summary section -->
                <TodaysSummary
                    :summary-data="summaryStore.summaryData"
                    @date-changed="loadDataForDate"
                    @open-health-dialog="openHealthDialog"
                    @open-meal-dialog="openMealDialog"
                    @open-poop-dialog="openPoopDialog"
                    @open-sleep-dialog="openSleepDialog"
                />

                <!-- AI Assistant section -->
                <AIAssistant />
            </v-container>
        </v-main>
        <!-- Dialog Components -->
        <MealDialog
            v-model="dialogs.meal"
            @close="dialogs.meal = false"
            @save="handleMealSaved"
        />

        <SleepDialog
            v-model="dialogs.sleep"
            @close="dialogs.sleep = false"
            @save="handleSleepSaved"
        />

        <PoopDialog
            v-model="dialogs.poop"
            @close="dialogs.poop = false"
            @save="handlePoopSaved"
        />

        <SymptomDialog
            v-model="dialogs.health"
            @close="dialogs.health = false"
            @save="handleHealthSaved"
        />
    </v-app>
</template>

<script setup lang="ts">
    import { onMounted, reactive } from 'vue'
    import { useChildrenStore } from '@/stores/children'
    import { useSummaryStore } from '@/stores/summary'
    import { useCheckinStore } from '@/stores/checkin'
    import { useMealsStore } from '@/stores/meals'
    import { useSleepStore } from '@/stores/sleep'
    import { usePoopStore } from '@/stores/poop'
    import { useHealthStore } from '@/stores/health'
    import { useRouter } from 'vue-router'

    // Import components
    import AIAssistant from '@/components/chatbot/AIAssistant.vue'
    import HealthAlert from '@/components/HealthAlert.vue'
    import CheckInsHistory from '@/components/CheckInsHistory.vue'
    import TodaysSummary from '@/components/summaryCard/TodaysSummary.vue'

    // Import dialog components
    import MealDialog from '@/components/dialog/MealDialog.vue'
    import SleepDialog from '@/components/dialog/SleepDialog.vue'
    import PoopDialog from '@/components/dialog/PoopDialog.vue'
    import SymptomDialog from '@/components/dialog/SymptomDialog.vue'

    // Use stores and composables
    const childrenStore = useChildrenStore()
    const summaryStore = useSummaryStore()
    const checkinStore = useCheckinStore()
    const mealsStore = useMealsStore()
    const sleepStore = useSleepStore()
    const poopStore = usePoopStore()
    const healthStore = useHealthStore()

    const router = useRouter()

    // Dialog states
    const dialogs = reactive({
        meal: false,
        sleep: false,
        poop: false,
        health: false,
    })

    const alert = reactive({
        show: false,
        message: '',
        type: 'success', // success | info | warning | error
    })

    const showAlert = (
        message: string,
        type: 'success' | 'info' | 'warning' | 'error' = 'success',
    ) => {
        alert.message = message
        alert.type = type
        alert.show = true

        setTimeout(() => {
            alert.show = false
        }, 3000)
    }

    // ===== SAVE HANDLERS =====

    const handleMealSave = (mealData) => {
        console.log('Saving meal data:', mealData)
        // TODO: Save to store
        dialogs.meal = false
        showAlert('Meal data saved successfully!', 'success')
    }

    const handleSleepSave = (sleepData) => {
        console.log('Saving sleep data:', sleepData)
        // TODO: Save to store
        dialogs.sleep = false
        showAlert('Sleep data saved successfully!', 'success')
    }

    const handlePoopSave = (poopData) => {
        console.log('Saving poop data:', poopData)
        // TODO: Save to store
        dialogs.poop = false
        showAlert('Poop data saved successfully!', 'success')
    }

    const handleHealthSave = (healthData) => {
        console.log('Saving health data:', healthData)
        // TODO: Save to store
        dialogs.health = false
        showAlert('Health data saved successfully!', 'success')
    }

    const handleMealSaved = async () => {
        console.log('🍽️ handleMealSaved called - Reloading meal data...')
        try {
            const currentDate = new Date()
            const dateStr = currentDate.toISOString().split('T')[0]

            // Use meals store's built-in refresh method
            if (mealsStore.refreshMealsForDate) {
                await mealsStore.refreshMealsForDate(dateStr)
                console.log('✅ Meal data reload completed successfully!')
            } else {
                console.error('❌ refreshMealsForDate method not available')
            }
        } catch (error) {
            console.error('❌ Error reloading meal data:', error)
        }
    }

    const handleSleepSaved = async () => {
        console.log('💤 handleSleepSaved called - Reloading sleep data...')
        try {
            const currentDate = new Date()
            const dateStr = currentDate.toISOString().split('T')[0]

            // Use sleep store's built-in refresh method
            if (sleepStore.refreshSleepForDate) {
                await sleepStore.refreshSleepForDate(dateStr)
                console.log('✅ Sleep data reload completed successfully!')
            }
        } catch (error) {
            console.error('❌ Error reloading sleep data:', error)
        }
    }

    const handlePoopSaved = async () => {
        console.log('💩 handlePoopSaved called - Reloading poop data...')
        try {
            const currentDate = new Date()
            const dateStr = currentDate.toISOString().split('T')[0]

            // Use poop store's built-in refresh method
            if (poopStore.refreshPoopForDate) {
                await poopStore.refreshPoopForDate(dateStr)
                console.log('✅ Poop data reload completed successfully!')
            } else {
                console.error('❌ refreshPoopForDate method not available')
            }
        } catch (error) {
            console.error('❌ Error reloading poop data:', error)
        }
    }

    const handleHealthSaved = async () => {
        console.log('🏥 handleHealthSaved called - Reloading health data...')
        try {
            const currentDate = new Date()
            const dateStr = currentDate.toISOString().split('T')[0]

            // Use health store's built-in refresh method
            if (healthStore.refreshHealthForDate) {
                await healthStore.refreshHealthForDate(dateStr)
                console.log('✅ Health data reload completed successfully!')
            } else {
                console.error('❌ refreshHealthForDate method not available')
            }
        } catch (error) {
            console.error('❌ Error reloading health data:', error)
        }
    }

    // ===== METHODS =====

    const openMealDialog = () => {
        dialogs.meal = true
    }

    const openSleepDialog = () => {
        dialogs.sleep = true
    }

    const openPoopDialog = () => {
        dialogs.poop = true
    }

    const openHealthDialog = () => {
        dialogs.health = true
    }

    // Load data for a specific date and current child
    const loadDataForDate = async (date: Date) => {
        const dateStr = date.toISOString().split('T')[0]
        console.log('🔄 loadDataForDate called for:', dateStr)

        // Force refresh by clearing caches first
        console.log('🗑️ Clearing caches for date:', dateStr)

        if (sleepStore.invalidateCache) {
            sleepStore.invalidateCache(dateStr)
        }

        // Clear caches for other stores by deleting the cached data
        // This forces a fresh fetch from the API
        try {
            // Clear meals cache
            if (mealsStore.mealsCache?.value) {
                console.log('🗑️ Clearing meals cache for:', dateStr)
                delete mealsStore.mealsCache.value[dateStr]
                console.log(
                    '🗑️ Meals cache after clearing:',
                    Object.keys(mealsStore.mealsCache.value),
                )
            }

            // Clear poop cache
            if (poopStore.poopByDate?.value) {
                console.log('🗑️ Clearing poop cache for:', dateStr)
                delete poopStore.poopByDate.value[dateStr]
                console.log(
                    '🗑️ Poop cache after clearing:',
                    Object.keys(poopStore.poopByDate.value),
                )
            }

            // Clear health cache (if applicable)
            if (healthStore.healthByDate?.value) {
                console.log('🗑️ Clearing health cache for:', dateStr)
                delete healthStore.healthByDate.value[dateStr]
                console.log(
                    '🗑️ Health cache after clearing:',
                    Object.keys(healthStore.healthByDate.value),
                )
            }
        } catch (error) {
            console.warn('Error clearing caches:', error)
        }

        // Load summary data from store
        console.log('🔄 About to call summaryStore.loadSummaryForDate')
        await summaryStore.loadSummaryForDate(
            date,
            childrenStore.currentChild.id,
        )
        console.log('✅ summaryStore.loadSummaryForDate completed')
    }

    // Handle health alert view more
    const handleHealthAlert = (alert) => {
        console.log('Health alert clicked:', alert)
        router.push({
            path: '/guidance',
            query: { tab: 'alert' },
        })
    }

    // Handle view history
    const handleViewHistory = (child) => {
        console.log('View history clicked:', child)
        router.push('/checkin')
        // Handle view history navigation
    }

    // ===== LIFECYCLE =====

    onMounted(() => {
        loadDataForDate(new Date())
    })
</script>

<style lang="scss" scoped>
    .centered-alert {
        display: flex;
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */
        margin: 0 auto; /* Center the alert box itself */
        max-width: 500px; /* Optional: Set a max width */
        min-height: 60px;

        :deep(.v-alert__content) {
            display: flex;
            align-items: center;
            width: 100%;
            gap: 8px;
        }

        :deep(.v-alert__icon) {
            margin: 0;
            align-self: center;
        }

        :deep(.v-alert__message) {
            flex: 1;
            padding: 8px 0;
            display: flex;
            align-items: center;
            justify-content: center; /* Center text if needed */
        }

        :deep(.v-alert__dismissible) {
            margin: 0;
            align-self: center;
        }
    }
</style>
