<template>
  <div class="biz-page">
    <PageHeader eyebrow="数据中心 · 盈利能力" title="毛利分析" description="对比销售收入、商品成本和毛利趋势" />
    <section class="biz-card range-card"><el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" /><el-select v-model="groupBy"><el-option label="按日" value="day" /><el-option label="按周" value="week" /><el-option label="按月" value="month" /></el-select><el-button type="primary" :loading="loading" @click="load">查询</el-button></section>
    <el-alert v-if="!available" title="毛利聚合接口尚未提供" description="毛利必须由后端根据完整销售明细与采购成本计算。实现 GET /statistics/profit 后本页可直接展示。" type="warning" show-icon :closable="false" style="margin-bottom:14px" />
    <section class="biz-stats">
      <StatCard label="销售收入" :value="formatMoney(data?.totalSales)" :icon="Money" />
      <StatCard label="商品成本" :value="formatMoney(data?.totalCost)" :icon="Wallet" tone="orange" />
      <StatCard label="毛利额" :value="formatMoney(data?.grossProfit)" :icon="TrendCharts" tone="green" />
      <StatCard label="毛利率" :value="formatPercent(data?.grossMargin)" :icon="PieChart" tone="purple" />
    </section>
    <section v-loading="loading" class="biz-card biz-chart-card"><h3>收入、成本与毛利趋势</h3><BaseChart v-if="data?.trend?.length" :option="trendOption" height="380px" /><el-empty v-else description="暂无毛利趋势数据" /></section>
    <section class="biz-card"><h3>毛利明细</h3><el-table :data="data?.trend || []" stripe border class="biz-table"><el-table-column prop="date" label="日期" width="130" /><el-table-column label="销售收入" align="right"><template #default="{ row }">{{ formatMoney(row.salesAmount) }}</template></el-table-column><el-table-column label="商品成本" align="right"><template #default="{ row }">{{ formatMoney(row.costAmount) }}</template></el-table-column><el-table-column label="毛利额" align="right"><template #default="{ row }"><strong :class="row.grossProfit >= 0 ? 'biz-positive' : 'biz-negative'">{{ formatMoney(row.grossProfit) }}</strong></template></el-table-column><el-table-column label="毛利率" align="right"><template #default="{ row }">{{ formatPercent(row.salesAmount ? row.grossProfit / row.salesAmount : 0) }}</template></el-table-column></el-table></section>
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

const data = ref<ProfitStatistics | null>(null), loading = ref(false), available = ref(true), dateRange = ref<string[]>([]), groupBy = ref<'day' | 'week' | 'month'>('day')
const toDate = (date: Date) => date.toISOString().slice(0, 10)
const formatPercent = (value?: number | null) => `${(Number(value ?? 0) * 100).toFixed(2)}%`
const trendOption = computed(() => ({ tooltip: { trigger: 'axis' }, legend: { data: ['销售收入', '商品成本', '毛利额'] }, grid: { left: 58, right: 30, top: 48, bottom: 32 }, xAxis: { type: 'category', data: data.value?.trend.map(item => item.date) ?? [] }, yAxis: { type: 'value' }, series: [{ name: '销售收入', type: 'line', smooth: true, data: data.value?.trend.map(item => item.salesAmount) ?? [], itemStyle: { color: '#1677ff' } }, { name: '商品成本', type: 'line', smooth: true, data: data.value?.trend.map(item => item.costAmount) ?? [], itemStyle: { color: '#f59e0b' } }, { name: '毛利额', type: 'bar', data: data.value?.trend.map(item => item.grossProfit) ?? [], itemStyle: { color: '#22b58a' } }] }))
async function load() { loading.value = true; available.value = true; try { data.value = await statisticsApi.getProfit({ startDate: dateRange.value?.[0], endDate: dateRange.value?.[1], groupBy: groupBy.value }) } catch { data.value = null; available.value = false } finally { loading.value = false } }
onMounted(() => { const end = new Date(), start = new Date(); start.setDate(end.getDate() - 29); dateRange.value = [toDate(start), toDate(end)]; load() })
</script>

<style scoped>.range-card{margin-bottom:14px;display:flex;gap:9px}.range-card .el-date-editor{width:300px}.range-card .el-select{width:110px}</style>
