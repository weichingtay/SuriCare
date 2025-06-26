<template>
  <div class="text-center">
    <!-- SuriCare Logo/Mascot -->
    <div class="mb-6">
      <v-avatar class="mr-4" rounded="0" size="249">
        <v-img alt="SuriAI" src="@/assets/logo_wo_bg.png" />
      </v-avatar>
    </div>

    <!-- Welcome Text -->
    <h2 class="welcome-title mb-2">Welcome to SuriCare</h2>
    <p class="welcome-subtitle">
      Log your child details and get personalized suggestions using SuriCare
    </p>
  </div>
</template>

<script setup lang="ts">
// No reactive data needed for this component
</script>

<style scoped>
.welcome-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
}

.welcome-subtitle {
  font-size: 1rem;
  line-height: 1.4;
  max-width: 558px;
  margin: 0 auto;
}
</style>
