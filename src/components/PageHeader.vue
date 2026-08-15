<template>
  <header class="biz-page-head">
    <div>
      <p>{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <span v-if="description">{{ description }}</span>
    </div>
    <div class="biz-page-head__actions"><slot /></div>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: 'PageHeader' })
defineProps<{ title: string; eyebrow: string; description?: string }>()
</script>
