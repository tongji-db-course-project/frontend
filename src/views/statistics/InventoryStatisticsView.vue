<template>
  <div class="biz-page">
    <PageHeader eyebrow="数据中心 · 库存结构" title="库存分析" description="汇总库存规模、仓库分布和库存预警情况">
      <el-button :icon="Refresh" :loading="loading" @click="load">刷新</el-button>
    </PageHeader>
    <el-alert v-if="!available" title="库存分析聚合接口尚未提供" description="实现 GET /statistics/inventory 后即可展示仓库、分类分布和预警排行。" type="warning" show-icon :closable="false" style="margin-bottom:14px" />
    <section class="biz-stats">
      <StatCard label="库存商品" :value="data?.totalProducts ?? 0" :icon="Goods" />
      <StatCard label="预警商品" :value="data?.warningProducts ?? 0" :icon="WarningFilled" tone="orange" />
      <StatCard label="缺货商品" :value="data?.outOfStockProducts ?? 0" :icon="CircleCloseFilled" tone="red" />
      <StatCard label="库存金额" :value="formatMoney(data?.totalStockValue)" :icon="Money" tone="green" />
    </section>
    <div v-loading="loading" class="biz-chart-grid"><section class="biz-card biz-chart-card"><h3>各仓库库存分布</h3><BaseChart v-if="data?.warehouseDistribution?.length" :option="warehouseOption" height="350px" /><el-empty v-else description="暂无仓库分布数据" /></section><section class="biz-card biz-chart-card"><h3>各分类库存构成</h3><BaseChart v-if="data?.categoryDistribution?.length" :option="categoryOption" height="350px" /><el-empty v-else description="暂无分类分布数据" /></section></div>
    <section class="biz-card"><h3>库存预警排行</h3><el-table :data="data?.warningRanking || []" stripe border class="biz-table"><el-table-column type="index" label="排名" width="80" align="center" /><el-table-column prop="productName" label="商品名称" min-width="200" /><el-table-column prop="currentStock" label="当前库存" align="right" /><el-table-column prop="stockWarning" label="预警值" align="right" /><el-table-column label="库存缺口" align="right"><template #default="{ row }"><span class="biz-negative">{{ Math.max(0, row.stockWarning - row.currentStock) }}</span></template></el-table-column></el-table></section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CircleCloseFilled, Goods, Money, Refresh, WarningFilled } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import { statisticsApi } from '../../api/statistics'
import type { InventoryStatistics } from '../../types/statistics'
import { formatMoney } from '../../utils/format'

const data = ref<InventoryStatistics | null>(null), loading = ref(false), available = ref(true)
const warehouseOption = computed(() => ({ tooltip: { trigger: 'axis' }, grid: { left: 90, right: 35, top: 20, bottom: 30 }, xAxis: { type: 'value' }, yAxis: { type: 'category', data: data.value?.warehouseDistribution.map(item => item.name) ?? [] }, series: [{ type: 'bar', data: data.value?.warehouseDistribution.map(item => item.value) ?? [], itemStyle: { color: '#1677ff', borderRadius: [0, 5, 5, 0] }, label: { show: true, position: 'right' } }] }))
const categoryOption = computed(() => ({ tooltip: { trigger: 'item' }, legend: { bottom: 0 }, series: [{ type: 'pie', radius: ['42%', '68%'], center: ['50%', '43%'], data: data.value?.categoryDistribution ?? [] }] }))
async function load() { loading.value = true; available.value = true; try { data.value = await statisticsApi.getInventory() } catch { data.value = null; available.value = false } finally { loading.value = false } }
onMounted(load)
</script>
