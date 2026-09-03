<template>
  <div class="biz-page">
    <PageHeader
      eyebrow="数据中心 · 库存运营"
      title="库存周转率监控"
      description="统计周期内商品周转情况，识别慢周转与呆滞积压商品，辅助经营决策"
    />

    <section class="biz-card filter-card">
      <div class="range-row">
        <el-select v-model="query.periodType" class="period-type" @change="applyPeriodRange">
          <el-option label="月度" value="month" />
          <el-option label="季度" value="quarter" />
          <el-option label="半年度" value="halfYear" />
          <el-option label="年度" value="year" />
          <el-option label="自定义" value="custom" />
        </el-select>
        <template v-if="query.periodType === 'month'">
          <el-select v-model="periodYear" class="period-year" placeholder="年份">
            <el-option v-for="year in yearOptions" :key="year" :label="`${year}年`" :value="year" />
          </el-select>
          <el-select v-model="periodMonth" class="period-unit" placeholder="月份">
            <el-option v-for="month in 12" :key="month" :label="`${month}月`" :value="month" />
          </el-select>
        </template>
        <template v-else-if="query.periodType === 'quarter'">
          <el-select v-model="periodYear" class="period-year" placeholder="年份">
            <el-option v-for="year in yearOptions" :key="year" :label="`${year}年`" :value="year" />
          </el-select>
          <el-select v-model="periodQuarter" class="period-unit" placeholder="季度">
            <el-option v-for="quarter in 4" :key="quarter" :label="`第${quarter}季度`" :value="quarter" />
          </el-select>
        </template>
        <template v-else-if="query.periodType === 'halfYear' || query.periodType === 'year'">
          <el-select v-model="periodYear" class="period-year" placeholder="年份">
            <el-option v-for="year in yearOptions" :key="year" :label="`${year}年`" :value="year" />
          </el-select>
          <el-select v-if="query.periodType === 'halfYear'" v-model="periodHalf" class="period-unit" placeholder="半年度">
            <el-option label="上半年" :value="1" />
            <el-option label="下半年" :value="2" />
          </el-select>
        </template>
        <el-date-picker
          v-else-if="query.periodType === 'custom'"
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          range-separator="至"
          class="turnover-range"
        />
        <el-select v-model="query.productId" placeholder="全部商品" clearable filterable class="mini-select">
          <el-option v-for="item in products" :key="item.productId" :label="item.productName" :value="item.productId" />
        </el-select>
        <el-select v-model="query.categoryId" placeholder="全部分类" clearable filterable class="mini-select">
          <el-option v-for="item in categories" :key="item.categoryId" :label="item.categoryName" :value="item.categoryId" />
        </el-select>
        <el-button type="primary" :loading="loading" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <div class="threshold-row">
        <div class="threshold-item">
          <span>慢周转阈值</span>
          <el-input-number v-model="query.slowThreshold" :min="0" :precision="2" />
        </div>
      </div>
    </section>

    <section class="biz-stats">
      <StatCard label="全部商品数量" :value="total" :icon="Goods" />
      <StatCard label="本页慢周转数量" :value="slowCount" :icon="Timer" tone="orange" />
      <StatCard label="本页呆滞数量" :value="agedCount" :icon="WarningFilled" tone="red" />
      <StatCard label="本页呆滞标记数量" :value="stagnantCount" :icon="Document" tone="purple" />
    </section>

    <section class="biz-card table-card">
      <el-table v-loading="loading" :data="items" stripe border class="biz-table" empty-text="暂无符合条件的数据">
        <el-table-column prop="productName" label="商品名称" min-width="180" />
        <el-table-column prop="saleQuantity" label="销售数量" width="120" align="right" />
        <el-table-column prop="openingStock" label="期初库存" width="120" align="right" />
        <el-table-column prop="closingStock" label="期末库存" width="120" align="right" />
        <el-table-column label="平均库存" width="120" align="right">
          <template #default="{ row }">{{ formatValue(row.averageStock) }}</template>
        </el-table-column>
        <el-table-column label="周转次数" width="120" align="right">
          <template #default="{ row }">{{ formatValue(row.turnoverTimes) }}</template>
        </el-table-column>
        <el-table-column label="是否呆滞" width="110" align="center">
          <template #default="{ row }">{{ row.stagnant ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="biz-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
           :page-sizes="[20]"
          @change="load"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Document, Goods, Timer, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { categoryApi } from '../../api/category'
import { productApi } from '../../api/product'
import { statisticsApi } from '../../api/statistics'
import type { ProductCategory, ProductListItem } from '../../types/product'
import type { InventoryTurnoverItem, InventoryTurnoverQuery } from '../../types/statistics'

const products = ref<ProductListItem[]>([])
const categories = ref<ProductCategory[]>([])
const items = ref<InventoryTurnoverItem[]>([])
const loading = ref(false)
const total = ref(0)
const dateRange = ref<string[]>([])
const currentDate = new Date()
const yearOptions = Array.from({ length: 11 }, (_, index) => currentDate.getFullYear() - 5 + index)
const periodYear = ref(currentDate.getFullYear())
const periodMonth = ref(currentDate.getMonth() + 1)
const periodQuarter = ref(Math.floor(currentDate.getMonth() / 3) + 1)
const periodHalf = ref(currentDate.getMonth() < 6 ? 1 : 2)

