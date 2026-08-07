<template><div ref="chartElement" class="base-chart" :style="{ height }" /></template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'

echarts.use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TitleComponent, TooltipComponent, CanvasRenderer])

defineOptions({ name: 'BaseChart' })
const props = withDefaults(defineProps<{ option: EChartsCoreOption; height?: string }>(), { height: '320px' })
const chartElement = ref<HTMLElement | null>(null)
let chart: ReturnType<typeof echarts.init> | null = null

const render = () => chart?.setOption(props.option, { notMerge: true })
const resize = () => chart?.resize()

onMounted(() => {
  if (!chartElement.value) return
  chart = echarts.init(chartElement.value)
  render()
  window.addEventListener('resize', resize)
})

watch(() => props.option, render, { deep: true })
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped>.base-chart{width:100%;min-width:0}</style>
