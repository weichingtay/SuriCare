<template>
  <v-form class="signup-form">
    <!-- Name Row -->
    <v-row class="mb-5">
      <v-col
        class="pr-5"
        cols="6"
      >
        <label class="field-label">Firstname</label>
        <v-text-field
          v-model="localForm.firstName"
          bg-color="white"
          color="#9E9E9E"
          density="comfortable"
          hide-details="auto"
          placeholder="Input your firstname"
          :rules="firstNameRules"
          variant="outlined"
        />
      </v-col>
      <v-col
        class="pl-5"
        cols="6"
      >
        <label class="field-label">Lastname</label>
        <v-text-field
          v-model="localForm.lastName"
          bg-color="white"
          color="#9E9E9E"
          density="comfortable"
          hide-details="auto"
          placeholder="Input your lastname"
          :rules="lastNameRules"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <!-- Email and Phone Row -->
    <v-row class="mb-5">
      <v-col
        class="pr-5"
        cols="6"
      >
        <label class="field-label">Email</label>
        <v-text-field
          v-model="localForm.email"
          bg-color="white"
          color="#9E9E9E"
          density="comfortable"
          hide-details="auto"
          placeholder="Input your email"
          :rules="emailRules"
          variant="outlined"
        />
      </v-col>
      <v-col
        class="pl-5"
        cols="6"
      >
        <label class="field-label">Phone Number</label>
        <v-text-field
          v-model="localForm.phoneNumber"
          bg-color="white"
          color="#9E9E9E"
          density="comfortable"
          hide-details="auto"
          placeholder="+60"
          :rules="phoneNumberRules"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <!-- Password Row -->
    <v-row class="mb-4">
      <v-col
        class="pr-5"
        cols="6"
      >
        <label class="field-label">Password</label>
        <v-text-field
          v-model="localForm.password"
          :append-inner-icon="
            showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          bg-color="white"
          color="#9E9E9E"
          density="comfortable"
          hide-details="auto"
          placeholder="Create password"
          :rules="passwordRules"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          @click:append-inner="$emit('toggle-password')"
        />
      </v-col>
      <v-col
        class="pl-5"
        cols="6"
      >
        <label class="field-label">Confirm Password</label>
        <v-text-field
          v-model="localForm.confirmPassword"
          :append-inner-icon="
            showConfirmPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          bg-color="white"
          color="#9E9E9E"
          density="comfortable"
          hide-details="auto"
          placeholder="Confirm password"
          :rules="confirmPasswordRules"
          :type="showConfirmPassword ? 'text' : 'password'"
          variant="outlined"
          @click:append-inner="$emit('toggle-confirm-password')"
        />
      </v-col>
    </v-row>

    <!-- Login Link -->
    <div class="text-center mb-4">
      <span class="text-body-2 text-grey-darken-1">Already have an account?
      </span>
      <v-btn
        class="pa-0 login-btn text-capitalize"
        color="primary"
        height="16.8px"
        size="small"
        variant="text"
        @click="handleLogin"
      >
        Log in
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const router = useRouter()

  const props = defineProps({
    form: {
      type: Object,
      required: true,
    },
    showPassword: {
      type: Boolean,
      default: false,
    },
    showConfirmPassword: {
      type: Boolean,
      default: false,
    },
  })

  // Validation rules
  const firstNameRules = [v => !!v || 'Firstname is required']

  const lastNameRules = [v => !!v || 'Lastname is required']

  const emailRules = [
    v => !!v || 'Email is required',
    v => /.+@.+\..+/.test(v) || 'Email must be valid',
  ]

  const phoneNumberRules = [
    v => !!v || 'Phone number is required',
    v =>
      /^\+\d{1,3}\d{7,14}$/.test(v) ||
      'Phone number must include a valid IDD code and number',
  ]

  const passwordRules = [
    v => !!v || 'Password is required',
    v => v.length >= 6 || 'Password must be at least 6 characters',
  ]

  const confirmPasswordRules = [
    v => !!v || 'Confirm password is required',
    v => v.length >= 6 || 'Confirm password must be at least 6 characters',
  ]

  const emit = defineEmits([
    'update:form',
    'toggle-password',
    'toggle-confirm-password',
  ])

  const localForm = computed({
    get: () => props.form,
    set: value => emit('update:form', value),
  })

  const handleLogin = () => {
    router.push('/login')
  }
</script>

<style scoped>
  .signup-form {
    width: 100%;
  }

  .field-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #333;
    display: block;
    margin-bottom: 4px;
  }

  .login-btn {
    font-size: 0.875rem;
    text-decoration: none;
    min-width: auto;
    height: auto;
    letter-spacing: 0.0178571429em;
  }

  :deep(.v-text-field .v-field__input) {
    padding: 12px 16px;
    min-height: 48px;
  }

  :deep(.v-label) {
    font-weight: 500;
    color: #333;
  }

  :deep(.v-field__input::placeholder) {
    color: #999;
    opacity: 1;
  }
</style>
