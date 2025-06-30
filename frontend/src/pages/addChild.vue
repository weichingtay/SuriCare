<template>
  <v-container
    class="fill-height"
    fluid
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        lg="4"
        md="6"
        sm="8"
      >
        <v-card
          class="pa-8"
          elevation="0"
          style="background-color: transparent;"
        >
          <AddChildForm @submit="handleSubmit" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import AddChildForm from '../components/addChild/AddChildForm.vue'

  const handleSubmit = childData => {
    console.log('Child data submitted:', childData)
    // Handle form submission here
  }
</script>