const toDate = (year: number, month: number, day: number) => {
  const date = new Date(year, month - 1, day)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const query = reactive<InventoryTurnoverQuery & { page: number; pageSize: number }>({
  periodType: 'month',
  startDate: toDate(periodYear.value, periodMonth.value, 1),
  endDate: toDate(periodYear.value, periodMonth.value + 1, 0),
  productId: undefined,
  categoryId: undefined,
  slowThreshold: 2,
  page: 1,
  pageSize: 20,
  avgMethod: 'simple',
})

const slowCount = computed(() => items.value.filter(item => item.status === 'slow').length)
const agedCount = computed(() => items.value.filter(item => item.status === 'aged').length)
const stagnantCount = computed(() => items.value.filter(item => item.stagnant).length)

const formatValue = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(Number(value))) return '0'
  return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const statusText = (status: string) => {
  switch (status) {
    case 'normal':
      return '正常'
    case 'slow':
      return '慢周转'
    case 'aged':
      return '呆滞'
    default:
      return '-'
  }
}

const statusType = (status: string) => {
  switch (status) {
    case 'normal':
      return 'success'
    case 'slow':
      return 'warning'
    case 'aged':
      return 'danger'
    default:
      return 'info'
  }
}

function validateQuery() {
  if (!query.startDate || !query.endDate) {
    ElMessage.warning('请选择开始日期和结束日期')
    return false
  }
  if (query.startDate > query.endDate) {
    ElMessage.warning('开始日期不能晚于结束日期')
    return false
  }
  if ((query.slowThreshold ?? 0) < 0) {
    ElMessage.warning('慢周转阈值不能小于 0')
    return false
  }
  return true
}

async function loadOptions() {
  try {
    const [productResult, categoryResult] = await Promise.all([
      productApi.getList({ page: 1, size: 1000 }),
      categoryApi.getList({ page: 1, size: 1000 }),
    ])
    products.value = productResult?.list ?? []
    categories.value = categoryResult?.list ?? []
  } catch {
    products.value = []
    categories.value = []
  }
}

async function load() {
  if (!validateQuery()) return

  loading.value = true
  try {
    const result = await statisticsApi.getInventoryTurnover({
      periodType: query.periodType,
      startDate: query.startDate,
      endDate: query.endDate,
      productId: query.productId || undefined,
      categoryId: query.categoryId || undefined,
      avgMethod: 'simple',
      slowThreshold: query.slowThreshold ?? 0,
      page: query.page,
      pageSize: query.pageSize,
    })

    const list = Array.isArray(result) ? result : result?.list ?? []
    items.value = list as InventoryTurnoverItem[]
    total.value = Number(result?.total ?? result?.count ?? list.length ?? 0)
    query.page = Number(result?.page ?? query.page ?? 1)
  } catch {
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function applyPeriodRange() {
  if (query.periodType === 'custom') {
    query.startDate = dateRange.value[0] || ''
    query.endDate = dateRange.value[1] || ''
    return
  }

  const year = periodYear.value
  let startMonth = 1
  let endMonth = 12
  if (query.periodType === 'month') {
    startMonth = periodMonth.value
    endMonth = periodMonth.value
  } else if (query.periodType === 'quarter') {
    startMonth = (periodQuarter.value - 1) * 3 + 1
    endMonth = startMonth + 2
  } else if (query.periodType === 'halfYear') {
    startMonth = periodHalf.value === 1 ? 1 : 7
    endMonth = periodHalf.value === 1 ? 6 : 12
  }
  query.startDate = toDate(year, startMonth, 1)
  query.endDate = toDate(year, endMonth + 1, 0)
}

async function search() {
  applyPeriodRange()
  query.page = 1
  await loadOptions()
  await load()
}

async function reset() {
  periodYear.value = currentDate.getFullYear()
  periodMonth.value = currentDate.getMonth() + 1
  periodQuarter.value = Math.floor(currentDate.getMonth() / 3) + 1
  periodHalf.value = currentDate.getMonth() < 6 ? 1 : 2
  dateRange.value = []
  Object.assign(query, {
    periodType: 'month',
    productId: undefined,
    categoryId: undefined,
    slowThreshold: 2,
    page: 1,
    pageSize: 20,
    avgMethod: 'simple',
  })
  applyPeriodRange()
  await loadOptions()
  await load()
}

onMounted(() => {
  applyPeriodRange()
  void Promise.all([loadOptions(), load()])
})
</script>

<style scoped>
.filter-card {
  padding: 16px 18px 10px;
}

.range-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.turnover-range {
  flex: 1;
  min-width: 360px;
}

.period-type {
  width: 100px;
}

.period-year {
  width: 110px;
}

.period-unit {
  width: 120px;
}

.mini-select {
  width: 180px;
}

.turnover-range :deep(.el-input__wrapper),
.mini-select :deep(.el-select__wrapper) {
  height: 42px;
  border: 1px solid #d8dfe8;
  border-radius: 6px;
  box-shadow: none;
  background: #fff;
}

.turnover-range :deep(.el-input__wrapper:focus-within),
.mini-select :deep(.el-select__wrapper:focus-within) {
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.15);
}

.threshold-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.threshold-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #34445b;
}

.threshold-item :deep(.el-input-number) {
  width: 120px;
}

.threshold-item :deep(.el-input__wrapper) {
  height: 38px;
  border: 1px solid #d8dfe8;
  border-radius: 6px;
  box-shadow: none;
}

.table-card {
  margin-top: 16px;
}

.biz-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
