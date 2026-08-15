<template>
  <div class="biz-page">
    <PageHeader
      eyebrow="数据中心 · 商品表现"
      title="商品排行"
      description="后端按销量返回 Top 10，并在返回结果中对比销售额"
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
      <el-input-number v-model="limit" :min="5" :max="10" />
      <el-button type="primary" :loading="loading" @click="load">查询</el-button>
    </section>

    <el-alert
      v-if="!available"
      title="商品排行接口请求失败"
      description="请确认 Apifox 已为 GET /statistics/products/rank 配置 code=200 的响应示例。"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 14px"
    />

    <section class="biz-stats">
      <StatCard label="参与排行商品" :value="quantityRanking.length" :icon="Goods" />
      <StatCard label="销量冠军" :value="quantityRanking[0]?.productName || '-'" :icon="Trophy" tone="orange" />
      <StatCard label="销售额冠军" :value="amountRanking[0]?.productName || '-'" :icon="Money" tone="green" />
      <StatCard label="展示范围" :value="`Top ${limit}`" :icon="Histogram" tone="purple" />
    </section>

    <div v-loading="loading" class="biz-chart-grid">
      <section class="biz-card biz-chart-card">
        <h3>销量 Top {{ limit }}</h3>
        <BaseChart v-if="quantityRanking.length" :option="quantityOption" height="380px" />
        <el-empty v-else description="暂无销量排行数据" />
      </section>
      <section class="biz-card biz-chart-card">
        <h3>返回商品销售额对比</h3>
        <BaseChart v-if="amountRanking.length" :option="amountOption" height="380px" />
        <el-empty v-else description="暂无销售额数据" />
      </section>
    </div>

    <section class="biz-card">
      <h3>商品排行明细</h3>
      <el-table :data="quantityRanking" stripe border class="biz-table">
        <el-table-column prop="rank" label="销量排名" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.rank <= 3 ? 'warning' : 'info'">{{ row.rank }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="商品名称" min-width="200" />
        <el-table-column prop="saleQuantity" label="销售数量" align="right" />
        <el-table-column label="销售金额" align="right">
          <template #default="{ row }">{{ formatMoney(row.saleAmount) }}</template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Goods, Histogram, Money, Trophy } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import BaseChart from '../../components/charts/BaseChart.vue'
import { statisticsApi } from '../../api/statistics'
import type { ProductRankItem } from '../../types/statistics'
import { formatMoney } from '../../utils/format'

type RankedProduct = ProductRankItem & { rank: number }

const products = ref<ProductRankItem[]>([])
const loading = ref(false)
const available = ref(true)
const limit = ref(10)
const dateRange = ref<string[]>([])

const toDate = (date: Date) => date.toISOString().slice(0, 10)
const quantityRanking = computed<RankedProduct[]>(() =>
  [...products.value]
    .sort((a, b) => b.saleQuantity - a.saleQuantity)
    .slice(0, limit.value)
    .map((item, index) => ({ ...item, rank: index + 1 })),
)
const amountRanking = computed<RankedProduct[]>(() =>
  [...products.value]
    .sort((a, b) => b.saleAmount - a.saleAmount)
    .slice(0, limit.value)
    .map((item, index) => ({ ...item, rank: index + 1 })),
)
const quantityOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 100, right: 35, top: 15, bottom: 25 },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', inverse: true, data: quantityRanking.value.map(item => item.productName) },
  series: [{
    type: 'bar',
    data: quantityRanking.value.map(item => item.saleQuantity),
    itemStyle: { color: '#1677ff', borderRadius: [0, 5, 5, 0] },
    label: { show: true, position: 'right' },
  }],
}))
const amountOption = computed(() => ({
  tooltip: { trigger: 'axis', valueFormatter: (value: number) => formatMoney(value) },
  grid: { left: 100, right: 45, top: 15, bottom: 25 },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', inverse: true, data: amountRanking.value.map(item => item.productName) },
  series: [{
    type: 'bar',
    data: amountRanking.value.map(item => item.saleAmount),
    itemStyle: { color: '#22b58a', borderRadius: [0, 5, 5, 0] },
    label: { show: true, position: 'right', formatter: '¥{c}' },
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
    products.value = await statisticsApi.getProductRanking({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
    })
  } catch {
    products.value = []
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
