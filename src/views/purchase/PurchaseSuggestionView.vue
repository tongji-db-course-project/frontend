<template>
  <div class="biz-page">
    <PageHeader
      eyebrow="采购管理 · 自动预警"
      title="库存采购预警"
      description="系统每 30 秒扫描一次总仓库存，低于安全库存时自动生成采购建议"
    >
      <el-button :icon="Refresh" :loading="loading" @click="scanNow">立即扫描</el-button>
    </PageHeader>

    <section class="biz-stats">
      <StatCard label="预警商品" :value="rows.length" :icon="WarningFilled" tone="orange" />
      <StatCard label="涉及供应商" :value="groups.length" :icon="OfficeBuilding" />
      <StatCard label="建议采购总量" :value="suggestedTotal" :icon="ShoppingCart" tone="green" />
      <StatCard label="扫描周期" value="30 秒" :icon="Timer" tone="purple" />
    </section>

    <section class="biz-card">
      <div class="biz-toolbar">
        <el-input v-model.trim="keyword" placeholder="搜索商品或供应商" clearable :prefix-icon="Search" />
        <el-tag type="success" effect="plain">自动扫描已开启</el-tag>
        <span class="biz-toolbar__summary">{{ scanText }}</span>
      </div>

      <el-table v-loading="loading" :data="filteredRows" row-key="productId" stripe border class="biz-table">
        <el-table-column label="商品" min-width="190">
          <template #default="{ row }"><b>{{ row.productName }}</b><small class="biz-muted product-id">#{{ row.productId }}</small></template>
        </el-table-column>
        <el-table-column prop="supplierName" label="默认供应商" min-width="180" />
        <el-table-column prop="currentStock" label="当前库存" width="105" align="right" />
        <el-table-column prop="stockWarning" label="安全库存" width="105" align="right" />
        <el-table-column label="库存状态" width="100" align="center">
          <template #default="{ row }"><span class="biz-status" :class="row.currentStock <= 0 ? 'red' : 'orange'">{{ row.currentStock <= 0 ? '缺货' : '预警' }}</span></template>
        </el-table-column>
        <el-table-column prop="suggestedQuantity" label="建议采购" width="115" align="right">
          <template #default="{ row }"><strong class="biz-positive">{{ row.suggestedQuantity }}</strong></template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }"><el-button link type="primary" @click="createPurchase(row)">发起采购</el-button></template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && !filteredRows.length" :description="keyword ? '没有匹配的预警商品' : '当前库存充足，暂无采购预警'" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { OfficeBuilding, Refresh, Search, ShoppingCart, Timer, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { inventoryApi } from '../../api/inventory'
import type { SupplierPurchaseSuggestion } from '../../types/inventory'

interface SuggestionRow {
  productId: number
  productName: string
  supplierId: number
  supplierName: string
  currentStock: number
  stockWarning: number
  suggestedQuantity: number
}

const router = useRouter()
const groups = ref<SupplierPurchaseSuggestion[]>([])
const keyword = ref('')
const loading = ref(false)
const lastScannedAt = ref<Date | null>(null)
let timer: number | undefined

const rows = computed<SuggestionRow[]>(() => groups.value.flatMap(group =>
  group.items.map(item => ({ ...item, supplierId: group.supplierId, supplierName: group.supplierName }))))
const suggestedTotal = computed(() => rows.value.reduce((sum, row) => sum + row.suggestedQuantity, 0))
const filteredRows = computed(() => {
  const value = keyword.value.toLowerCase()
  return value ? rows.value.filter(row => row.productName.toLowerCase().includes(value) || row.supplierName.toLowerCase().includes(value)) : rows.value
})
const scanText = computed(() => lastScannedAt.value
  ? `最近扫描：${lastScannedAt.value.toLocaleTimeString('zh-CN', { hour12: false })}`
  : '等待首次扫描')

async function load(showResult = false) {
  if (loading.value) {
    if (showResult) ElMessage.info('库存预警正在扫描，请稍候')
    return
  }
  loading.value = true
  try {
    groups.value = await inventoryApi.getPurchaseSuggestions() ?? []
    lastScannedAt.value = new Date()
    if (showResult) {
      ElMessage.success(`扫描完成，发现 ${rows.value.length} 个预警商品`)
    }
  } catch {
    ElMessage.error('库存预警扫描失败，请检查后端服务')
  } finally {
    loading.value = false
  }
}

function scanNow() {
  void load(true)
}

function createPurchase(row: SuggestionRow) {
  router.push({
    path: '/purchases/create',
    query: {
      source: 'inventory-warning',
      productId: String(row.productId),
      supplierId: String(row.supplierId),
      quantity: String(row.suggestedQuantity),
    },
  })
}

onMounted(() => {
  void load()
  timer = window.setInterval(() => void load(), 30_000)
})
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<style scoped>
.product-id{display:block;margin-top:3px}.biz-card :deep(.el-empty){padding:34px 0}
</style>
