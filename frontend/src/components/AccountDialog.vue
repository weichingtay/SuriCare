<template>
  <v-dialog v-model="dialog" max-width="480" persistent scrollable>
    <v-card class="dialog-card" style="border-radius: 16px; overflow: hidden;">
      <!-- Header with close button -->
      <div class="dialog-header">
        <div class="header-left">
          <v-icon class="header-icon" size="24">mdi-account</v-icon>
          <div class="header-text">
            <h2 class="header-title">My Account</h2>
            <p class="header-subtitle">Manage your profile and settings</p>
          </div>
        </div>
        <v-btn
          class="close-btn"
          icon
          size="small"
          variant="text"
          @click="dialog = false"
        >
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <!-- Profile Section -->
        <div class="content-section">
          <div class="profile-fields">
            <div class="profile-field">
              <label class="field-label">Name</label>
              <div class="field-display">
                <v-icon class="field-icon" size="18">mdi-account</v-icon>
                <span class="field-value">{{ userProfile.name }}</span>
              </div>
            </div>

            <div class="profile-field">
              <label class="field-label">Email</label>
              <div class="field-display">
                <v-icon class="field-icon" size="18">mdi-email</v-icon>
                <span class="field-value">{{ userProfile.email }}</span>
              </div>
            </div>

            <div class="profile-field">
              <label class="field-label">Role</label>
              <div class="field-display">
                <v-icon class="field-icon" size="18">mdi-shield-account</v-icon>
                <v-chip color="light-blue" size="small" variant="flat">{{ userProfile.role }}</v-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- Caregivers Section -->
        <div class="content-section">
          <h3 class="section-title">My Caregivers</h3>
          <div class="caregiver-list">
            <div v-for="caregiver in caregivers" :key="caregiver.id" class="caregiver-item">
              <div class="caregiver-info">
                <div class="caregiver-avatar">
                  <v-icon size="18">mdi-account</v-icon>
                </div>
                <div class="caregiver-details">
                  <div class="caregiver-name">{{ caregiver.name }}</div>
                  <div class="caregiver-email">{{ caregiver.email }}</div>
                </div>
              </div>
              <v-select
                v-model="caregiver.accessLevel"
                class="access-selector"
                density="compact"
                hide-details
                :items="accessLevels"
                variant="outlined"
              />
            </div>
          </div>
          <div v-if="hasAccessChanges" class="save-changes">
            <v-btn
              color="black"
              size="small"
              variant="flat"
              @click="saveAccessLevels"
            >
              Save Changes
            </v-btn>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <v-btn
            block
            class="action-btn"
            color="#c85862"
            prepend-icon="mdi-pencil"
            variant="flat"
            @click="editProfile"
          >
            Edit Profile
          </v-btn>
          <v-btn
            block
            class="action-btn"
            color="#c85862"
            prepend-icon="mdi-key"
            variant="flat"
            @click="changePassword"
          >
            Change Password
          </v-btn>
          <v-btn
            block
            class="action-btn"
            color="#c85862"
            prepend-icon="mdi-logout"
            variant="flat"
            @click="signOut"
          >
            Sign Out
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
  })

  const emit = defineEmits(['update:modelValue'])

  const userProfile = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'Guardian',
  }

  const accessLevels = [
    { title: 'Full', value: 'full' },
    { title: 'Partial', value: 'partial' },
  ]

  const caregivers = ref([
    { id: 1, name: 'Maria Garcia', email: 'maria.garcia@example.com', accessLevel: 'full', originalAccess: 'full' },
    { id: 2, name: 'John Smith', email: 'john.smith@example.com', accessLevel: 'partial', originalAccess: 'partial' },
    { id: 3, name: 'Lisa Chen', email: 'lisa.chen@example.com', accessLevel: 'full', originalAccess: 'full' },
  ])

  const hasAccessChanges = computed(() => {
    return caregivers.value.some(caregiver => caregiver.accessLevel !== caregiver.originalAccess)
  })

  const dialog = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  })

  const saveAccessLevels = () => {
    const changes = caregivers.value
      .filter(caregiver => caregiver.accessLevel !== caregiver.originalAccess)
      .map(caregiver => ({
        id: caregiver.id,
        name: caregiver.name,
        newAccess: caregiver.accessLevel,
        oldAccess: caregiver.originalAccess,
      }))

    console.log('Saving access level changes:', changes)

    // Update original access levels after save
    caregivers.value.forEach(caregiver => {
      caregiver.originalAccess = caregiver.accessLevel
    })
  }

  const editProfile = () => console.log('Edit profile clicked')
  const changePassword = () => console.log('Change password clicked')
  const signOut = () => console.log('Sign out clicked')
</script>

<style lang="scss" scoped>
.dialog-card {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.header-icon {
  color: #666 !important;
  margin-top: 2px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #000;
  line-height: 1.2;
}

.header-subtitle {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

.close-btn {
  margin-top: -4px;
  margin-right: -4px;
}

.dialog-content {
  padding: 20px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  flex: 1;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.field-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.field-icon {
  color: #666 !important;
}

.field-value {
  font-size: 14px;
  color: #333;
}

.section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.caregiver-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.caregiver-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  gap: 16px;
}

.caregiver-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.caregiver-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.caregiver-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.caregiver-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.caregiver-email {
  font-size: 12px;
  color: #666;
}

.access-selector {
  width: 100px;
}

:deep(.access-selector .v-field) {
  min-height: 36px !important;
}

:deep(.access-selector .v-field__input) {
  min-height: 36px !important;
  padding: 6px 12px !important;
  font-size: 12px !important;
}

.save-changes {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;

}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;

}

.action-btn {
  height: 44px !important;

}

:deep(.v-btn--variant-flat) {
  color: white !important;
}

:deep(.v-btn--variant-flat .v-icon) {
  color: white !important;
}
</style>
