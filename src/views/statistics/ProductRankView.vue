<template>
  <div class="biz-page">
    <PageHeader eyebrow="数据中心 · 商品表现" title="商品排行" description="按销量和销售额查看热销商品排名" />
    <section class="biz-card range-card"><el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" /><el-button type="primary" :loading="loading" @click="load">查询</el-button></section>
    <section class="biz-stats">
      <StatCard label="商品总数" :value="productRank.length" :icon="Goods" />
      <StatCard label="排名第一" :value="productRank[0]?.productName || '-'" :icon="Trophy" tone="orange" />
      <StatCard label="总销量" :value="productRank.reduce((s, i) => s + i.saleQuantity, 0)" :icon="Money" tone="green" />
    </section>
    <div v-loading="loading" class="biz-chart-grid"><section class="biz-card biz-chart-card"><h3>销量排行</h3><BaseChart v-if="productRank.length" :option="rankOption" height="380px" /><el-empty v-else description="暂无排行数据" /></section></div>
    <section class="biz-card"><h3>商品排行明细</h3><el-table :data="productRank" stripe border class="biz-table"><el-table-column type="index" label="排名" width="80" align="center"><template #default="{ $index }"><el-tag :type="$index < 3 ? 'warning' : 'info'">{{ $index + 1 }}</el-tag></template></el-table-column><el-table-column prop="productName" label="商品名称" min-width="200" /><el-table-column prop="saleQuantity" label="销售数量" align="right" /><el-table-column label="销售金额" align="right"><template #default="{ row }">{{ formatMoney(row.saleAmount) }}</template></el-table-column></el-table></section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Goods, Money, Trophy } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import { statisticsApi } from '../../api/statistics'
import type { ProductRankItem } from '../../types/statistics'
import { formatMoney } from '../../utils/format'

const productRank = ref<ProductRankItem[]>([]), loading = ref(false), dateRange = ref<string[]>([])
const toDate = (date: Date) => date.toISOString().slice(0, 10)
const rankOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 100, right: 35, top: 15, bottom: 25 },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', inverse: true, data: productRank.value.map(item => item.productName) },
  series: [{ type: 'bar', data: productRank.value.map(item => item.saleQuantity), itemStyle: { color: '#1677ff', borderRadius: [0, 5, 5, 0] }, label: { show: true, position: 'right' } }]
}))
async function load() {
  loading.value = true
  try {
    const result = await statisticsApi.getProductRank({ startDate: dateRange.value?.[0], endDate: dateRange.value?.[1] })
    productRank.value = result ?? []
  } catch { productRank.value = [] }
  finally { loading.value = false }
}
onMounted(() => { const end = new Date(), start = new Date(); start.setDate(end.getDate() - 29); dateRange.value = [toDate(start), toDate(end)]; load() })
</script>

<style scoped>.range-card{margin-bottom:14px;display:flex;gap:9px}.range-card .el-date-editor{width:300px}</style>