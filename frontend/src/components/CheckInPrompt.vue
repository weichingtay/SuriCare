<!-- CheckInPrompt.vue -->
<template>
  <v-card class="mb-6" elevation="1">
    <v-card-text>
      <div class="d-flex align-center mb-3">
        <h2 class="text-h6">Check In</h2>
        <v-btn
          icon="mdi-plus"
          size="small"
          variant="tonal"
          color="pink"
          class="ml-auto"
          @click="openCheckIn"
        ></v-btn>
      </div>
      <p class="text-body-2 text-grey">
        Log in {{ childName }}'s details including meal, sleep, mood, milestones, and incidents.
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChildStore } from '../stores/childStore'
import { storeToRefs } from 'pinia'

const router = useRouter()
const childStore = useChildStore()
const { currentChild } = storeToRefs(childStore)

const childName = computed(() => currentChild.value.name)

const openCheckIn = () => {
  router.push('/check-in')
}
</script> 