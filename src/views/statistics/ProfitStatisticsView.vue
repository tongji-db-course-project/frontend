<template>
  <div class="biz-page">
    <PageHeader
      eyebrow="数据中心 · 盈利能力"
      title="毛利分析"
      description="按日期范围汇总销售收入、商品成本、毛利额和毛利率"
    />

    <section class="biz-card range-card">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        range-separator="至"
      />
      <el-button type="primary" :loading="loading" @click="load">查询</el-button>
    </section>

    <el-alert
      v-if="!available"
      title="毛利分析接口请求失败"
      description="请确认 Apifox 已为 GET /statistics/profit 配置 code=200 的响应示例。"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 14px"
    />

    <section class="biz-stats">
      <StatCard label="销售收入" :value="formatMoney(data?.totalSaleAmount)" :icon="Money" />
      <StatCard label="商品成本" :value="formatMoney(data?.totalPurchaseCost)" :icon="Wallet" tone="orange" />
      <StatCard label="毛利额" :value="formatMoney(data?.grossProfit)" :icon="TrendCharts" tone="green" />
      <StatCard label="毛利率" :value="formatPercent(data?.grossProfitRate)" :icon="PieChart" tone="purple" />
    </section>

    <section v-loading="loading" class="biz-card biz-chart-card">
      <h3>收入、成本与毛利对比</h3>
      <BaseChart v-if="data" :option="comparisonOption" height="380px" />
      <el-empty v-else description="暂无毛利数据" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Money, PieChart, TrendCharts, Wallet } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import { statisticsApi } from '../../api/statistics'
import type { ProfitStatistics } from '../../types/statistics'
import { formatMoney } from '../../utils/format'

const data = ref<ProfitStatistics | null>(null)
const loading = ref(false)
const available = ref(true)
const dateRange = ref<string[]>([])

const toDate = (date: Date) => date.toISOString().slice(0, 10)
const formatPercent = (value?: number | null) => `${(Number(value ?? 0) * 100).toFixed(2)}%`
const comparisonOption = computed(() => ({
  tooltip: { trigger: 'axis', valueFormatter: (value: number) => formatMoney(value) },
  grid: { left: 58, right: 30, top: 35, bottom: 38 },
  xAxis: { type: 'category', data: ['销售收入', '商品成本', '毛利额'] },
  yAxis: { type: 'value' },
  series: [{
    type: 'bar',
    data: [
      { value: data.value?.totalSaleAmount ?? 0, itemStyle: { color: '#1677ff' } },
      { value: data.value?.totalPurchaseCost ?? 0, itemStyle: { color: '#f59e0b' } },
      { value: data.value?.grossProfit ?? 0, itemStyle: { color: '#22b58a' } },
    ],
    barMaxWidth: 90,
    label: { show: true, position: 'top', formatter: (params: { value: number }) => formatMoney(params.value) },
  }],
}))

async function load() {
  if (dateRange.value.length !== 2) {
    ElMessage.warning('请选择统计日期范围')
    return
  }

  loading.value = true
  available.value = true
  try {
    data.value = await statisticsApi.getProfit({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
    })
  } catch {
    data.value = null
    available.value = false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const end = new Date()
  const start = new Date()
  // 开发库的种子销售数据位于 2026-05，默认查询最近 120 天以便首次联调可见。
  start.setDate(end.getDate() - 119)
  dateRange.value = [toDate(start), toDate(end)]
  load()
})
</script>

<style scoped>
.range-card { margin-bottom: 14px; display: flex; gap: 9px; }
.range-card .el-date-editor { width: 300px; }
</style>
