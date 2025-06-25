<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Relationship to Child
    </v-label>
    <v-select
      v-model="selectedRelationship"
      :items="relationshipOptions"
      placeholder="Select a relationship"
      variant="outlined"
      :rules="rules"
      hide-details="auto"
      :loading="isRelationshipLoading"
      :disabled="isRelationshipLoading"
      @update:modelValue="handleSelection"
    />
  </div>
</template>

<script setup>
  import { ref, watch, computed } from 'vue'

  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
    rules: {
      type: Array,
      default: () => [],
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const selectedRelationship = ref(props.modelValue)

  // Use dynamic options from database
  import { useFormOptions } from '@/composables/useFormOptions'

  const {
    relationshipOptions: relationshipOptionsData,
    isLoading: isRelationshipLoading
  } = useFormOptions()

  // Transform to match expected format for VSelect
  const relationshipOptions = computed(() => 
    relationshipOptionsData.value.map(option => ({
      title: option.label,
      value: option.value
    }))
  )

  watch(
    () => props.modelValue,
    (newValue) => {
      selectedRelationship.value = newValue
    }
  )

  const handleSelection = () => {
    emit('update:modelValue', selectedRelationship.value)
  }
</script>
