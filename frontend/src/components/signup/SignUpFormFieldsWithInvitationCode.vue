<template>
  <v-form class="signup-form">
    <!-- Name Row -->
    <v-row class="mb-5">
      <v-col
        cols="6"
        class="pr-5"
      >
        <label class="field-label">Firstname</label>
        <v-text-field
          v-model="localForm.firstName"
          placeholder="Input your firstname"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          bg-color="white"
          color="#9E9E9E"
          :rules="firstNameRules"
        />
      </v-col>
      <v-col
        cols="6"
        class="pl-5"
      >
        <label class="field-label">Lastname</label>
        <v-text-field
          v-model="localForm.lastName"
          placeholder="Input your lastname"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          bg-color="white"
          color="#9E9E9E"
          :rules="lastNameRules"
        />
      </v-col>
    </v-row>

    <!-- Email and Phone Row -->
    <v-row class="mb-5">
      <v-col
        cols="6"
        class="pr-5"
      >
        <label class="field-label">Email</label>
        <v-text-field
          v-model="localForm.email"
          placeholder="Input your email"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          bg-color="white"
          color="#9E9E9E"
          :rules="emailRules"
        />
      </v-col>
      <v-col
        cols="6"
        class="pl-5"
      >
        <label class="field-label">Phone Number</label>
        <v-text-field
          v-model="localForm.phoneNumber"
          placeholder="+60"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          bg-color="white"
          color="#9E9E9E"
          :rules="phoneNumberRules"
        />
      </v-col>
    </v-row>

    <!-- Password Row -->
    <v-row class="mb-4">
      <v-col
        cols="6"
        class="pr-5"
      >
        <label class="field-label">Password</label>
        <v-text-field
          v-model="localForm.password"
          placeholder="Create password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          bg-color="white"
          color="#9E9E9E"
          :rules="passwordRules"
          :append-inner-icon="
            showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append-inner="$emit('toggle-password')"
        />
      </v-col>
      <v-col
        cols="6"
        class="pl-5"
      >
        <label class="field-label">Confirm Password</label>
        <v-text-field
          v-model="localForm.confirmPassword"
          placeholder="Confirm password"
          :type="showConfirmPassword ? 'text' : 'password'"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          bg-color="white"
          color="#9E9E9E"
          :rules="confirmPasswordRules"
          :append-inner-icon="
            showConfirmPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append-inner="$emit('toggle-confirm-password')"
        />
      </v-col>
    </v-row>

    <!-- Share Code Row -->
    <v-row class="mb-5">
      <v-col
        cols="12"
        class="pr-5"
      >
        <label class="field-label">Invitation Code</label>
        <v-text-field
          v-model="localForm.invitationCode"
          placeholder="Invitation code"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          bg-color="white"
          color="#9E9E9E"
          :rules="invitationCodeRules"
        />
      </v-col>
    </v-row>

    <!-- Login Link -->
    <div class="text-center mb-4">
      <span class="text-body-2 text-grey-darken-1"
        >Already have an account?
      </span>
      <v-btn
        variant="text"
        size="small"
        color="primary"
        class="pa-0 login-btn text-capitalize"
        height="16.8px"
        @click="handleLogin"
      >
        Log in
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
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
  const firstNameRules = [(v) => !!v || 'Firstname is required']

  const lastNameRules = [(v) => !!v || 'Lastname is required']

  const emailRules = [
    (v) => !!v || 'Email is required',
    (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
  ]

  const phoneNumberRules = [
    (v) => !!v || 'Phone number is required',
    (v) =>
      /^\+\d{1,3}\d{7,14}$/.test(v) ||
      'Phone number must include a valid IDD code and number',
  ]

  const passwordRules = [
    (v) => !!v || 'Password is required',
    (v) => v.length >= 6 || 'Password must be at least 6 characters',
  ]

  const confirmPasswordRules = [
    (v) => !!v || 'Confirm password is required',
    (v) => v.length >= 6 || 'Confirm password must be at least 6 characters',
  ]

  const invitationCodeRules = [(v) => !!v || 'Invitation code is required']

  const emit = defineEmits([
    'update:form',
    'toggle-password',
    'toggle-confirm-password',
  ])

  const localForm = computed({
    get: () => props.form,
    set: (value) => emit('update:form', value),
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
