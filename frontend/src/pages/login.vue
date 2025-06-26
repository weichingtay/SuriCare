<template>
  <v-container
    class="fill-height pa-0"
    fluid
  >
    <v-row
      class="fill-height"
      no-gutters
    >
      <!-- Left Side - Welcome Section -->
      <v-col
        class="d-flex align-center justify-center"
        cols="12"
        md="6"
      >
        <WelcomeSection />
      </v-col>

      <!-- Right Side - Login Form -->
      <v-col
        class="d-flex align-center justify-center"
        cols="12"
        md="6"
      >
        <LoginForm />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import WelcomeSection from '../components/login/WelcomeSection.vue'
  import LoginForm from '../components/login/LoginForm.vue'
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
