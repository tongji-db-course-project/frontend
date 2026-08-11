<template>
  <div class="biz-page">
    <PageHeader eyebrow="数据中心 · 盈利能力" title="毛利分析" description="对比销售收入和商品成本，分析毛利额与毛利率" />
    <section class="biz-card range-card"><el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" /><el-button type="primary" :loading="loading" @click="load">查询</el-button></section>
    <section class="biz-stats">
      <StatCard label="销售收入" :value="formatMoney(data?.totalSaleAmount)" :icon="Money" />
      <StatCard label="商品成本" :value="formatMoney(data?.totalPurchaseCost)" :icon="Wallet" tone="orange" />
      <StatCard label="毛利额" :value="formatMoney(data?.grossProfit)" :icon="TrendCharts" tone="green" />
      <StatCard label="毛利率" :value="formatPercent(data?.grossProfitRate)" :icon="PieChart" tone="purple" />
    </section>
    <div v-loading="loading" class="biz-card biz-chart-card"><h3>收入与成本构成</h3><BaseChart v-if="data" :option="profitOption" height="320px" /><el-empty v-else description="暂无毛利数据" /></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Money, PieChart, TrendCharts, Wallet } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import { statisticsApi } from '../../api/statistics'
import type { ProfitStatistics } from '../../types/statistics'
import { formatMoney } from '../../utils/format'

const data = ref<ProfitStatistics | null>(null), loading = ref(false), dateRange = ref<string[]>([])
const toDate = (date: Date) => date.toISOString().slice(0, 10)
const formatPercent = (value?: number | null) => `${(Number(value ?? 0) * 100).toFixed(2)}%`
const profitOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
  legend: { bottom: 0 },
  series: [{
    type: 'pie', radius: ['42%', '68%'], center: ['50%', '43%'],
    label: { formatter: '{b}\n{d}%' },
    data: [
      { name: '销售收入', value: data.value?.totalSaleAmount ?? 0 },
      { name: '商品成本', value: data.value?.totalPurchaseCost ?? 0 },
      { name: '毛利额', value: data.value?.grossProfit ?? 0 }
    ]
  }]
}))
async function load() { loading.value = true; try { data.value = await statisticsApi.getProfit({ startDate: dateRange.value?.[0], endDate: dateRange.value?.[1] }) } catch { data.value = null } finally { loading.value = false } }
onMounted(() => { const end = new Date(), start = new Date(); start.setDate(end.getDate() - 29); dateRange.value = [toDate(start), toDate(end)]; load() })
</script>

<style scoped>.range-card{margin-bottom:14px;display:flex;gap:9px}.range-card .el-date-editor{width:300px}</style>