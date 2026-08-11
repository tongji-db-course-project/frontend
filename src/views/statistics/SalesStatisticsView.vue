<template>
  <div class="biz-page">
    <PageHeader eyebrow="数据中心 · 经营分析" title="销售统计" description="基于销售订单数据分析销售趋势" />
    <section class="biz-card range-card"><el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" /><el-button type="primary" :loading="loading" @click="load">查询</el-button><el-button @click="setRecentDays(30)">近 30 天</el-button></section>
    <section class="biz-stats">
      <StatCard label="销售额" :value="formatMoney(summary.sales)" :icon="Money" />
      <StatCard label="订单量" :value="summary.orders" :icon="Tickets" tone="green" />
      <StatCard label="退款金额" :value="formatMoney(summary.refunds)" :icon="Discount" tone="purple" />
      <StatCard label="净销售额" :value="formatMoney(summary.netAmount)" :icon="TrendCharts" tone="orange" />
    </section>
    <div v-loading="loading" class="biz-chart-grid">
      <section class="biz-card biz-chart-card"><h3>销售额与订单趋势</h3><BaseChart v-if="dailySales.length" :option="trendOption" height="340px" /><el-empty v-else description="当前日期范围暂无数据" /></section>
    </div>
    <section class="biz-card"><h3>每日销售明细</h3><el-table :data="dailySales" stripe border class="biz-table"><el-table-column label="日期" width="120"><template #default="{ row }">{{ formatDate(row.statDate) }}</template></el-table-column><el-table-column label="订单数" align="right"><template #default="{ row }">{{ row.orderCount }}</template></el-table-column><el-table-column label="销售额" align="right"><template #default="{ row }">{{ formatMoney(row.totalAmount) }}</template></el-table-column><el-table-column label="实付" align="right"><template #default="{ row }">{{ formatMoney(row.paidAmount) }}</template></el-table-column><el-table-column label="退款" align="right"><template #default="{ row }">{{ formatMoney(row.refundAmount) }}</template></el-table-column><el-table-column label="净额" align="right"><template #default="{ row }"><strong :class="row.netAmount >= 0 ? 'biz-positive' : 'biz-negative'">{{ formatMoney(row.netAmount) }}</strong></template></el-table-column></el-table></section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Discount, Money, Tickets, TrendCharts } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import { statisticsApi } from '../../api/statistics'
import type { SalesStatistics } from '../../types/statistics'
import { formatDate, formatMoney } from '../../utils/format'

const dailySales = ref<SalesStatistics[]>([]), loading = ref(false), dateRange = ref<string[]>([])
const toDate = (date: Date) => date.toISOString().slice(0, 10)
function setRecentDays(days: number) { const end = new Date(), start = new Date(); start.setDate(end.getDate() - days + 1); dateRange.value = [toDate(start), toDate(end)]; load() }
const summary = computed(() => {
  const sales = dailySales.value.reduce((sum, item) => sum + Number(item.paidAmount ?? 0), 0)
  const orders = dailySales.value.reduce((sum, item) => sum + Number(item.orderCount ?? 0), 0)
  const refunds = dailySales.value.reduce((sum, item) => sum + Number(item.refundAmount ?? 0), 0)
  const netAmount = dailySales.value.reduce((sum, item) => sum + Number(item.netAmount ?? 0), 0)
  return { sales, orders, refunds, netAmount }
})
const trendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['实付金额', '订单量'] },
  grid: { left: 56, right: 46, top: 42, bottom: 38 },
  xAxis: { type: 'category', data: dailySales.value.map(item => formatDate(item.statDate)) },
  yAxis: [{ type: 'value', name: '金额' }, { type: 'value', name: '订单量' }],
  series: [
    { name: '实付金额', type: 'line', smooth: true, data: dailySales.value.map(item => item.paidAmount), itemStyle: { color: '#1677ff' }, areaStyle: { color: 'rgba(22,119,255,.10)' } },
    { name: '订单量', type: 'bar', yAxisIndex: 1, data: dailySales.value.map(item => item.orderCount), itemStyle: { color: '#22b58a' } }
  ]
}))
async function load() {
  loading.value = true
  try {
    const result = await statisticsApi.getDailySales({ startDate: dateRange.value?.[0], endDate: dateRange.value?.[1] })
    dailySales.value = (result ?? []).sort((a, b) => a.statDate.localeCompare(b.statDate))
  } catch { dailySales.value = [] }
  finally { loading.value = false }
}
onMounted(() => setRecentDays(30))
</script>

<style scoped>.range-card{margin-bottom:14px;display:flex;gap:9px}.range-card .el-date-editor{width:300px}@media(max-width:600px){.range-card{flex-wrap:wrap}.range-card .el-date-editor{width:100%}}</style>