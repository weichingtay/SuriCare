<template>
  <v-main>
    <!-- Navigation sidebar -->
    <NavigationSidebar />

    <!-- Top navigation bar with child selector -->
    <!-- <v-toolbar class="fixed-tabs-bar"> -->
      <!-- <v-app-bar elevation="1" color="grey-lighten-5" style="padding-left: 20px;"> -->
      <!--   <div class="d-flex align-center" style="width: 100%"> -->
      <!--     <ChildSelector /> -->
      <!--     <v-divider vertical class="mx-4" /> -->
      <!--     <ChildStats :child="currentChild" /> -->
      <!--   </div> -->
      <!-- </v-app-bar> -->
    <TopBar/>
    <!-- </v-toolbar> -->
    <router-view />
  </v-main>

  <!-- <AppFooter /> -->
</template>

<script  setup>
//
import TopBar from '@/components/TopBar.vue'
// const childStore = useChildStore()
// import { useChildStore } from '@/stores/childStore'
// import ChildSelector from '@/components/ChildSelector.vue'
// const { currentChild} = storeToRefs(childStore)
// import ChildStats from '@/components/ChildStats.vue';
import NavigationSidebar from '@/components/NavigationSidebar.vue'
</script>
