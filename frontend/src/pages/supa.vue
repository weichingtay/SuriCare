<template>
  <section>
    <h2>Supabase connection test</h2>
    <p
      v-if="error"
      class="text-red"
    >
      {{ error }}
    </p>

    <ul v-else>
      <li
        v-for="c in caregivers"
        :key="c.id"
      >
        {{ c.username }}
        {{ c.email }}
        {{ c.relationship }}

      </li>
    </ul>
  </section>
</template>
<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { supabase } from '@/plugins/supabase'

  const caregivers = ref<unknown[]>([])
  const error = ref<string | null>(null)
  console.log('heloooooo')

  async function load () {
    const { data, error: err }: { data: unknown[] | null; error: { message: string } | null } = await supabase
      .from('primary_care_giver') // ← your table
      .select('*')
      .limit(10)

    console.log(data)
    if (err) error.value = err.message
    else caregivers.value = data ?? []
  }

  onMounted(load)
</script>
