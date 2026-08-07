<template>
  <article class="biz-stat-card">
    <span class="biz-stat-card__icon" :class="tone"><el-icon><component :is="icon" /></el-icon></span>
    <div><small>{{ label }}</small><strong>{{ value }}</strong><em v-if="hint">{{ hint }}</em></div>
  </article>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineOptions({ name: 'StatCard' })
withDefaults(defineProps<{
  label: string
  value: string | number
  hint?: string
  tone?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  icon: Component
}>(), { tone: 'blue', hint: '' })
</script>
