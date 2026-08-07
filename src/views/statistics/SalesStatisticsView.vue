<template>
  <div class="biz-page">
    <PageHeader eyebrow="数据中心 · 经营分析" title="销售统计" description="基于每日营业结转数据分析销售趋势、订单和支付构成" />
    <section class="biz-card range-card"><el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" /><el-button type="primary" :loading="loading" @click="load">查询</el-button><el-button @click="setRecentDays(30)">近 30 天</el-button></section>
    <section class="biz-stats">
      <StatCard label="销售额" :value="formatMoney(summary.sales)" :icon="Money" />
      <StatCard label="订单量" :value="summary.orders" :icon="Tickets" tone="green" />
      <StatCard label="客单价" :value="formatMoney(summary.average)" :icon="TrendCharts" tone="orange" />
      <StatCard label="优惠金额" :value="formatMoney(summary.discount)" :icon="Discount" tone="purple" />
    </section>
    <div v-loading="loading" class="biz-chart-grid">
      <section class="biz-card biz-chart-card"><h3>销售额与订单趋势</h3><BaseChart v-if="settlements.length" :option="trendOption" height="340px" /><el-empty v-else description="当前日期范围暂无结转数据" /></section>
      <section class="biz-card biz-chart-card"><h3>支付方式构成</h3><BaseChart v-if="settlements.length" :option="paymentOption" height="340px" /><el-empty v-else description="暂无支付数据" /></section>
    </div>
    <section class="biz-card biz-chart-card"><h3>优惠构成</h3><BaseChart v-if="settlements.length" :option="discountOption" height="300px" /><el-empty v-else description="暂无优惠数据" /></section>
    <section class="biz-card"><h3>每日结转明细</h3><el-table :data="settlements" stripe border class="biz-table"><el-table-column label="日期" width="120"><template #default="{ row }">{{ formatDate(row.settlementDate) }}</template></el-table-column><el-table-column label="销售额" align="right"><template #default="{ row }">{{ formatMoney(row.totalSales) }}</template></el-table-column><el-table-column prop="orderCount" label="订单量" align="right" /><el-table-column label="现金" align="right"><template #default="{ row }">{{ formatMoney(row.cashAmount) }}</template></el-table-column><el-table-column label="微信" align="right"><template #default="{ row }">{{ formatMoney(row.wechatAmount) }}</template></el-table-column><el-table-column label="支付宝" align="right"><template #default="{ row }">{{ formatMoney(row.alipayAmount) }}</template></el-table-column><el-table-column label="状态" width="90" align="center"><template #default="{ row }"><span class="biz-status" :class="row.status === '已确认' ? 'green' : 'blue'">{{ row.status }}</span></template></el-table-column></el-table></section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Discount, Money, Tickets, TrendCharts } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import { statisticsApi } from '../../api/statistics'
import type { DailySettlement } from '../../types/statistics'
import { formatDate, formatMoney } from '../../utils/format'

const settlements = ref<DailySettlement[]>([]), loading = ref(false), dateRange = ref<string[]>([])
const toDate = (date: Date) => date.toISOString().slice(0, 10)
function setRecentDays(days: number) { const end = new Date(), start = new Date(); start.setDate(end.getDate() - days + 1); dateRange.value = [toDate(start), toDate(end)]; load() }
const summary = computed(() => { const sales = settlements.value.reduce((sum, item) => sum + Number(item.totalSales ?? 0), 0); const orders = settlements.value.reduce((sum, item) => sum + Number(item.orderCount ?? 0), 0); const discount = settlements.value.reduce((sum, item) => sum + Number(item.promotionDiscount ?? 0) + Number(item.memberDiscount ?? 0) + Number(item.couponDeduct ?? 0) + Number(item.pointDeduct ?? 0), 0); return { sales, orders, discount, average: orders ? sales / orders : 0 } })
const trendOption = computed(() => ({ tooltip: { trigger: 'axis' }, legend: { data: ['销售额', '订单量'] }, grid: { left: 56, right: 46, top: 42, bottom: 38 }, xAxis: { type: 'category', data: settlements.value.map(item => formatDate(item.settlementDate)) }, yAxis: [{ type: 'value', name: '销售额' }, { type: 'value', name: '订单量' }], series: [{ name: '销售额', type: 'line', smooth: true, data: settlements.value.map(item => item.totalSales), itemStyle: { color: '#1677ff' }, areaStyle: { color: 'rgba(22,119,255,.10)' } }, { name: '订单量', type: 'bar', yAxisIndex: 1, data: settlements.value.map(item => item.orderCount), itemStyle: { color: '#22b58a' } }] }))
const paymentOption = computed(() => ({ tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' }, legend: { bottom: 0 }, series: [{ type: 'pie', radius: ['45%', '70%'], center: ['50%', '43%'], label: { formatter: '{b}\n{d}%' }, data: [{ name: '现金', value: settlements.value.reduce((sum, item) => sum + Number(item.cashAmount ?? 0), 0) }, { name: '微信', value: settlements.value.reduce((sum, item) => sum + Number(item.wechatAmount ?? 0), 0) }, { name: '支付宝', value: settlements.value.reduce((sum, item) => sum + Number(item.alipayAmount ?? 0), 0) }] }] }))
const discountOption = computed(() => ({ tooltip: { trigger: 'axis' }, grid: { left: 80, right: 30, top: 20, bottom: 30 }, xAxis: { type: 'value' }, yAxis: { type: 'category', data: ['促销优惠', '会员折扣', '优惠券', '积分抵扣'] }, series: [{ type: 'bar', data: ['promotionDiscount', 'memberDiscount', 'couponDeduct', 'pointDeduct'].map(key => settlements.value.reduce((sum, item) => sum + Number(item[key as keyof DailySettlement] ?? 0), 0)), itemStyle: { color: '#8b5cf6', borderRadius: [0, 5, 5, 0] }, label: { show: true, position: 'right', formatter: '¥{c}' } }] }))
async function load() { loading.value = true; try { const result = await statisticsApi.getDailySettlements({ page: 1, size: 366, startDate: dateRange.value?.[0], endDate: dateRange.value?.[1] }); settlements.value = (result?.list ?? []).sort((a, b) => a.settlementDate.localeCompare(b.settlementDate)) } catch { settlements.value = [] } finally { loading.value = false } }
onMounted(() => setRecentDays(30))
</script>

<style scoped>.range-card{margin-bottom:14px;display:flex;gap:9px}.range-card .el-date-editor{width:300px}@media(max-width:600px){.range-card{flex-wrap:wrap}.range-card .el-date-editor{width:100%}}</style>
