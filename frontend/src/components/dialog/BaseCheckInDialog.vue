<template>
    <v-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="600px" 
        persistent
    > <!--TODO:BUT DIFFERENT DIALOG HAS DIFFERENT MAX-WIDTH-->
        <v-card 
            class="checkin-dialog-card" 
            elevation="0" 
            rounded="12"
        >
            <!-- Checkin Dialog Header -->
            <div class="checkin-dialog-header">
                <div class="d-flex align-center">
                    <v-icon
                        :color="iconColor"
                        size="28"
                        class="mr-2"
                    >
                        {{ icon }}
                    </v-icon>
                    <span class="checkin-dialog-title">{{ title }}</span>
                </div>
                <v-btn 
                    icon="mdi-close" 
                    variant="text" 
                    size="small" 
                    color="grey"
                    @click="$emit('close')"
                    :disabled="loading"
                />
                   <!--small button size-->
                   <!-- $emit: Emit event when clicked | @click="$emit('check-in')"-Send events to parent-->
            </div>
            
            <!-- Dialog Subtitle -->
            <div 
                v-if="subtitle"
                class="dialog-subtitle"
            >
                {{ subtitle }}
            </div>
            
            <!-- Dialog Content -->
            <v-card-text class="dialog-content">

                <!-- Custom Content Slot -->
                <div
                    v-if="$slots.content" 
                    class="dialog-custom-content"
                >
                    <slot name="custom-content"></slot>
                </div> <!-- Only show if slot content exists --> 
                <!--<slot name="breakdown"> - Parent can inject custom content-->
                

                <!-- Notes Section -->
                <div class="dialog-notes-section">
                    <label class="dialog-notes-label">
                        Remark/Notes
                    </label>
                    <v-textarea
                        :model-value="notes"
                        @update:model-value="$emit('update:notes', $event)"
                        placeholder="Type details here"
                        variant="outlined"
                        rows="3"
                        hide-details
                        :disabled="loading"
                        class="notes-textarea"
                    />
                </div>
            </v-card-text>
            
            <!-- Dialog Save Button -->
            <div class="dialog-save-button-footer">
                <v-spacer />
                <v-btn 
                    variant="flat" 
                    size="large " 
                    rounded="8"
                    class="save-btn"
                    @click="$emit('save')"
                    :loading="loading"
                >
                    <v-icon class="mr-2" size="18">mdi-content-save</v-icon>
                    Save
                </v-btn>
            </div>
        </v-card>
    </v-dialog>
</template>

<script setup>
    defineProps({
        // Dialog Control
        modelValue: {
            type: Boolean,
            default: false
        },
        
        // Header Props
        title: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        iconColor: {
            type: String,
            default: 'black'
        },
        
        // Subtitle
        subtitle: {
            type: String,
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
        },
        error: {
            type: String,
            default: null
        }
    })

    defineEmits([
        'update:modelValue',
        'update:notes', 
        'save',
        'close',
        'clear-error'
    ])
</script>

<style scoped>
    .dialog-card {
        border: 1px solid #e0e0e0;
        background: white;
        margin: 0 auto;
    }

    /* Dialog Header */
    .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid #f5f5f5;
    }

    .dialog-title {
        font-size: 1.25rem;
        font-weight: 500;
        color: black;
    }

    /* Dialog Subtitle */
    .dialog-subtitle {
        padding: 12px 16px 0 16px;
        color: #666;
        font-size: 14px;
    }

    /* Dialog Content */
    .dialog-content {
        padding: 16px;
    }

    .content-section {
        margin-bottom: 16px;
    }

    /* Notes Section */
    .notes-section {
        margin-bottom: 16px;
    }

    .notes-label {
        display: block;
        margin-bottom: 12px;
        color: #333;
        font-size: 14px;
        font-weight: 500;
    }

    .notes-textarea :deep(.v-field__outline) {
        border-radius: 8px;
    }

    /* Dialog Footer */
    .dialog-footer {
        display: flex;
        align-items: center;
        padding: 16px;
        padding-top: 0;
    }

    .save-btn {
        background-color: #E57373 !important;
        color: white;
        text-transform: none;
        font-weight: 500;
        padding: 0 24px;
    }

    /* Remove default button effects */
    .v-btn {
        box-shadow: none !important;
    }

    .v-btn:hover {
        box-shadow: none !important;
    }

    /* Button text styling */
    .v-btn .v-btn__content {
        color: inherit;
        font-weight: inherit;
    }
</style>