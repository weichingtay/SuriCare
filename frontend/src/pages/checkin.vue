<template>
    <v-app>
        <v-main style="background-color: #faf7f2">
            <v-container class="timeline-container">
                <div class="timeline-wrapper">
                    <!-- Header -->
                    <div class="timeline-header">
                        <h1
                            class="text-h4 font-weight-regular mb-8 text-center"
                        >
                            Check-in History
                        </h1>

                        <!-- Category Tabs -->
                        <div class="category-tabs mb-8">
                            <button
                                v-for="category in categories"
                                :key="category.value"
                                :class="[
                                    'category-tab',
                                    {
                                        active:
                                            selectedCategory === category.value,
                                    },
                               ]"
                                @click="selectedCategory = category.value"
                            >
                                {{ category.label }}
                            </button>
                        </div>

                        <!-- Date and View Controls -->
                        <div class="controls-row mb-8">
                            <div class="controls-group">
                                <!-- FIX: this doesnt work -->
                                <!-- Enhanced Date Picker Button -->
                                <v-menu
                                    v-model="datePickerMenu"
                                    :close-on-content-click="false"
                                    location="bottom start"
                                >
                                    <template v-slot:activator="{ props }">
                                        <button
                                            v-bind="props"
                                            class="date-picker-btn"
                                        >
                                            <v-icon
                                                start
                                                size="20"
                                                >mdi-calendar</v-icon
                                            >
                                            {{ formattedDate }}
                                            <v-icon
                                                end
                                                size="16"
                                                >mdi-chevron-down</v-icon
                                            >
                                        </button>
                                    </template>

                                    <v-card>
                                        <v-date-picker
                                            v-model="selectedDate"
                                            @update:model-value="
                                                datePickerMenu = false
                                            "
                                            color="rgba($app-primary,"
                                            0.1)
                                            !important
                                        ></v-date-picker>
                                    </v-card>
                                </v-menu>

                                <!-- View Mode Toggle -->
                                <div class="view-toggle">
                                    <button
                                        v-for="mode in viewModes"
                                        :key="mode.value"
                                        :class="[
                                            'view-btn',
                                            { active: viewMode === mode.value },
                                        ]"
                                        @click="viewMode = mode.value"
                                    >
                                        {{ mode.label }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline -->
                    <div class="timeline-content">
                        <div
                            v-if="filteredCheckins.length === 0"
                            class="text-center py-12"
                        >
                            <v-icon
                                size="48"
                                color="grey-lighten-1"
                                class="mb-3"
                                >mdi-calendar-blank</v-icon
                            >
                            <p class="text-grey">
                                No check-ins found for the selected filters.
                            </p>
                        </div>

                        <div
                            v-else
                            class="timeline-list"
                        >
                            <div
                                v-for="(checkin, index) in filteredCheckins"
                                :key="checkin.id"
                                class="timeline-item"
                            >
                                <!-- Timeline Line -->
                                <div
                                    v-if="index < filteredCheckins.length - 1"
                                    class="timeline-line"
                                ></div>

                                <div class="timeline-row">
                                    <!-- Category Icon -->
                                    <div class="timeline-icon-container">
                                        <v-avatar
                                            size="48"
                                            color="transparent"
                                            class="timeline-icon"
                                        >
                                            <v-icon
                                                size="24"
                                                color="#D87179"
                                                >{{
                                                    getCategoryIcon(
                                                        checkin.type,
                                                    )
                                                }}</v-icon
                                            >
                                        </v-avatar>
                                    </div>

                                    <!-- Date Column -->
                                    <div class="date-column">
                                        <div class="date-day">
                                            {{
                                                formatDateInfo(
                                                    checkin.timestamp,
                                                ).day
                                            }}
                                        </div>
                                        <div class="date-number">
                                            {{
                                                formatDateInfo(
                                                    checkin.timestamp,
                                                ).date
                                            }}
                                        </div>
                                        <div class="date-month">
                                            {{
                                                formatDateInfo(
                                                    checkin.timestamp,
                                                ).month
                                            }}
                                        </div>
                                    </div>

                                    <!-- Time Column -->
                                    <div class="time-column">
                                        <div class="time-value">
                                            {{ formatTime(checkin.timestamp) }}
                                        </div>
                                    </div>

                                    <!-- Content Column -->
                                    <div class="content-column">
                                        <div class="status-text">
                                            {{ formatCheckinStatus(checkin) }}
                                        </div>
                                        <div
                                            v-if="checkin.data.details"
                                            class="details-text"
                                        >
                                            {{ checkin.data.details }}
                                        </div>
                                        <div class="author-text">
                                            by {{ checkin.carerName }}
                                        </div>
                                    </div>

                                    <!-- Actions Column -->
                                    <div class="actions-column">
                                        <button
                                            class="action-btn"
                                            @click="editCheckin(checkin)"
                                            title="Edit"
                                        >
                                            <v-icon size="20"
                                                >mdi-pencil</v-icon
                                            >
                                        </button>
                                        <button
                                            class="action-btn"
                                            @click="deleteCheckin(checkin.id)"
                                            title="Delete"
                                        >
                                            <v-icon size="20"
                                                >mdi-delete</v-icon
                                            >
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue'
    import { useChildrenStore } from '@/stores/children'
    // TODO: Add checkins store import when implemented
    // import { useCheckinsStore } from '@/stores/checkins'
    // import type { CheckinData } from '@/stores/checkins'

    // Store
    const childrenStore = useChildrenStore()
    // TODO: Initialize checkins store when implemented
    // const checkinsStore = useCheckinsStore()

    // Local state for UI controls
    const selectedDate = ref(new Date('2025-05-15'))
    const selectedCategory = ref('all')
    const viewMode = ref('Daily')
    const datePickerMenu = ref(false)

    // TODO: Replace with actual checkins store data
    // Local checkins data (temporary - will be replaced with actual checkins store later)
    const checkins = ref([
        // Sample data for Jennie (ID: 1)
        {
            id: 1,
            type: 'growth',
            timestamp: new Date('2025-05-15T15:20:00'),
            childId: 1,
            carerId: 1,
            carerName: 'Dr. Smith',
            data: {
                status: 'Growth measurement',
                details: 'Height: 100cm, Weight: 20kg, Head: 45cm',
            },
        },
        {
            id: 2,
            type: 'meal',
            timestamp: new Date('2025-05-15T12:30:00'),
            childId: 1,
            carerId: 2,
            carerName: 'Sarah',
            data: {
                status: 'Had lunch',
                details: 'Vegetable puree with rice, consumed 85%',
            },
        },
        {
            id: 3,
            type: 'sleep',
            timestamp: new Date('2025-05-15T10:08:00'),
            childId: 1,
            carerId: 2,
            carerName: 'Sarah',
            data: {
                status: 'Awake',
            },
        },
        {
            id: 4,
            type: 'sleep',
            timestamp: new Date('2025-05-15T08:00:00'),
            childId: 1,
            carerId: 2,
            carerName: 'Sarah',
            data: {
                status: 'Fell asleep',
            },
        },
        {
            id: 5,
            type: 'meal',
            timestamp: new Date('2025-05-15T07:30:00'),
            childId: 1,
            carerId: 2,
            carerName: 'Sarah',
            data: {
                status: 'Had breakfast',
                details: 'Milk - 150ml, consumed 90%',
            },
        },
        {
            id: 6,
            type: 'poop',
            timestamp: new Date('2025-05-15T06:00:00'),
            childId: 1,
            carerId: 2,
            carerName: 'Sarah',
            data: {
                status: 'Diaper change',
                details: 'Brown, firm - healthy consistency',
            },
        },
        // Sample data for Alex (ID: 2)
        {
            id: 7,
            type: 'meal',
            timestamp: new Date('2025-05-15T12:00:00'),
            childId: 2,
            carerId: 1,
            carerName: 'Mike',
            data: {
                status: 'Had lunch',
                details: 'Sandwich and fruit, consumed 75%',
            },
        },
        {
            id: 8,
            type: 'health',
            timestamp: new Date('2025-05-15T14:30:00'),
            childId: 2,
            carerId: 3,
            carerName: 'Nurse Jenny',
            data: {
                status: 'Routine checkup',
                details: 'All vitals normal',
            },
        },

        // Week data for testing Weekly view
        // Monday, May 12, 2025
        {
            id: 9,
            type: 'growth',
            timestamp: new Date('2025-05-12T09:00:00'),
            childId: 1,
            carerId: 1,
            carerName: 'Dr. Smith',
            data: {
                status: 'Weekly growth check',
                details: 'Weight: 3.2kg, Height: 52cm, Head: 35cm',
            },
        },
        {
            id: 10,
            type: 'meal',
            timestamp: new Date('2025-05-12T08:30:00'),
            childId: 1,
            carerId: 2,
            carerName: 'Sarah',
            data: {
                status: 'Had breakfast',
                details: 'Milk - 120ml, consumed 80%',
            },
        },

        // Tuesday, May 13, 2025
        {
            id: 11,
            type: 'poop',
            timestamp: new Date('2025-05-13T14:20:00'),
            childId: 1,
            carerId: 1,
            carerName: 'Mike',
            data: {
                status: 'Diaper change',
                details: 'Yellow, soft consistency - normal',
            },
        },
        {
            id: 12,
            type: 'meal',
            timestamp: new Date('2025-05-13T12:15:00'),
            childId: 1,
            carerId: 1,
            carerName: 'Mike',
            data: {
                status: 'Had lunch',
                details: 'Baby puree - vegetables, consumed 60%',
            },
        },

        // Wednesday, May 14, 2025
        {
            id: 13,
            type: 'meal',
            timestamp: new Date('2025-05-14T18:45:00'),
            childId: 1,
            carerId: 2,
            carerName: 'Sarah',
            data: {
                status: 'Had dinner',
                details: 'Rice cereal with fruits, consumed 75%',
            },
        },

        // Friday, May 16, 2025
        {
            id: 14,
            type: 'meal',
            timestamp: new Date('2025-05-16T19:30:00'),
            childId: 1,
            carerId: 1,
            carerName: 'Mike',
            data: {
                status: 'Had dinner',
                details: 'Mixed vegetables and meat, consumed 85%',
            },
        },

        // Saturday, May 17, 2025
        {
            id: 15,
            type: 'health',
            timestamp: new Date('2025-05-17T11:00:00'),
            childId: 1,
            carerId: 3,
            carerName: 'Nurse Jenny',
            data: {
                status: 'Routine health check',
                details: 'All vitals normal, no fever, rash improving',
            },
        },

        // Sunday, May 18, 2025
        {
            id: 16,
            type: 'meal',
            timestamp: new Date('2025-05-18T17:15:00'),
            childId: 1,
            carerId: 1,
            carerName: 'Mike',
            data: {
                status: 'Had dinner',
                details: 'New recipe - sweet potato and chicken, consumed 95%',
            },
        },
    ])

    // Categories
    const categories = ref([
        { value: 'all', label: 'All' },
        { value: 'growth', label: 'Growth' },
        { value: 'meal', label: 'Meal' },
        { value: 'sleep', label: 'Sleep' },
        { value: 'poop', label: 'Stool' },
        { value: 'health', label: 'Health' },
    ])

    // View modes
    const viewModes = ref([
        { value: 'Daily', label: 'Daily' },
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Monthly', label: 'Monthly' },
    ])

    // Computed
    const formattedDate = computed(() => {
        const date = selectedDate.value
        const day = date.getDate()
        const month = date.toLocaleDateString('en-US', { month: 'long' })
        const year = date.getFullYear()
        return `${day} ${month} ${year}`
    })

    // Filter checkins by current child
    const checkinsByChild = computed(() => {
        // TODO: Replace with checkinsStore.getCheckinsForChild(childrenStore.currentChild.id)
        return checkins.value.filter(
            (checkin) => checkin.childId === childrenStore.currentChild.id,
        )
    })

    // Apply filters for category and date range
    const filteredCheckins = computed(() => {
        // TODO: Update to use checkins store methods for better performance
        let filtered = checkinsByChild.value

        // Apply category filter
        if (selectedCategory.value !== 'all') {
            filtered = filtered.filter(
                (checkin) => checkin.type === selectedCategory.value,
            )
        }

        // Apply date filtering based on view mode
        if (viewMode.value === 'Daily') {
            // Get the selected date in YYYY-MM-DD format
            const selectedYear = selectedDate.value.getFullYear()
            const selectedMonth = selectedDate.value.getMonth()
            const selectedDay = selectedDate.value.getDate()

            filtered = filtered.filter((checkin) => {
                const checkinDate = new Date(checkin.timestamp)
                return (
                    checkinDate.getFullYear() === selectedYear &&
                    checkinDate.getMonth() === selectedMonth &&
                    checkinDate.getDate() === selectedDay
                )
            })
        } else if (viewMode.value === 'Weekly') {
            // Show data for the week containing the selected date
            const selectedWeekStart = new Date(selectedDate.value)
            selectedWeekStart.setDate(
                selectedDate.value.getDate() - selectedDate.value.getDay(),
            )
            selectedWeekStart.setHours(0, 0, 0, 0)

            const selectedWeekEnd = new Date(selectedWeekStart)
            selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6)
            selectedWeekEnd.setHours(23, 59, 59, 999)

            filtered = filtered.filter(
                (checkin) =>
                    checkin.timestamp >= selectedWeekStart &&
                    checkin.timestamp <= selectedWeekEnd,
            )
        } else if (viewMode.value === 'Monthly') {
            // Show data for the month containing the selected date
            const selectedMonth = selectedDate.value.getMonth()
            const selectedYear = selectedDate.value.getFullYear()

            filtered = filtered.filter(
                (checkin) =>
                    checkin.timestamp.getMonth() === selectedMonth &&
                    checkin.timestamp.getFullYear() === selectedYear,
            )
        }

        return filtered.sort(
            (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
        )
    })

    // Methods
    const getCategoryIcon = (type) => {
        const icons = {
            sleep: 'mdi-sleep',
            meal: 'mdi-silverware-fork-knife',
            poop: 'mdi-emoticon-poop',
            growth: 'mdi-ruler',
            health: 'mdi-heart',
        }
        return icons[type] || 'mdi-clipboard-text'
    }

    const calculateSleepDuration = (checkin) => {
        if (
            checkin.type !== 'sleep' ||
            !checkin.data.status.toLowerCase().includes('awake')
        ) {
            return null
        }

        // TODO: Update to use checkinsStore.getCheckinsForChild() when store is implemented
        // Find the most recent "Fell asleep" entry before this awake entry for the same child
        const sleepEntries = checkinsByChild.value
            .filter(
                (entry) =>
                    entry.type === 'sleep' &&
                    entry.data.status.toLowerCase().includes('fell asleep') &&
                    entry.timestamp < checkin.timestamp,
            )
            .sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime(),
            )

        if (sleepEntries.length === 0) {
            return null
        }

        const sleepStart = sleepEntries[0].timestamp
        const sleepEnd = checkin.timestamp
        const durationMs =
            new Date(sleepEnd).getTime() - new Date(sleepStart).getTime()
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
        const durationMinutes = Math.floor(
            (durationMs % (1000 * 60 * 60)) / (1000 * 60),
        )

        if (durationHours > 0) {
            return `${durationHours}h ${durationMinutes}m`
        } else {
            return `${durationMinutes}m`
        }
    }

    const formatSleepStatus = (checkin) => {
        const duration = calculateSleepDuration(checkin)
        if (duration && checkin.data.status.toLowerCase().includes('awake')) {
            return `Awake, slept for ${duration}`
        }
        return checkin.data.status
    }

    const formatCheckinStatus = (checkin) => {
        // Handle sleep status with duration calculation
        if (checkin.type === 'sleep') {
            return formatSleepStatus(checkin)
        }

        // Handle other checkin types
        return checkin.data.status
    }

    const formatTime = (timestamp) => {
        return new Date(timestamp)
            .toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
            .toLowerCase()
    }

    const formatDateInfo = (timestamp) => {
        const date = new Date(timestamp)
        return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            date: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
        }
    }

    const deleteCheckin = (id) => {
        // TODO: Replace with checkinsStore.deleteCheckin(id) when store is implemented
        checkins.value = checkins.value.filter((checkin) => checkin.id !== id)
        console.log('Check-in deleted:', id)
    }

    const editCheckin = (checkin) => {
        console.log('Edit checkin:', checkin)
        // TODO: Implement edit functionality with checkins store
        // This will be implemented when edit functionality is added
    }

    const addCheckin = (newCheckin) => {
        // TODO: Replace with checkinsStore.addCheckin(newCheckin) when store is implemented
        const checkinWithId = {
            ...newCheckin,
            id: Math.max(...checkins.value.map((c) => c.id)) + 1,
            childId: childrenStore.currentChild.id,
            timestamp: new Date(),
        }
        checkins.value = [checkinWithId, ...checkins.value]
        console.log('Check-in added:', checkinWithId)
    }

    // Watch for child changes
    watch(
        () => childrenStore.currentChild.id,
        (newChildId) => {
            console.log(
                `Timeline updated for child: ${childrenStore.currentChild.name} (ID: ${newChildId})`,
            )
            // TODO: Add data fetching when checkins store is implemented
            // await checkinsStore.fetchCheckinsForDate(selectedDate.value.toISOString().split('T')[0])
        },
        { immediate: true },
    )

    // TODO: Add watcher for date changes when checkins store is implemented
    // watch(selectedDate, async (newDate) => {
    //   const dateStr = newDate.toISOString().split('T')[0]
    //   await checkinsStore.fetchCheckinsForDate(dateStr)
    // }, { immediate: true })

    // Initialize
    onMounted(() => {
        console.log(
            `Timeline initialized for: ${childrenStore.currentChild.name}`,
        )
        // TODO: Add initial data loading when checkins store is implemented
        // const dateStr = selectedDate.value.toISOString().split('T')[0]
        // await checkinsStore.fetchCheckinsForDate(dateStr)
    })

    // Expose methods for external components
    defineExpose({
        addCheckin,
        deleteCheckin,
        editCheckin,
    })
