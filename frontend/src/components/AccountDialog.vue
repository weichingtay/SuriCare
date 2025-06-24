<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <!-- Header -->
      <div class="header">
        <v-icon class="header-icon">mdi-account</v-icon>
        <h2 class="header-title">My Account</h2>
      </div>

      <!-- Content -->
      <div class="content">
        <!-- Profile Section -->
        <div class="section">
          <div class="field">
            <label>Name</label>
            <div class="field-content">
              <v-icon class="field-icon">mdi-account</v-icon>
              <span>{{ userProfile.name }}</span>
            </div>
          </div>

          <div class="field">
            <label>Email</label>
            <div class="field-content">
              <v-icon class="field-icon">mdi-email</v-icon>
              <span>{{ userProfile.email }}</span>
            </div>
          </div>

          <div class="field">
            <label>Role</label>
            <div class="field-content">
              <v-icon class="field-icon">mdi-shield-account</v-icon>
              <v-chip size="small" color="primary">{{ userProfile.role }}</v-chip>
            </div>
          </div>
        </div>

        <!-- Caregivers Section -->
        <div class="section">
          <h3 class="section-title">My Caregivers</h3>
          <div class="caregiver-list">
            <div class="caregiver" v-for="caregiver in caregivers" :key="caregiver.id">
              <div class="caregiver-info">
                <div class="avatar">
                  <v-icon class="avatar-icon">mdi-account</v-icon>
                </div>
                <div class="details">
                  <div class="name">{{ caregiver.name }}</div>
                  <div class="email">{{ caregiver.email }}</div>
                </div>
              </div>
              <v-select
                v-model="caregiver.accessLevel"
                :items="accessLevels"
                variant="outlined"
                density="compact"
                hide-details
                class="access-select"
              />
            </div>
          </div>
          <div class="caregiver-actions" v-if="hasAccessChanges">
            <v-btn 
              color="$app-primary" 
              variant="flat" 
              size="small"
              @click="saveAccessLevels"
            >
              Save Changes
            </v-btn>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <v-btn color="$app-primary" variant="flat" prepend-icon="mdi-pencil" block @click="editProfile">
            Edit Profile
          </v-btn>
          <v-btn color="$app-primary" variant="flat" prepend-icon="mdi-key" block @click="changePassword">
            Change Password
          </v-btn>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <v-btn variant="text" @click="dialog = false">Close</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const userProfile = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  role: 'Guardian'
}

const accessLevels = [
  { title: 'Full', value: 'full' },
  { title: 'Limited', value: 'limited' },
  { title: 'View', value: 'view' }
]

const caregivers = ref([
  { id: 1, name: 'Maria Garcia', email: 'maria.garcia@example.com', accessLevel: 'full', originalAccess: 'full' },
  { id: 2, name: 'John Smith', email: 'john.smith@example.com', accessLevel: 'partial', originalAccess: 'partial' },
  { id: 3, name: 'Lisa Chen', email: 'lisa.chen@example.com', accessLevel: 'full', originalAccess: 'full' }
])

const hasAccessChanges = computed(() => {
  return caregivers.value.some(caregiver => caregiver.accessLevel !== caregiver.originalAccess)
})

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const saveAccessLevels = () => {
  const changes = caregivers.value
    .filter(caregiver => caregiver.accessLevel !== caregiver.originalAccess)
    .map(caregiver => ({
      id: caregiver.id,
      name: caregiver.name,
      newAccess: caregiver.accessLevel,
      oldAccess: caregiver.originalAccess
    }))
  
  console.log('Saving access level changes:', changes)
  
  // Update original access levels after save
  caregivers.value.forEach(caregiver => {
    caregiver.originalAccess = caregiver.accessLevel
  })
}

const editProfile = () => console.log('Edit profile clicked')
const changePassword = () => console.log('Change password clicked')
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

/* Header */
.header {
  display: flex;
  align-items: center;
  padding: $spacing-xl;
  border-bottom: 1px solid $dialog-border;
  gap: $spacing-md;
}

.header-icon {
  color: $nav-icon-inactive-color !important;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: $dialog-text;
}

/* Content */
.content {
  padding: $spacing-xl;
}

.section {
  margin-bottom: $spacing-2xl;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 $spacing-lg 0;
  font-size: 16px;
  font-weight: 600;
  color: $dialog-text;
}

/* Profile Fields */
.field {
  margin-bottom: $spacing-lg;
}

.field:last-child {
  margin-bottom: 0;
}

.field label {
  display: block;
  margin-bottom: $spacing-sm;
  font-size: 14px;
  font-weight: 500;
  color: $field-label;
}

.field-content {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  border: 1px solid $app-grey;
  border-radius: $border-radius-md;
  background: $field-background;
  font-size: 14px;
  color: $field-text;
}

.field-icon {
  color: $nav-icon-inactive-color !important;
}

/* Caregivers */
.caregiver-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.caregiver {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  border: 1px solid $app-grey;
  border-radius: $border-radius-md;
  background: $field-background;
  gap: $spacing-md;
}

.caregiver-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  flex: 1;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  color: $nav-icon-inactive-color !important;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: $field-text;
}

.email {
  font-size: 12px;
  color: $dialog-text-secondary;
}

.access-select {
  width: 60px;
}

/* Override dropdown field styling */
:deep(.access-select .v-field) {
  min-height: 32px !important;
}

:deep(.access-select .v-field__input) {
  min-height: 32px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
}

:deep(.access-select .v-field__append-inner) {
  padding-top: 4px !important;
}

/* Caregiver Actions */
.caregiver-actions {
  margin-top: $spacing-md;
  display: flex;
  justify-content: flex-end;
}

/* Actions */
.actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

/* Footer */
.footer {
  padding: $spacing-lg $spacing-xl;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid $dialog-border;
}

/* Button overrides */
:deep(.v-btn--variant-flat) {
  color: white !important;
}

:deep(.v-btn--variant-flat .v-icon) {
  color: white !important;
}
</style>