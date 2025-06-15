<template>
  <div class="mb-6">
    <h2 class="text-body-1 font-weight-medium mb-4">
      Ask SuriAI Anything
    </h2>

    <div class="suriai-section">
      <div class="d-flex mb-4">
        <div style="width: 90px; height: 90px; border-radius: 16px; overflow: hidden;" class="mr-3">
          <v-img
            src="@/assets/logo.svg"
            contain
          />
        </div>
        <div class="d-flex flex-column flex-grow-1">
          <div class="text-body-1 font-weight-medium mb-1">
            SuriAI
          </div>
          <div class="text-body-2 text-grey suriai-description mb-3">
            Powered by AI for childcare guidance. SuriAI
            can help with sleep patterns, meal
            suggestions, development milestones, and
            more.
          </div>
          <div class="suriai-input-container">
            <v-text-field
              v-model="message"
              placeholder="Type your questions here"
              variant="outlined"
              density="comfortable"
              hide-details
              class="suriai-input"
              @keyup.enter="sendMessage"
            >
              <template v-slot:append-inner>
                <v-btn
                  icon
                  size="small"
                  color="red"
                  variant="flat"
                  @click="sendMessage"
                >
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('')

const emit = defineEmits(['send-message'])

const sendMessage = () => {
  if (message.value.trim()) {
    emit('send-message', message.value)
    message.value = ''
  }
}
</script>

<style lang="scss" scoped>
// .suriai-input :deep(.v-field__outline) {
//   border-color: #f0c6c9 !important;
// }

// .suriai-input :deep(.v-field__outline--focused) {
//   border-color: #d87179 !important;
// }

/* Try targeting the field outline start/end */
.suriai-input :deep(.v-field__outline__start),
.suriai-input :deep(.v-field__outline__notch),
.suriai-input :deep(.v-field__outline__end) 
{
  border-color: #f0c6c9 !important;
}

.suriai-input :deep(.v-field--focused .v-field__outline__start),
.suriai-input :deep(.v-field--focused .v-field__outline__notch),
.suriai-input :deep(.v-field--focused .v-field__outline__end) {
  border-color: #d87179 !important;
}

// /* Try targeting the field itself */
// .suriai-input :deep(.v-field) {
//   border: 2px solid #f0c6c9 !important;
// }

// .suriai-input :deep(.v-field--focused) {
//   border: 2px solid #d87179 !important;
// }
</style> 