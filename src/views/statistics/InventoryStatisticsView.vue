<template>
  <div class="biz-page">
    <PageHeader
      eyebrow="数据中心 · 库存结构"
      title="库存分析"
      description="汇总库存商品、库存总量、预警商品和仓库数量"
    >
      <el-button :icon="Refresh" :loading="loading" @click="load">刷新</el-button>
    </PageHeader>

    <el-alert
      v-if="!available"
      title="库存分析接口请求失败"
      description="请确认 Apifox 已为 GET /statistics/inventory 配置 code=200 的响应示例。"
      type="warning"
      show-icon
      :closable="false"
      style="margin-bottom: 14px"
    />

    <section class="biz-stats">
      <StatCard label="库存商品" :value="data?.productCount ?? 0" :icon="Goods" />
      <StatCard label="库存总量" :value="data?.totalStock ?? 0" :icon="Histogram" tone="green" />
      <StatCard label="预警商品" :value="data?.warningProductCount ?? 0" :icon="WarningFilled" tone="orange" />
      <StatCard label="仓库数量" :value="data?.warehouseCount ?? 0" :icon="OfficeBuilding" tone="purple" />
    </section>

    <section v-loading="loading" class="biz-card inventory-summary">
      <h3>指标说明</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="库存商品">
          当前库存表中去重后的商品数量
        </el-descriptions-item>
        <el-descriptions-item label="库存总量">
          所有仓库当前库存数量之和
        </el-descriptions-item>
        <el-descriptions-item label="预警商品">
          当前库存低于商品库存预警值的商品数量
        </el-descriptions-item>
        <el-descriptions-item label="仓库数量">
          系统中登记的仓库总数
        </el-descriptions-item>
      </el-descriptions>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Goods, Histogram, OfficeBuilding, Refresh, WarningFilled } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { statisticsApi } from '../../api/statistics'
import type { InventoryStatistics } from '../../types/statistics'

const data = ref<InventoryStatistics | null>(null)
const loading = ref(false)
const available = ref(true)

async function load() {
  loading.value = true
  available.value = true
  try {
    data.value = await statisticsApi.getInventory()
  } catch {
    data.value = null
    available.value = false
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.inventory-summary { margin-top: 14px; }
.inventory-summary h3 { margin-top: 0; }
</style>
