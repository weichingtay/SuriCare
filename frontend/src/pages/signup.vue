<template>
  <v-container
    fluid
    class="fill-height pa-0"
  >
    <v-row
      no-gutters
      class="fill-height"
    >
      <!-- Left Side - Welcome Section -->
      <v-col
        cols="12"
        md="6"
        class="d-flex align-center justify-center"
      >
        <WelcomeSection />
      </v-col>

      <!-- Right side - Sign up form -->
      <v-col
        cols="12"
        md="6"
        class="d-flex align-center justify-center pa-8"
      >
        <div
          class="w-100"
          style="max-width: 558px"
        >
          <AccountTypeSelector v-model="accountType" />
          <SignUpFormFields
            v-model:form="form"
            v-if="accountType === 'Legal Guardian'"
            :showPassword="showPassword"
            :showConfirmPassword="showConfirmPassword"
            @toggle-password="showPassword = !showPassword"
            @toggle-confirm-password="
              showConfirmPassword = !showConfirmPassword
            "
          />
          <SignUpFormFieldsWithInvitationCode
            v-model:form="form"
            v-else
            :showPassword="showPassword"
            :showConfirmPassword="showConfirmPassword"
            @toggle-password="showPassword = !showPassword"
            @toggle-confirm-password="
              showConfirmPassword = !showConfirmPassword
            "
          />
          <SignUpActions
            @sign-up="handleSignUp"
            @google-sign-up="handleGoogleSignUp"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref, reactive } from 'vue'
  import WelcomeSection from '../components/login/WelcomeSection.vue'
  import AccountTypeSelector from '../components/signup/AccountTypeSelector.vue'
  import SignUpFormFields from '../components/signup/SignUpFormFields.vue'
  import SignUpFormFieldsWithInvitationCode from '../components/signup/SignUpFormFieldsWithInvitationCode.vue'
  import SignUpActions from '../components/signup/SignUpActions.vue'

  const router = useRouter()

  const accountType = ref('Legal Guardian')
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })

  const isFormComplete = () => {
    return Object.values(form).every((value) => value.trim() !== '')
  }

  const handleSignUp = () => {
    if (!isFormComplete()) {
      console.warn('Please fill out all fields.')
      return
    }

    if (form.password !== form.confirmPassword) {
      console.warn('Passwords do not match.')
      return
    }

    console.log('Sign up with:', form)
    router.push({
      path: '/addChild',
      query: { action: 'signup'},
    })
  }

  const handleGoogleSignUp = () => {
    console.log('Sign up with Google')
    // Add your Google sign up logic here
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

  * {
    font-family: 'Inter', sans-serif !important;
  }

  .v-application {
    font-family: 'Inter', sans-serif !important;
  }

  .fill-height {
    min-height: 100vh;
    background-color: #faf9f5;
  }
</style>
