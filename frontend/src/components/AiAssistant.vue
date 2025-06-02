<!-- AiAssistant.vue -->
<template>
  <v-card elevation="1" class="mb-6">
    <v-card-text>
      <div class="d-flex align-center mb-3">
        <v-avatar size="40" class="mr-3" rounded="0">
          <v-img 
            height="90%"
            :src="aiAvatarUrl"
          />
        </v-avatar>
        <div>
          <h3 class="text-h6">Ask SuriAI About Your Child</h3>
          <p class="text-body-2 text-grey">
            Powered by AI for childcare guidance. SuriAI can help with sleep patterns, meal suggestions, development milestones, and more.
          </p>
        </div>
      </div>
      <v-text-field
        v-model="question"
        placeholder="Type your questions here"
        variant="outlined"
        density="compact"
        append-inner-icon="mdi-send"
        hide-details
        @click:append-inner="handleSendQuestion"
        @keyup.enter="handleSendQuestion"
      ></v-text-field>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const aiAvatarUrl = "https://uceadaa513ecb56fd2611040f0d8.previews.dropboxusercontent.com/p/thumb/ACo1DUHf751zfAZxyz0qT1KOEa_AJGEMPb_b4b_Ig4QsJVht7ny7fCUB7v2ZNMkL2Si5TEhWpX6X0wo_oIVfEbyotojkgbsDvjtkV-WT2BWxKpkPm4HgQJaEz3a-yPN7Ga0RARrMS7pQmCtLCPlJshg9GG-3knZ8UlwKWTzdA5ZCeJDcp2BCsXUX7cPrlVH1ADUV6gjAlgXjQCicO_vxkiPbU4in2fSMBSytcQVu5g4OHvMOZmyGU6I_l1chCo7yDG7vofBtuCkNBWaf636ljMrTylXiMenHEotc_v77JWbDgabQdwURSTilq5v0PysTHb2JQafzpaIhMae-VcfcspQczNukeSLVstel4t8fgMgZ2_7qf8ZQrbGxcioIZyTlFgU/p.png"

const question = ref('')

const handleSendQuestion = () => {
  if (question.value.trim()) {
    // TODO: Implement AI chat functionality
    console.log('Sending question:', question.value)
    question.value = ''
  }
}
</script> 