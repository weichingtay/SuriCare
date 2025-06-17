<template>
  <div class="text-center">
    <div
      class="profile-photo-container mx-auto mb-4"
      @click="triggerFileInput"
    >
      <v-avatar
        size="120"
        color="grey-lighten-2"
        class="profile-avatar"
      >
        <v-img
          v-if="imagePreview"
          :src="imagePreview"
          cover
        />
        <v-icon
          v-else
          size="40"
          color="grey-darken-1"
        >
          mdi-camera-plus
        </v-icon>
      </v-avatar>

      <!-- Hover overlay -->
      <div class="photo-overlay">
        <v-icon
          color="white"
          size="24"
          >mdi-camera-outline</v-icon
        >
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      style="display: none"
    />
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    modelValue: {
      type: File,
      default: null,
    },
  })

  const emit = defineEmits(['update:modelValue', 'upload'])

  const fileInput = ref(null)
  const imagePreview = ref(null)

  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue) {
        createImagePreview(newValue)
      } else {
        imagePreview.value = null
      }
    },
    { immediate: true }
  )

  const triggerFileInput = () => {
    fileInput.value.click()
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      emit('update:modelValue', file)
      emit('upload', file)
      createImagePreview(file)
    }
  }

  const createImagePreview = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
</script>

<style scoped>
  .profile-photo-container {
    position: relative;
    width: 120px;
    height: 120px;
    cursor: pointer;
  }

  .profile-avatar {
    transition: all 0.3s ease;
  }

  .photo-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .profile-photo-container:hover .photo-overlay {
    opacity: 1;
  }

  .profile-photo-container:hover .profile-avatar {
    transform: scale(1.05);
  }
</style>
