<template>
  <v-dialog
    v-model="isOpen"
    max-width="500px"
    persistent
  >
    <v-card class="checkin-dialog">
      <!-- Header -->
      <v-card-title class="dialog-header">
        <div class="header-content">
          <div class="header-left">
            <v-icon class="header-icon" size="20">mdi-sleep</v-icon>
            <span class="dialog-title">Sleep</span>
          </div>
          <v-btn
            icon
            variant="text"
            size="small"
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p class="dialog-subtitle">How did Jennie Sleep?</p>
      </v-card-title>

      <v-card-text class="dialog-content">
        <!-- Time Inputs -->
        <div class="time-section">
          <!-- Bed Time -->
          <div class="time-input-group">
            <label class="section-label">Bed Time</label>
            <div class="time-input-wrapper">
              <v-icon class="time-icon">mdi-clock-outline</v-icon>
              <input
                v-model="bedTime"
                type="time"
                class="time-input"
                placeholder="Input bed time"
              />
            </div>
          </div>

          <!-- Awake Time -->
          <div class="time-input-group">
            <label class="section-label">Awake Time</label>
            <div class="time-input-wrapper">
              <v-icon class="time-icon">mdi-clock-outline</v-icon>
              <input
                v-model="awakeTime"
                type="time"
                class="time-input"
                placeholder="Input awake time"
              />
            </div>
          </div>
        </div>

        <!-- Remarks/Notes -->
        <div class="form-section">
          <label class="section-label">Remarks/Notes</label>
          <v-textarea
            v-model="remarks"
            placeholder="Type details here"
            variant="outlined"
            rows="3"
            hide-details
            class="remarks-textarea"
          />
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn
          color="primary"
          class="save-btn"
          @click="saveSleep"
        >
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
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// Dialog state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Form data
const bedTime = ref('')
const awakeTime = ref('')
const remarks = ref('')

// Methods
const closeDialog = () => {
  isOpen.value = false
}

const saveSleep = () => {
  const sleepData = {
    type: 'sleep',
    bedTime: bedTime.value,
    awakeTime: awakeTime.value,
    remarks: remarks.value,
    timestamp: new Date()
  }
  
  emit('save', sleepData)
  closeDialog()
  
  // Reset form
  bedTime.value = ''
  awakeTime.value = ''
  remarks.value = ''
}
</script>

<style lang="scss" scoped>
.checkin-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  padding: 24px 24px 16px 24px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  color: #666;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.dialog-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-weight: 400;
}

.dialog-content {
  padding: 24px;
  background: white;
}

.time-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 20px;
  }
}

.time-input-group {
  flex: 1;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.time-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  background: white;
  transition: border-color 0.2s ease;
  
  &:focus-within {
    border-color: #666;
  }
}

.time-icon {
  color: #999;
  margin-right: 12px;
  font-size: 18px;
}

.time-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  width: 100%;
  
  &::placeholder {
    color: #999;
  }
  
  &::-webkit-calendar-picker-indicator {
    opacity: 0;
    cursor: pointer;
  }
}

.form-section {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.remarks-textarea {
  :deep(.v-field) {
    border-radius: 8px;
  }
  
  :deep(.v-field__input) {
    font-size: 14px;
    color: #333;
  }
  
  :deep(.v-field__field) {
    textarea {
      &::placeholder {
        color: #999;
      }
    }
  }
}

.dialog-actions {
  padding: 16px 24px 24px 24px;
  background: white;
}

.save-btn {
  background: #d87179 !important;
  color: white;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  padding: 0 24px;
  height: 40px;
  
  &:hover {
    background: #c85f67 !important;
  }
}
</style>