</script>

<style lang="scss" scoped>
    @use '@/styles/variables' as *;

    // Force beige background on the main container
    .v-main {
        background-color: $app-beige !important;
        background-image: none !important;
    }

    // Override global button styles for date picker
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

    .timeline-container {
        max-width: 800px;
        margin: 0 auto;
        padding: $spacing-xl $spacing-lg;
    }

    .timeline-wrapper {
        background: #ffffff !important;
        border-radius: $border-radius-lg;
        padding: $spacing-xl;
        box-shadow: $shadow-md;
        border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .timeline-header {
        margin-bottom: $spacing-xl;
    }

    // Header title styling
    .text-h4 {
        font-family: $font-heading;
        font-weight: 600;
        color: $app-text-primary;
        letter-spacing: -0.025em;
    }

    /* Category Tabs Styling */
    .category-tabs {
        display: flex;
        justify-content: center;
        gap: $spacing-xl;
        border-bottom: 1px solid $glass-border;
        padding-bottom: $spacing-sm;
    }

    .category-tab {
        background: none;
        border: none;
        cursor: pointer;
        font-family: $font-primary;
        text-transform: none;
        font-weight: 500;
        font-size: 16px;
        letter-spacing: -0.01em;
        min-width: auto;
        padding: $spacing-sm 0;
        height: auto;
        border-radius: 0;
        border-bottom: 2px solid transparent;
        transition: $transition-base;
        color: $app-text-secondary;

        &.active {
            color: $app-primary;
            border-bottom-color: $app-primary;
            font-weight: 600;
        }

        &:hover {
            color: $app-primary;
        }
    }

    /* Controls Section */
    .controls-row {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .controls-group {
        display: flex;
        align-items: center;
        gap: $spacing-md;
    }

    /* Date Picker Button */
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

    /* View Toggle */
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

    /* Timeline Content */
    .timeline-content {
        position: relative;
    }

    .timeline-list {
        position: relative;
    }

    .timeline-item {
        position: relative;
        margin-bottom: $spacing-xl;
    }

    .timeline-line {
        position: absolute;
        left: 24px;
        top: 48px;
        bottom: -#{$spacing-xl};
        width: 1px;
        background: linear-gradient(
            180deg,
            $glass-border 0%,
            rgba($app-primary, 0.2) 50%,
            $glass-border 100%
        );
        z-index: 1;
    }

    .timeline-row {
        display: flex;
        align-items: flex-start;
        gap: $spacing-md;
    }

    .timeline-icon-container {
        position: relative;
        z-index: 2;
    }

    .timeline-icon {
        border: 1px solid $glass-pink-border;
        background: $glass-white;
        backdrop-filter: blur($glass-blur-sm);
        box-shadow: $shadow-sm;
    }

    /* Timeline Columns */
    .date-column {
        text-align: center;
        min-width: 60px;
        margin-top: $spacing-xs;
    }

    .date-day {
        font-family: $font-primary;
        font-size: 12px;
        color: $app-text-muted;
        font-weight: 500;
        text-transform: uppercase;
        line-height: 1.2;
        letter-spacing: 0.5px;
    }

    .date-number {
        font-family: $font-heading;
        font-size: 32px;
        font-weight: 700;
        color: $app-text-primary;
        line-height: 1;
        margin: 2px 0;
    }

    .date-month {
        font-family: $font-primary;
        font-size: 12px;
        color: $app-text-muted;
        font-weight: 500;
        line-height: 1.2;
    }

    .time-column {
        min-width: 80px;
        margin-top: $spacing-xs;
    }

    .time-value {
        font-family: $font-primary;
        font-size: 16px;
        font-weight: 600;
        color: $app-text-primary;
        line-height: 1.2;
    }

    .content-column {
        flex: 1;
        margin-top: $spacing-xs;
    }

    .status-text {
        font-family: $font-primary;
        font-size: 16px;
        font-weight: 500;
        color: $app-text-primary;
        line-height: 1.3;
        margin-bottom: $spacing-xs;
        letter-spacing: -0.01em;
    }

    .details-text {
        font-family: $font-primary;
        font-size: 14px;
        color: $app-text-secondary;
        line-height: 1.3;
        margin-bottom: 6px;
    }

    .author-text {
        font-family: $font-child;
        font-size: 12px;
        color: $app-text-muted;
        font-weight: 500;
        line-height: 1.2;
    }

    /* Action Buttons */
    .actions-column {
        display: flex;
        gap: $spacing-xs;
        margin-top: $spacing-xs;
    }

    .action-btn {
        background: $glass-white;
        border: 1px solid $glass-border;
        cursor: pointer;
        width: 32px;
        height: 32px;
        min-width: 32px;
        border-radius: $border-radius-sm;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: $transition-base;
        backdrop-filter: blur($glass-blur-sm);

        &:hover {
            background: $glass-white-light;
            border-color: $app-primary;
            box-shadow: $shadow-sm;
        }

        .v-icon {
            color: $app-grey;
            transition: $transition-base;
        }

        &:hover .v-icon {
            color: $app-primary;
        }
    }

    /* Empty state styling */
    .text-center {
        .v-icon {
            color: $app-text-muted;
        }

        p {
            font-family: $font-primary;
            color: $app-text-muted;
            font-size: 16px;
        }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .timeline-container {
            padding: $spacing-md;
        }

        .category-tabs {
            gap: $spacing-md;
            flex-wrap: wrap;
        }

        .controls-row {
            justify-content: center;
        }

        .controls-group {
            flex-direction: column;
            gap: $spacing-sm;
            align-items: stretch;
        }

        .date-picker-btn {
            min-width: 200px;
        }

        .timeline-row {
            gap: $spacing-sm;
        }

        .date-number {
            font-size: 24px;
        }
    }
</style>
