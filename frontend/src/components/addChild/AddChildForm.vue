<template>
  <div class="text-center">
    <div v-if="action === 'signup'">
      <h2 class="text-h4 font-weight-bold mb-2">Create a Child Profile</h2>
      <h4 class="text-h6 font-weight-regular mb-8">Let's get started! Tell us about the child you'll be logging.</h4>
    </div>

    <div v-else>
      <h2 class="text-h4 font-weight-bold mb-8">Add Child</h2>
    </div>

    <!-- Profile Photo Section -->
    <ProfilePhotoUpload
      v-model="form.photo"
      @upload="handlePhotoUpload"
      class="mb-8"
    />

    <!-- Form Fields -->
    <v-form
      ref="formRef"
      v-model="valid"
      @submit.prevent="submitForm"
    >
      <ChildNameInput
        v-model="form.name"
        :rules="nameRules"
        class="mb-6"
      />

      <GenderSelect
        v-model="form.gender"
        :rules="genderRules"
        class="mb-6"
      />

      <DateOfBirthPicker
        v-model="form.dateOfBirth"
        :rules="dateRules"
        class="mb-6"
      />

      <RelationshipSelect
        v-model="form.relationship"
        :rules="relationshipRules"
        class="mb-8"
      />

      <SubmitButton
        :disabled="!valid"
        :loading="loading"
        @click="submitForm"
      />
    </v-form>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue'
  import { useRoute } from 'vue-router'
  import ProfilePhotoUpload from './ProfilePhotoUpload.vue'
  import ChildNameInput from './ChildNameInput.vue'
  import GenderSelect from './GenderSelect.vue'
  import DateOfBirthPicker from './DateOfBirthPicker.vue'
  import RelationshipSelect from './RelationshipSelect.vue'
  import SubmitButton from './SubmitButton.vue'

  const route = useRoute()

  const emit = defineEmits(['submit'])

  const formRef = ref(null)
  const valid = ref(false)
  const loading = ref(false)

  const action = route.query.action

  const form = reactive({
    name: '',
    gender: '',
    dateOfBirth: '15 May 2025',
    relationship: '',
    photo: null,
  })

  // Validation rules
  const nameRules = [
    (v) => !!v || 'Child name is required',
    (v) => (v && v.length >= 2) || 'Name must be at least 2 characters',
  ]

  const genderRules = [(v) => !!v || 'Gender is required']

  const dateRules = [(v) => !!v || 'Date of birth is required']

  const relationshipRules = [(v) => !!v || 'Relationship is required']

  const handlePhotoUpload = (file) => {
    form.photo = file
  }

  const submitForm = async () => {
    const { valid } = await formRef.value.validate()

    if (valid) {
      loading.value = true

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        emit('submit', { ...form })

        // Reset form after successful submission
        Object.assign(form, {
          name: '',
          gender: '',
          dateOfBirth: '15 May 2025',
          relationship: '',
          photo: null,
        })

        formRef.value.reset()
      } catch (error) {
        console.error('Error submitting form:', error)
      } finally {
        loading.value = false
      }
    }
  }
</script>
