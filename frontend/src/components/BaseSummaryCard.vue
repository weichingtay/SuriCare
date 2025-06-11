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
                    color="error"
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
    .summary-card {
        background: white;
        border: 1px solid #f0f0f0;
        border-radius: 12px;
        padding: 16px;
        height: 100%;
        min-height: 200px;
    }

    .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
    }

    .card-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
    }

    .check-in-btn {
        font-size: 10px !important;
        padding: 4px 8px !important;
        height: 24px !important;
        min-width: auto !important;
        text-transform: none !important;
    }

    .card-content {
        padding: 0 !important;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 120px;
    }

    .content-wrapper {
        flex: 0 1 auto;
    }

    .main-value {
        font-size: 28px;
        font-weight: 600;
        color: #333;
        line-height: 1;
        margin-bottom: 16px;
    }

    .unit {
        font-size: 14px;
        font-weight: 400;
        color: #666;
    }

    .breakdown-section {
        margin-bottom: 12px;
    }

    .status-note {
        font-size: 12px;
        margin-top: auto;
        line-height: 1.3;
        padding-top: 8px;
    }

    .status-positive {
        color: #4caf50;
    }

    .status-negative {
        color: #f44336;
    }

    .status-warning {
        color: #ff9800;
    }

    .status-neutral {
        color: #666;
    }
</style>
