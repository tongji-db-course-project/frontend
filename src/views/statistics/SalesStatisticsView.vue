<template>
  <div class="biz-page">
    <PageHeader
      eyebrow="数据中心 · 经营分析"
      title="销售统计"
      description="按日期汇总订单金额、实收金额、退款金额和净销售额"
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
      <el-button @click="setRecentDays(120)">近 120 天</el-button>
    </section>
    <section class="biz-stats">
      <StatCard label="订单总额" :value="formatMoney(summary.total)" :icon="Money" />
      <StatCard label="实收金额" :value="formatMoney(summary.paid)" :icon="Wallet" tone="green" />
      <StatCard label="退款金额" :value="formatMoney(summary.refund)" :icon="RefreshLeft" tone="orange" />
      <StatCard label="订单量" :value="summary.orders" :icon="Tickets" tone="purple" />
    </section>
    <section v-loading="loading" class="biz-card biz-chart-card">
      <h3>销售额趋势</h3>
      <BaseChart v-if="statistics.length" :option="trendOption" height="340px" />
      <el-empty v-else description="当前日期范围暂无销售数据" />
    </section>
    <section class="biz-card">
      <h3>每日销售明细</h3>
      <el-table :data="statistics" stripe border class="biz-table">
        <el-table-column prop="statDate" label="日期" width="120" />
        <el-table-column prop="orderCount" label="订单量" align="right" />
        <el-table-column label="订单总额" align="right"><template #default="{ row }">{{ formatMoney(row.totalAmount) }}</template></el-table-column>
        <el-table-column label="实收金额" align="right"><template #default="{ row }">{{ formatMoney(row.paidAmount) }}</template></el-table-column>
        <el-table-column label="退款金额" align="right"><template #default="{ row }">{{ formatMoney(row.refundAmount) }}</template></el-table-column>
        <el-table-column label="净销售额" align="right"><template #default="{ row }">{{ formatMoney(row.netAmount) }}</template></el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Money, RefreshLeft, Tickets, Wallet } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import { statisticsApi } from '../../api/statistics'
import type { DailySalesStatistics } from '../../types/statistics'
import { formatMoney } from '../../utils/format'

const statistics = ref<DailySalesStatistics[]>([])
const loading = ref(false)
const dateRange = ref<string[]>([])
const toDate = (date: Date) => date.toISOString().slice(0, 10)

const summary = computed(() => statistics.value.reduce((result, item) => ({
  total: result.total + Number(item.totalAmount || 0),
  paid: result.paid + Number(item.paidAmount || 0),
  refund: result.refund + Number(item.refundAmount || 0),
  orders: result.orders + Number(item.orderCount || 0),
}), { total: 0, paid: 0, refund: 0, orders: 0 }))

const trendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['订单总额', '实收金额', '净销售额'] },
  grid: { left: 58, right: 32, top: 44, bottom: 38 },
  xAxis: { type: 'category', data: statistics.value.map(item => item.statDate) },
  yAxis: { type: 'value' },
  series: [
    { name: '订单总额', type: 'line', smooth: true, data: statistics.value.map(item => item.totalAmount) },
    { name: '实收金额', type: 'line', smooth: true, data: statistics.value.map(item => item.paidAmount) },
    { name: '净销售额', type: 'bar', data: statistics.value.map(item => item.netAmount) },
  ],
}))

async function load() {
  if (dateRange.value.length !== 2) return
  loading.value = true
  try {
    statistics.value = (await statisticsApi.getDailySales({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
    })).sort((a, b) => a.statDate.localeCompare(b.statDate))
  } catch {
    statistics.value = []
  } finally {
    loading.value = false
  }
}

function setRecentDays(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days + 1)
  dateRange.value = [toDate(start), toDate(end)]
  void load()
}

onMounted(() => setRecentDays(120))
</script>
