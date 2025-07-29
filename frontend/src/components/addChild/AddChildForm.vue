<template>
  <div class="text-center">
    <div v-if="action === 'signup'">
      <h2 class="text-h4 font-weight-bold mb-2">Create a Child Profile</h2>
      <h4 class="text-h6 font-weight-regular mb-8">
        Let's get started! Tell us about the child you'll be logging.
      </h4>
    </div>

    <div v-else>
      <h2 class="text-h4 font-weight-bold mb-8">Add Child</h2>
    </div>

    <!-- Profile Photo Section -->
    <ProfilePhotoUpload
      v-model="form.photo"
      class="mb-8"
      @upload="handlePhotoUpload"
    />

    <!-- Form Fields (Create Child) -->
    <v-form
      ref="formRef"
      v-model="valid"
      @submit.prevent="submitForm"
      v-if="action === 'signup'"
    >
      <ChildNameInput
        v-model="form.name"
        class="mb-6"
        :rules="nameRules"
      />

      <GenderSelect
        v-model="form.gender"
        class="mb-6"
        :rules="genderRules"
      />

      <DateOfBirthPicker
        v-model="form.dateOfBirth"
        class="mb-6"
        :rules="dateRules"
      />

      <RelationshipSelect
        v-model="form.relationship"
        class="mb-8"
        :rules="relationshipRules"
      />

      <SubmitButton
        :disabled="!valid"
        :loading="loading"
        @click="submitForm"
      />
    </v-form>

    <!-- Form Fields (Add Child) -->
    <v-form
      ref="formRef"
      v-model="valid"
      @submit.prevent="submitForm"
      v-else
    >
      <v-row>
        <v-col cols="6">
          <h2 class="text-sm-left font-weight-regular mb-2">
            Basic Information
          </h2>
          <ChildNameInput
            v-model="form.name"
            class="mb-6 mr-5"
            :rules="nameRules"
          />

          <GenderSelect
            v-model="form.gender"
            class="mb-6 mr-5"
            :rules="genderRules"
          />

          <DateOfBirthPicker
            v-model="form.dateOfBirth"
            class="mb-6 mr-5"
            :rules="dateRules"
          />

          <RelationshipSelect
            v-model="form.relationship"
            class="mb-8 mr-5"
            :rules="relationshipRules"
          />
        </v-col>
        <v-col cols="6">
          <h2 class="text-sm-left font-weight-regular mb-2 ml-5">
            Allergies & Preferences
          </h2>
          <AllergicToMedicineInput
            v-model="form.allergicToMedicine"
            class="mb-6 ml-5"
            :rules="allergicToMedicineRules"
          />

          <AllergicToFoodInput
            v-model="form.allergicToFood"
            class="mb-6 ml-5"
            :rules="allergicToFoodRules"
          />

          <OtherAllergiesInput
            v-model="form.otherAllergies"
            class="mb-6 ml-5"
            :rules="otherAllergiesRules"
          />

          <FoodPreferencesInput
            v-model="form.foodPreferences"
            class="mb-8 ml-5"
            :rules="foodPreferencesRules"
          />
        </v-col>
      </v-row>

      <SubmitButton
        :disabled="!valid"
        :loading="loading"
        @click="submitForm"
      />
    </v-form>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import ProfilePhotoUpload from './ProfilePhotoUpload.vue'
  import ChildNameInput from './ChildNameInput.vue'
  import GenderSelect from './GenderSelect.vue'
  import DateOfBirthPicker from './DateOfBirthPicker.vue'
  import RelationshipSelect from './RelationshipSelect.vue'
  import SubmitButton from './SubmitButton.vue'
  import AllergicToMedicineInput from './AllergicToMedicineInput.vue'
  import AllergicToFoodInput from './AllergicToFoodInput.vue'
  import OtherAllergiesInput from './OtherAllergiesInput.vue'
  import FoodPreferencesInput from './FoodPreferencesInput.vue'

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
    allergicToMedicine: '',
    allergicToFood: '',
    otherAllergies: '',
    foodPreferences: '',
  })

  // Validation rules
  const nameRules = [
    (v) => !!v || 'Child name is required',
    (v) => (v && v.length >= 2) || 'Name must be at least 2 characters',
  ]

  const genderRules = [(v) => !!v || 'Gender is required']

  const dateRules = [(v) => !!v || 'Date of birth is required']

  const relationshipRules = [(v) => !!v || 'Relationship is required']

  const allergicToMedicineRules = [
    (v) => !!v || 'Allergic to medicine is required',
  ]

  const allergicToFoodRules = [(v) => !!v || 'Allergic to medicine is required']

  const otherAllergiesRules = [(v) => !!v || 'Other allergies is required']

  const foodPreferencesRules = [(v) => !!v || 'Food preferences is required']

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
          allergicToMedicine: '',
          allergicToFood: '',
          otherAllergies: '',
          foodPreferences: '',
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
