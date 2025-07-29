<template>
  <div class="signup-actions">
    <!-- OR Divider -->
    <div class="divider-section mb-5">
      <v-divider class="divider-line" />
      <span class="divider-text">OR</span>
      <v-divider class="divider-line" />
    </div>

    <!-- Google Sign Up Button -->
    <v-btn
      block
      class="mb-5 google-btn"
      size="large"
      variant="outlined"
      @click="$emit('google-sign-up')"
    >
      <div class="google-icon mr-3" />
      Sign up with Google
    </v-btn>

    <!-- Sign Up Button -->
    <v-btn
      block
      class="signup-btn"
      color="primary"
      size="large"
      @click="$emit('sign-up')"
    >
      Sign Up
    </v-btn>
  </div>
</template>

<script setup lang="ts">
  defineEmits(['sign-up', 'google-sign-up'])
</script>

<style scoped>
  .signup-actions {
    width: 100%;
  }

  .divider-section {
    display: flex;
    align-items: center;
    margin: 20px 0;
  }

  .divider-line {
    flex: 1;
  }

  .divider-text {
    margin: 0 16px;
    font-size: 0.875rem;
    color: #666;
    font-weight: 500;
  }

  .google-btn {
    background-color: white !important;
    border: solid 1.5px black !important;
    color: black !important;
    text-transform: none;
    font-weight: 500;
    letter-spacing: 0.0178571429em;
  }

  .google-icon {
    width: 22px;
    height: 22px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .signup-btn {
    background-color: #d87179 !important;
    color: white;
    text-transform: none;
    font-weight: 500;
    font-size: 1rem;
    letter-spacing: 0.0178571429em;
  }

  :deep(.v-btn__content) {
    font-size: 1rem;
  }
</style>
