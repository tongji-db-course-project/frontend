<template>
  <div class="biz-page">
    <PageHeader eyebrow="数据中心 · 商品表现" title="商品排行" description="按销量和销售额查看热销商品排名" />
    <section class="biz-card range-card"><el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" /><el-input-number v-model="limit" :min="5" :max="100" /><el-button type="primary" :loading="loading" @click="load">查询</el-button></section>
    <el-alert v-if="!available" title="商品排行聚合接口尚未提供" description="页面和类型已完成，后端实现 GET /statistics/products 后即可直接展示真实排行。" type="warning" show-icon :closable="false" style="margin-bottom:14px" />
    <section class="biz-stats">
      <StatCard label="参与排行商品" :value="tableData.length" :icon="Goods" />
      <StatCard label="销量冠军" :value="quantityRanking[0]?.productName || '-'" :icon="Trophy" tone="orange" />
      <StatCard label="销售额冠军" :value="amountRanking[0]?.productName || '-'" :icon="Money" tone="green" />
      <StatCard label="排行范围" :value="`Top ${limit}`" :icon="Histogram" tone="purple" />
    </section>
    <div v-loading="loading" class="biz-chart-grid"><section class="biz-card biz-chart-card"><h3>销量 Top {{ limit }}</h3><BaseChart v-if="quantityRanking.length" :option="quantityOption" height="380px" /><el-empty v-else description="暂无销量排行数据" /></section><section class="biz-card biz-chart-card"><h3>销售额 Top {{ limit }}</h3><BaseChart v-if="amountRanking.length" :option="amountOption" height="380px" /><el-empty v-else description="暂无销售额排行数据" /></section></div>
    <section class="biz-card"><h3>商品排行明细</h3><el-table :data="tableData" stripe border class="biz-table"><el-table-column prop="rank" label="排名" width="80" align="center"><template #default="{ row }"><el-tag :type="row.rank <= 3 ? 'warning' : 'info'">{{ row.rank }}</el-tag></template></el-table-column><el-table-column prop="productName" label="商品名称" min-width="200" /><el-table-column prop="saleQuantity" label="销售数量" align="right" /><el-table-column label="销售金额" align="right"><template #default="{ row }">{{ formatMoney(row.saleAmount) }}</template></el-table-column><el-table-column label="毛利" align="right"><template #default="{ row }">{{ row.grossProfit == null ? '-' : formatMoney(row.grossProfit) }}</template></el-table-column></el-table></section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Goods, Histogram, Money, Trophy } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import { statisticsApi } from '../../api/statistics'
import type { ProductRankItem } from '../../types/statistics'
import { formatMoney } from '../../utils/format'

const quantityRanking = ref<ProductRankItem[]>([]), amountRanking = ref<ProductRankItem[]>([]), loading = ref(false), available = ref(true), limit = ref(10), dateRange = ref<string[]>([])
const toDate = (date: Date) => date.toISOString().slice(0, 10)
const tableData = computed(() => { const map = new Map<number, ProductRankItem>(); [...quantityRanking.value, ...amountRanking.value].forEach(item => map.set(item.productId, item)); return [...map.values()].sort((a, b) => a.rank - b.rank) })
const quantityOption = computed(() => ({ tooltip: { trigger: 'axis' }, grid: { left: 100, right: 35, top: 15, bottom: 25 }, xAxis: { type: 'value' }, yAxis: { type: 'category', inverse: true, data: quantityRanking.value.map(item => item.productName) }, series: [{ type: 'bar', data: quantityRanking.value.map(item => item.saleQuantity), itemStyle: { color: '#1677ff', borderRadius: [0, 5, 5, 0] }, label: { show: true, position: 'right' } }] }))
const amountOption = computed(() => ({ tooltip: { trigger: 'axis', valueFormatter: (value: number) => formatMoney(value) }, grid: { left: 100, right: 45, top: 15, bottom: 25 }, xAxis: { type: 'value' }, yAxis: { type: 'category', inverse: true, data: amountRanking.value.map(item => item.productName) }, series: [{ type: 'bar', data: amountRanking.value.map(item => item.saleAmount), itemStyle: { color: '#22b58a', borderRadius: [0, 5, 5, 0] }, label: { show: true, position: 'right', formatter: '¥{c}' } }] }))
async function load() { loading.value = true; available.value = true; try { const result = await statisticsApi.getProductRanking({ startDate: dateRange.value?.[0], endDate: dateRange.value?.[1], limit: limit.value }); quantityRanking.value = result?.quantityRanking ?? []; amountRanking.value = result?.amountRanking ?? [] } catch { available.value = false; quantityRanking.value = []; amountRanking.value = [] } finally { loading.value = false } }
onMounted(() => { const end = new Date(), start = new Date(); start.setDate(end.getDate() - 29); dateRange.value = [toDate(start), toDate(end)]; load() })
</script>

<style scoped>.range-card{margin-bottom:14px;display:flex;gap:9px}.range-card .el-date-editor{width:300px}</style>
