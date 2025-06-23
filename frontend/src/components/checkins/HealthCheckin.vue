<template>
  <v-dialog
    v-model="localDialog"
    max-width="500px"
    persistent
  >
    <v-card class="symptoms-checkin-dialog">
      <!-- Header -->
      <v-card-title class="dialog-header">
        <div class="header-content">
          <h3 class="dialog-title">Symptoms</h3>
          <p class="dialog-subtitle">{{ childName }}</p>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="closeDialog"
        />
      </v-card-title>

      <v-divider />

      <!-- Content -->
      <v-card-text class="dialog-content">
        <!-- Symptoms Selection -->
        <div class="form-section">
          <label class="section-label">Symptoms</label>
          <div class="symptoms-grid">
            <button
              v-for="symptom in symptoms"
              :key="symptom.value"
              :class="['symptom-button', { active: formData.selected.includes(symptom.value) }]"
              @click="toggleSymptom(symptom.value)"
            >
              <v-icon size="16" :color="symptom.color">{{ symptom.icon }}</v-icon>
              <span>{{ symptom.label }}</span>
            </button>
          </div>
        </div>

        <!-- Temperature Section -->
        <div class="form-section">
          <label class="section-label">Temperature</label>
          <div class="temperature-section">
            <div class="temperature-input-group">
              <input
                v-model="formData.temperature"
                type="number"
                step="0.1"
                min="35"
                max="42"
                class="temperature-input"
                placeholder="36.5"
              />
              <span class="temperature-unit">°C</span>
            </div>
            <div class="temperature-indicators">
              <div 
                v-for="indicator in temperatureIndicators"
                :key="indicator.value"
                :class="['temp-indicator', { active: getTemperatureCategory() === indicator.value }]"
              >
                <v-icon size="14" :color="indicator.color">{{ indicator.icon }}</v-icon>
                <span>{{ indicator.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Severity Level -->
        <div class="form-section">
          <label class="section-label">Overall Severity</label>
          <div class="severity-buttons">
            <button
              v-for="severity in severityLevels"
              :key="severity.value"
              :class="['severity-button', { active: formData.severity === severity.value }]"
              @click="formData.severity = severity.value"
            >
              <v-icon size="16" :color="severity.color">{{ severity.icon }}</v-icon>
              <span>{{ severity.label }}</span>
            </button>
          </div>
        </div>

        <!-- Duration -->
        <div class="form-section">
          <label class="section-label">Duration</label>
          <div class="duration-buttons">
            <button
              v-for="duration in durations"
              :key="duration.value"
              :class="['duration-button', { active: formData.duration === duration.value }]"
              @click="formData.duration = duration.value"
            >
              {{ duration.label }}
            </button>
          </div>
        </div>

        <!-- Medication Given -->
        <div class="form-section">
          <label class="section-label">Medication Given</label>
          <div class="medication-section">
            <div class="medication-toggle">
              <button
                :class="['toggle-button', { active: formData.medicationGiven }]"
                @click="formData.medicationGiven = !formData.medicationGiven"
              >
                <v-icon size="16">{{ formData.medicationGiven ? 'mdi-check' : 'mdi-plus' }}</v-icon>
                <span>{{ formData.medicationGiven ? 'Medication Given' : 'Add Medication' }}</span>
              </button>
            </div>
            <div v-if="formData.medicationGiven" class="medication-details">
              <input
                v-model="formData.medicationName"
                type="text"
                class="medication-input"
                placeholder="Medication name"
              />
              <input
                v-model="formData.medicationDosage"
                type="text"
                class="medication-input"
                placeholder="Dosage"
              />
              <input
                v-model="formData.medicationTime"
                type="time"
                class="medication-input"
              />
            </div>
          </div>
        </div>

        <!-- Photo Upload -->
        <div class="form-section">
          <label class="section-label">Photo (Optional)</label>
          <div class="photo-section">
            <button class="photo-upload-button" @click="handlePhotoUpload">
              <v-icon size="20">mdi-camera</v-icon>
              <span>{{ formData.photo ? 'Change Photo' : 'Add Photo' }}</span>
            </button>
            <div v-if="formData.photo" class="photo-preview">
              <img :src="formData.photo" alt="Uploaded photo" class="preview-image" />
              <button class="remove-photo" @click="formData.photo = null">
                <v-icon size="16">mdi-close</v-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Remarks Section -->
        <div class="form-section">
          <label class="section-label">Remark/Notes</label>
          <textarea
            v-model="formData.remarks"
            class="form-textarea"
            placeholder="Type details here"
            rows="3"
          ></textarea>
        </div>
      </v-card-text>

      <!-- Footer -->
      <v-divider />
      <v-card-actions class="dialog-footer">
        <v-btn
          variant="outlined"
          @click="closeDialog"
          class="cancel-btn"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="saveSymptoms"
          class="save-btn"
        >
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
  },
  childName: {
    type: String,
    default: 'Jennie'
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// Local dialog state
const localDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Form data
const formData = ref({
  selected: [],
  temperature: '',
  severity: '',
  duration: '',
  medicationGiven: false,
  medicationName: '',
  medicationDosage: '',
  medicationTime: '',
  photo: null,
  remarks: ''
})

// Symptoms options
const symptoms = [
  { value: 'fever', label: 'Fever', icon: 'mdi-thermometer', color: 'red' },
  { value: 'cough', label: 'Cough', icon: 'mdi-account-voice', color: 'orange' },
  { value: 'runny_nose', label: 'Runny Nose', icon: 'mdi-water', color: 'blue' },
  { value: 'stuffy_nose', label: 'Stuffy Nose', icon: 'mdi-nose', color: 'grey' },
  { value: 'sore_throat', label: 'Sore Throat', icon: 'mdi-emoticon-sick', color: 'pink' },
  { value: 'rash', label: 'Rash', icon: 'mdi-circle-outline', color: 'purple' },
  { value: 'vomiting', label: 'Vomiting', icon: 'mdi-emoticon-sick', color: 'green' },
  { value: 'diarrhea', label: 'Diarrhea', icon: 'mdi-water-alert', color: 'brown' },
  { value: 'constipation', label: 'Constipation', icon: 'mdi-clock-alert', color: 'grey' },
  { value: 'fussy', label: 'Fussy/Irritable', icon: 'mdi-emoticon-cry', color: 'orange' },
  { value: 'lethargy', label: 'Lethargy', icon: 'mdi-sleep', color: 'blue' },
  { value: 'loss_appetite', label: 'Loss of Appetite', icon: 'mdi-silverware-fork-knife', color: 'grey' }
]

const temperatureIndicators = [
  { value: 'normal', label: 'Normal', color: 'green', icon: 'mdi-check-circle' },
  { value: 'low_fever', label: 'Low Fever', color: 'orange', icon: 'mdi-alert-circle' },
  { value: 'high_fever', label: 'High Fever', color: 'red', icon: 'mdi-alert' }
]

const severityLevels = [
  { value: 'mild', label: 'Mild', icon: 'mdi-emoticon-happy', color: 'green' },
  { value: 'moderate', label: 'Moderate', icon: 'mdi-emoticon-neutral', color: 'orange' },
  { value: 'severe', label: 'Severe', icon: 'mdi-emoticon-sad', color: 'red' }
]

const durations = [
  { value: 'few_hours', label: 'Few Hours' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'full_day', label: 'Full Day' },
  { value: 'few_days', label: 'Few Days' },
  { value: 'week_plus', label: 'Week+' }
]

// Computed temperature category
const getTemperatureCategory = () => {
  const temp = parseFloat(formData.value.temperature)
  if (!temp || temp < 35) return ''
  if (temp >= 35 && temp < 37.5) return 'normal'
  if (temp >= 37.5 && temp < 39) return 'low_fever'
  if (temp >= 39) return 'high_fever'
  return ''
}

// Methods
const toggleSymptom = (symptom) => {
  const index = formData.value.selected.indexOf(symptom)
  if (index > -1) {
    formData.value.selected.splice(index, 1)
  } else {
    formData.value.selected.push(symptom)
  }
}

const handlePhotoUpload = () => {
  // In a real app, this would open camera/gallery
  console.log('Photo upload clicked')
  // For demo purposes, we'll just set a placeholder
  formData.value.photo = 'data:image/placeholder'
}

const closeDialog = () => {
  localDialog.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    selected: [],
    temperature: '',
    severity: '',
    duration: '',
    medicationGiven: false,
    medicationName: '',
    medicationDosage: '',
    medicationTime: '',
    photo: null,
    remarks: ''
  }
}

const saveSymptoms = () => {
  const symptomsData = {
    type: 'symptoms',
    timestamp: new Date().toISOString(),
    data: { ...formData.value }
  }
  
  emit('save', symptomsData)
  closeDialog()
}
</script>

<style scoped>
.symptoms-checkin-dialog {
  border-radius: 12px;
}

.dialog-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  flex: 1;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.dialog-subtitle {
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
}

.dialog-content {
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.symptoms-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.symptom-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.symptom-button:hover {
  border-color: #1976d2;
}

.symptom-button.active {
  border-color: #1976d2;
  background: #e3f2fd;
}

.temperature-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.temperature-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.temperature-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.temperature-input:focus {
  outline: none;
  border-color: #1976d2;
}

.temperature-unit {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.temperature-indicators {
  display: flex;
  gap: 8px;
}

.temp-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  background: #f5f5f5;
  font-size: 12px;
  transition: all 0.2s;
}

.temp-indicator.active {
  background: #e3f2fd;
  color: #1976d2;
}

.severity-buttons {
  display: flex;
  gap: 8px;
}

.severity-button {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.severity-button:hover {
  border-color: #1976d2;
}

.severity-button.active {
  border-color: #1976d2;
  background: #e3f2fd;
}

.duration-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.duration-button {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.duration-button:hover {
  border-color: #1976d2;
}

.duration-button.active {
  border-color: #1976d2;
  background: #e3f2fd;
}

.medication-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.medication-toggle {
  display: flex;
}

.toggle-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.toggle-button:hover {
  border-color: #1976d2;
}

.toggle-button.active {
  border-color: #1976d2;
  background: #e3f2fd;
}

.medication-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.medication-input {
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.medication-input:focus {
  outline: none;
  border-color: #1976d2;
}

.photo-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo-upload-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.photo-upload-button:hover {
  border-color: #1976d2;
  background: #f5f5f5;
}

.photo-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.remove-photo {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #ff4444;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #1976d2;
}

.dialog-footer {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  min-width: 80px;
}

.save-btn {
  min-width: 80px;
}
</style>