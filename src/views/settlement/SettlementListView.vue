<template>
  <div class="biz-page">
    <PageHeader eyebrow="数据中心 · 财务往来" title="供应商结算" description="查询采购应付、已付和未付金额，掌握供应商结算状态" />
    <section class="biz-stats">
      <StatCard label="结算记录" :value="total" :icon="Document" />
      <StatCard label="本页应付" :value="formatMoney(pageSettlement)" :icon="Wallet" tone="purple" />
      <StatCard label="本页已付" :value="formatMoney(pagePaid)" :icon="CircleCheckFilled" tone="green" />
      <StatCard label="本页未付" :value="formatMoney(pageUnpaid)" :icon="WarningFilled" tone="orange" />
    </section>
    <section class="biz-card">
      <div class="biz-toolbar"><el-input v-model="query.keyword" placeholder="供应商名称或采购单号" clearable :prefix-icon="Search" @keyup.enter="search" /><el-select v-model="query.status" placeholder="全部状态" clearable><el-option v-for="item in ['未结算','部分结算','已结算']" :key="item" :label="item" :value="item" /></el-select><el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" /><el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button><span class="biz-toolbar__summary">共 {{ total }} 条结算记录</span></div>
      <el-table v-loading="loading" :data="settlements" row-key="settlementId" stripe border class="biz-table"><el-table-column label="结算编号" width="105"><template #default="{ row }">#{{ row.settlementId }}</template></el-table-column><el-table-column label="供应商" min-width="170"><template #default="{ row }"><b>{{ row.supplierName || `供应商 #${row.supplierId}` }}</b></template></el-table-column><el-table-column label="采购单" min-width="150"><template #default="{ row }">{{ row.purchaseNo || `采购单 #${row.purchaseId}` }}</template></el-table-column><el-table-column label="结算日期" width="120"><template #default="{ row }">{{ formatDate(row.settlementDate) }}</template></el-table-column><el-table-column label="应付金额" width="120" align="right"><template #default="{ row }">{{ formatMoney(row.settlementAmount) }}</template></el-table-column><el-table-column label="已付金额" width="120" align="right"><template #default="{ row }"><span class="biz-positive">{{ formatMoney(row.paidAmount) }}</span></template></el-table-column><el-table-column label="未付金额" width="120" align="right"><template #default="{ row }"><span :class="row.unpaidAmount > 0 ? 'biz-negative' : ''">{{ formatMoney(row.unpaidAmount) }}</span></template></el-table-column><el-table-column label="状态" width="105" align="center"><template #default="{ row }"><span class="biz-status" :class="statusTone(row.status)">{{ row.status }}</span></template></el-table-column><el-table-column label="操作" width="90" fixed="right" align="center"><template #default="{ row }"><el-button link type="primary" @click="openDetail(row)">详情</el-button></template></el-table-column></el-table>
      <div class="biz-pagination"><el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total" v-model:current-page="query.page" v-model:page-size="query.size" :page-sizes="[10,20,50]" @change="load" /></div>
    </section>
    <el-drawer v-model="detailVisible" title="结算详情" size="460px"><div v-loading="detailLoading" v-if="selected"><h2>{{ selected.supplierName || `供应商 #${selected.supplierId}` }}</h2><p class="biz-muted">采购单：{{ selected.purchaseNo || `#${selected.purchaseId}` }}</p><dl class="biz-detail-grid"><div><dt>结算日期</dt><dd>{{ formatDate(selected.settlementDate) }}</dd></div><div><dt>结算状态</dt><dd>{{ selected.status }}</dd></div><div><dt>应付金额</dt><dd>{{ formatMoney(selected.settlementAmount) }}</dd></div><div><dt>已付金额</dt><dd>{{ formatMoney(selected.paidAmount) }}</dd></div><div><dt>未付金额</dt><dd>{{ formatMoney(selected.unpaidAmount) }}</dd></div><div style="grid-column:1/-1"><dt>备注</dt><dd>{{ selected.remark || '-' }}</dd></div></dl></div></el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { CircleCheckFilled, Document, Search, Wallet, WarningFilled } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { settlementApi } from '../../api/settlement'
import type { SettlementQuery, SettlementStatus, SupplierSettlement } from '../../types/settlement'
import { formatDate, formatMoney } from '../../utils/format'

const settlements = ref<SupplierSettlement[]>([]), loading = ref(false), total = ref(0), dateRange = ref<string[]>([])
const detailVisible = ref(false), detailLoading = ref(false), selected = ref<SupplierSettlement | null>(null)
const query = reactive<SettlementQuery>({ page: 1, size: 10, keyword: '', status: '', startDate: '', endDate: '' })
watch(dateRange, value => { query.startDate = value?.[0] || ''; query.endDate = value?.[1] || '' })
const pageSettlement = computed(() => settlements.value.reduce((sum, item) => sum + Number(item.settlementAmount ?? 0), 0))
const pagePaid = computed(() => settlements.value.reduce((sum, item) => sum + Number(item.paidAmount ?? 0), 0))
const pageUnpaid = computed(() => settlements.value.reduce((sum, item) => sum + Number(item.unpaidAmount ?? 0), 0))
const statusTone = (status: SettlementStatus) => status === '已结算' ? 'green' : status === '部分结算' ? 'orange' : 'red'
async function load() { loading.value = true; try { const result = await settlementApi.getList({ ...query, keyword: query.keyword || undefined, status: query.status || undefined, startDate: query.startDate || undefined, endDate: query.endDate || undefined }); settlements.value = result?.list ?? []; total.value = result?.total ?? 0 } catch { settlements.value = []; total.value = 0 } finally { loading.value = false } }
function search() { query.page = 1; load() }
function reset() { dateRange.value = []; Object.assign(query, { page: 1, size: 10, keyword: '', status: '', startDate: '', endDate: '' }); load() }
async function openDetail(row: SupplierSettlement) { detailVisible.value = true; detailLoading.value = true; try { selected.value = await settlementApi.getDetail(row.settlementId) } finally { detailLoading.value = false } }
onMounted(load)
</script>
