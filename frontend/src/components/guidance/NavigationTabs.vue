<template>
  <div class="mb-6">
    <v-tabs v-model="activeTab" class="mb-4" slider-color="#D87179">
      <v-tab
        value="guidance"
        class="text-capitalize text-subtitle-1"
        :class="{ inactive: activeTab != 'guidance' }"
      >
        Guidance
      </v-tab>
      <v-tab value="alert" class="text-capitalize text-subtitle-1">
        <div class="d-flex align-center">
          <v-badge color="#FF5252" content="25" class="ml-2" floating
            >Alert</v-badge
          >
        </div>
      </v-tab>
      <v-tab
        value="saved"
        class="text-capitalize text-subtitle-1"
        :class="{ inactive: activeTab != 'saved' }"
      >
        Saved
      </v-tab>
    </v-tabs>
  </div>
</template>

<script setup>
import { ref } from "vue";

const activeTab = ref("guidance");

// Emit the active tab to parent component
const emit = defineEmits(["tab-changed"]);

// Watch for tab changes and emit to parent
import { watch } from "vue";
watch(activeTab, (newTab) => {
  emit("tab-changed", newTab);
});
</script>

<style scoped>
.inactive {
  color: #797675;
}

/* Override global v-btn styling for tabs only */
:deep(.v-tab.v-btn) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  border-radius: 0 !important;
  text-transform: none !important;
  font-weight: normal !important;
  min-width: auto !important;
  padding: 12px 16px !important;
}

:deep(.v-tab.v-btn:hover) {
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.v-tab.v-btn:focus) {
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.v-tab.v-btn.v-tab--selected) {
  background: transparent !important;
  box-shadow: none !important;
}
</style>
