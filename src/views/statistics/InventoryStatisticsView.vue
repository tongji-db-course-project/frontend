<template>
  <div class="biz-page">
    <PageHeader eyebrow="数据中心 · 库存结构" title="库存分析" description="汇总库存规模、低库存预警和仓库数量">
      <el-button :icon="Refresh" :loading="loading" @click="load">刷新</el-button>
    </PageHeader>
    <section class="biz-stats">
      <StatCard label="库存商品" :value="data?.productCount ?? 0" :icon="Goods" />
      <StatCard label="库存总量" :value="data?.totalStock ?? 0" :icon="Tickets" tone="green" />
      <StatCard label="预警商品" :value="data?.warningProductCount ?? 0" :icon="WarningFilled" tone="orange" />
      <StatCard label="仓库数量" :value="data?.warehouseCount ?? 0" :icon="Money" tone="purple" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Goods, Money, Refresh, Tickets, WarningFilled } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { statisticsApi } from '../../api/statistics'
import type { InventoryStatistics } from '../../types/statistics'

const data = ref<InventoryStatistics | null>(null), loading = ref(false)
async function load() { loading.value = true; try { data.value = await statisticsApi.getInventory() } catch { data.value = null } finally { loading.value = false } }
onMounted(load)
</script>