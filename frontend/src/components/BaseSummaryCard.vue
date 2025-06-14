<template>
    <v-col
        cols="12"
        sm="6"
        md="3"
    >
        <v-card
            class="summary-card"
            elevation="0"
        >
            <!-- Card Header -->
            <div class="card-header">
                <div class="d-flex align-center">
                    <v-icon
                        color="error"
                        size="20"
                        class="mr-2"
                        >{{ icon }}</v-icon
                    >
                    <span class="card-title">{{ title }}</span>
                </div>
                <v-btn
                    size="x-small"
                    variant="flat"
                    class="check-in-btn"
                    @click="$emit('check-in')"
                >
                    Check In
                </v-btn>
            </div>

            <!-- Card Content -->
            <v-card-text class="card-content pa-0">
                <div class="content-wrapper">
                    <!-- Main Value -->
                    <div class="main-value">
                        {{ mainValue }}
                        <span
                            v-if="unit"
                            class="unit"
                            >{{ unit }}</span
                        >
                    </div>

                    <!-- Custom Content Slot -->
                    <div
                        v-if="$slots.breakdown"
                        class="breakdown-section"
                    >
                        <slot name="breakdown"></slot>
                    </div>
                </div>

                <!-- Status Note -->
                <div
                    class="status-note"
                    :class="statusClass"
                >
                    {{ statusNote }}
                </div>
            </v-card-text>
        </v-card>
    </v-col>
</template>

<script setup>
    defineProps({
        title: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            required: true,
        },
        mainValue: {
            type: [String, Number],
            required: true,
        },
        unit: {
            type: String,
            default: '',
        },
        statusNote: {
            type: String,
            default: '',
        },
        statusClass: {
            type: String,
            default: 'status-positive',
        },
    })

    defineEmits(['check-in'])
</script>

<style scoped>
</style>
