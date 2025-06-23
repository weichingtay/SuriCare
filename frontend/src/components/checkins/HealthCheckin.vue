<template>
  <v-dialog
    v-model="isOpen"
    max-width="600px"
    persistent
    class="modern-dialog"
  >
    <v-card class="dialog-card">
      <!-- Header -->
      <v-card-title class="dialog-title">
        <div class="title-row">
          <div class="title-left">
            <v-icon size="20">mdi-thermometer</v-icon>
            <h3>Symptoms</h3>
          </div>
          <v-btn icon variant="text" size="small" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p class="subtitle">Does Jennie have any symptoms?</p>
      </v-card-title>

      <v-card-text class="dialog-body">
        <!-- Symptoms Selection -->
        <div class="section">
          <label class="label">Symptoms</label>
          <div class="options-row">
            <button
              v-for="symptom in symptomOptions"
              :key="symptom.value"
              :class="['option-btn', { 'selected': selectedSymptoms.includes(symptom.value) }]"
              @click="toggleSymptom(symptom.value)"
            >
              <v-icon size="16">{{ symptom.icon }}</v-icon>
              {{ symptom.label }}
            </button>
          </div>
        </div>

        <!-- Log Photo -->
        <div class="section">
          <label class="label">Log Photo</label>
          <div class="photo-upload">
            <v-icon size="48" color="grey-lighten-1">mdi-cloud-upload</v-icon>
            <p class="upload-text">Upload a File</p>
            <p class="upload-subtext">Click to browse, or<br>drag & drop a file here</p>
            <input
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              class="file-input"
            />
          </div>
        </div>

        <!-- Remarks -->
        <div class="section">
          <label class="label">Remarks/Notes</label>
          <div class="custom-textarea">
            <textarea
              v-model="remarks"
              placeholder="Type details here"
              rows="2"
            ></textarea>
          </div>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn class="save-btn" @click="saveSymptoms">
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
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedSymptoms = ref([])
const uploadedFile = ref(null)
const remarks = ref('')

const symptomOptions = [
  { value: 'cough', label: 'Cough', icon: 'mdi-account-voice' },
  { value: 'fever', label: 'Fever', icon: 'mdi-thermometer' },
  { value: 'cold', label: 'Cold', icon: 'mdi-water' },
  { value: 'rash', label: 'Rash', icon: 'mdi-circle-outline' },
  { value: 'other', label: 'Other', icon: 'mdi-dots-horizontal' }
]

const toggleSymptom = (symptom) => {
  const index = selectedSymptoms.value.indexOf(symptom)
  if (index > -1) {
    selectedSymptoms.value.splice(index, 1)
  } else {
    selectedSymptoms.value.push(symptom)
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadedFile.value = file
  }
}

const closeDialog = () => {
  isOpen.value = false
}

const saveSymptoms = () => {
  emit('save', {
    type: 'symptoms',
    symptoms: selectedSymptoms.value,
    photo: uploadedFile.value,
    remarks: remarks.value,
    timestamp: new Date()
  })
  closeDialog()
  selectedSymptoms.value = []
  uploadedFile.value = null
  remarks.value = ''
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.dialog-card {
  background: $dialog-background;
  border: 1px solid $dialog-border;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-lg;
}

.dialog-title {
  background: linear-gradient(135deg, rgba($app-primary, 0.1) 0%, rgba($app-primary-light, 0.05) 100%);
  border-bottom: 1px solid $dialog-border;
  padding: $spacing-lg;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.title-left {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  
  h3 {
    font-family: $font-heading;
    font-size: 20px;
    font-weight: 600;
    color: $dialog-text;
    margin: 0;
  }
  
  .v-icon {
    color: $dialog-text-secondary;
  }
}

.subtitle {
  font-family: $font-primary;
  font-size: 14px;
  color: $dialog-text-secondary;
  margin: 0;
}

.dialog-body {
  padding: $spacing-md $spacing-lg;
}

.section {
  margin-bottom: $spacing-lg;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  display: block;
  font-family: $font-primary;
  font-size: 14px;
  font-weight: 500;
  color: $dialog-text;
  margin-bottom: $spacing-md;
}

.options-row {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: $spacing-sm $spacing-lg;
  border: 1px solid $dialog-border;
  border-radius: $border-radius-lg;
  background: white;
  color: $dialog-text;
  font-family: $font-primary;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: $app-primary-light;
    background: $glass-white-light;
  }
  
  &.selected {
    border-color: $app-primary;
    background: white;
  }
}

.photo-upload {
  position: relative;
  border: 1px dashed $app-primary;
  border-radius: $border-radius-lg;
  padding: $spacing-4xl $spacing-lg;
  text-align: center;
  cursor: pointer;
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: $app-primary;
    background: $glass-white-light;
  }
}

.upload-text {
  font-family: $font-primary;
  font-size: 16px;
  font-weight: 500;
  color: $dialog-text;
  margin: $spacing-md 0 $spacing-sm 0;
}

.upload-subtext {
  font-family: $font-primary;
  font-size: 14px;
  color: $dialog-text-secondary;
  margin: 0;
  line-height: 1.4;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.custom-textarea {
  border: 1px solid $app-primary;
  border-radius: $border-radius-lg;
  background: white;
  
  textarea {
    width: 100%;
    padding: $spacing-md;
    border: none;
    outline: none;
    background: transparent;
    font-family: $font-primary;
    font-size: 14px;
    color: $field-text;
    resize: vertical;
    
    &::placeholder {
      color: $field-label;
    }
  }
}

.dialog-actions {
  padding: $spacing-md $spacing-lg $spacing-lg;
  gap: $spacing-md;
}

.save-btn {
  background: white;
  color: $app-primary;
  border: 1px solid $app-primary;
  font-weight: 600;
  
  &:hover {
    background: $glass-white-light;
  }
}
</style>