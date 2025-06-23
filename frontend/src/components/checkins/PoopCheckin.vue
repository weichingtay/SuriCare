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
            <v-icon class="header-icon" size="20">mdi-emoticon-poop</v-icon>
            <span class="dialog-title">Poop</span>
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
        <p class="dialog-subtitle">Poop check for Jennie</p>
      </v-card-title>

      <v-card-text class="dialog-content">
        <!-- Color Selection -->
        <div class="form-section">
          <label class="section-label">Color</label>
          <div class="color-grid">
            <button
              v-for="color in colorOptions"
              :key="color.value"
              :class="['color-option', { 'selected': selectedColor === color.value }]"
              @click="selectedColor = color.value"
            >
              <div 
                class="color-circle"
                :style="{ backgroundColor: color.hex }"
              ></div>
              <span class="color-label">{{ color.label }}</span>
            </button>
          </div>
        </div>

        <!-- Texture Selection -->
        <div class="form-section">
          <label class="section-label">Texture</label>
          <div class="texture-grid">
            <button
              v-for="texture in textureOptions"
              :key="texture.value"
              :class="['texture-option', { 'selected': selectedTexture === texture.value }]"
              @click="selectedTexture = texture.value"
            >
              <div class="texture-icon">
                <div :class="['texture-visual', `texture-${texture.value}`]"></div>
              </div>
              <span class="texture-label">{{ texture.label }}</span>
            </button>
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
          @click="savePoop"
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
const selectedColor = ref('')
const selectedTexture = ref('')
const remarks = ref('')

// Color options matching Figma design
const colorOptions = [
  { value: 'yellow', label: 'Yellow', hex: '#F9D71C' },
  { value: 'red', label: 'Red', hex: '#E53E3E' },
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  { value: 'green', label: 'Green', hex: '#38A169' },
  { value: 'black', label: 'Black', hex: '#2D3748' },
  { value: 'gray', label: 'Gray', hex: '#718096' }
]

// Texture options matching Figma design
const textureOptions = [
  { value: 'pellets', label: 'Pellets' },
  { value: 'lumpy', label: 'Lumpy' },
  { value: 'cracked', label: 'Cracked' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'soft', label: 'Soft' },
  { value: 'mushy', label: 'Mushy' },
  { value: 'watery', label: 'Watery' }
]

// Methods
const closeDialog = () => {
  isOpen.value = false
}

const savePoop = () => {
  const poopData = {
    type: 'poop',
    color: selectedColor.value,
    texture: selectedTexture.value,
    remarks: remarks.value,
    timestamp: new Date()
  }
  
  emit('save', poopData)
  closeDialog()
  
  // Reset form
  resetForm()
}

const resetForm = () => {
  selectedColor.value = ''
  selectedTexture.value = ''
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

.form-section {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

/* Color Selection Styles */
.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  max-width: 400px;
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9f9f9;
  }
  
  &.selected {
    background: #f0f0f0;
    
    .color-circle {
      border-width: 3px;
      border-color: #333;
    }
  }
}

.color-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  margin-bottom: 6px;
  transition: all 0.2s ease;
}

.color-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

/* Texture Selection Styles */
.texture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
}

.texture-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #ccc;
    background: #f9f9f9;
  }
  
  &.selected {
    background: #333;
    color: white;
    border-color: #333;
    
    .texture-visual {
      border-color: white;
    }
  }
}

.texture-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.texture-visual {
  width: 24px;
  height: 24px;
  border: 2px solid #666;
  transition: all 0.2s ease;
  
  &.texture-pellets {
    border-radius: 50%;
    background: radial-gradient(circle, #ccc 30%, transparent 30%);
  }
  
  &.texture-lumpy {
    border-radius: 30%;
    background: repeating-linear-gradient(45deg, #ccc, #ccc 3px, transparent 3px, transparent 6px);
  }
  
  &.texture-cracked {
    border-radius: 4px;
    background: linear-gradient(90deg, #ccc 40%, transparent 40%, transparent 60%, #ccc 60%);
  }
  
  &.texture-smooth {
    border-radius: 12px;
    background: #ccc;
  }
  
  &.texture-soft {
    border-radius: 8px;
    background: #ccc;
    opacity: 0.8;
  }
  
  &.texture-mushy {
    border-radius: 20px;
    background: #ccc;
    opacity: 0.6;
  }
  
  &.texture-watery {
    border-radius: 50%;
    background: radial-gradient(circle, transparent 20%, #ccc 20%, #ccc 40%, transparent 40%);
    opacity: 0.4;
  }
}

.texture-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
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