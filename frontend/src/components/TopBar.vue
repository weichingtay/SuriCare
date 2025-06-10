<template>
  <v-app-bar elevation="1" color="grey-lighten-5" style="padding-left: 20px;">
    <div class="d-flex align-center" style="width: 100%">
      <ChildSelector />
      <v-divider vertical class="mx-4" />
      <ChildStats :child="currentChild" />
    </div>
  </v-app-bar>
</template>

<script setup>
const childStore = useChildStore()
import { useChildStore } from '@/stores/childStore'
import ChildSelector from '@/components/ChildSelector.vue'
const { currentChild} = storeToRefs(childStore)
import ChildStats from '@/components/ChildStats.vue';
</script>

<style setup>
/* Sticky toolbar positioning */
.fixed-tabs-bar {
  position: -webkit-sticky;
  position: sticky;
  top: 0rem;
  z-index: 2;
}

</style>

