<template>
  <div class="biz-page">
    <PageHeader eyebrow="销售管理 · 售后业务" title="退货管理" description="查询退货申请，并从原销售单发起商品退货">
      <el-button type="primary" :icon="Plus" @click="openCreate">新建退货</el-button>
    </PageHeader>
    <section class="biz-stats">
      <StatCard label="退货单总数" :value="total" :icon="RefreshLeft" />
      <StatCard label="本页退款金额" :value="formatMoney(refundTotal)" :icon="Money" tone="orange" />
      <StatCard label="本页待处理" :value="pendingCount" :icon="Clock" tone="purple" />
      <StatCard label="本页已完成" :value="completedCount" :icon="CircleCheckFilled" tone="green" />
    </section>
    <section class="biz-card">
      <div class="biz-toolbar">
        <el-input v-model="query.keyword" placeholder="退货单号或销售单号" clearable :prefix-icon="Search" @keyup.enter="search" />
        <el-select v-model="query.status" placeholder="全部状态" clearable><el-option v-for="item in ['待处理','已完成','已拒绝']" :key="item" :label="item" :value="item" /></el-select>
        <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" />
        <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button>
        <span class="biz-toolbar__summary">共 {{ total }} 张退货单</span>
      </div>
      <el-table v-loading="loading" :data="orders" row-key="returnId" stripe border class="biz-table">
        <el-table-column label="退货单号" min-width="170"><template #default="{ row }"><button class="biz-link" @click="showDetail(row)">{{ row.returnNo }}</button><small class="biz-muted" style="display:block">{{ formatDateTime(row.returnDate) }}</small></template></el-table-column>
        <el-table-column label="原销售单" min-width="150"><template #default="{ row }">{{ row.saleNo || `销售单 #${row.saleId}` }}</template></el-table-column>
        <el-table-column label="会员" min-width="125"><template #default="{ row }">{{ row.memberName || (row.memberId ? `会员 #${row.memberId}` : '散客') }}</template></el-table-column>
        <el-table-column label="经办人" width="120"><template #default="{ row }">{{ row.operatorName || `用户 #${row.operatorId}` }}</template></el-table-column>
        <el-table-column label="退款金额" width="125" align="right"><template #default="{ row }"><strong>{{ formatMoney(row.refundAmount) }}</strong></template></el-table-column>
        <el-table-column label="状态" width="95" align="center"><template #default="{ row }"><span class="biz-status" :class="statusTone(row.status)">{{ row.status }}</span></template></el-table-column>
        <el-table-column label="备注" min-width="170"><template #default="{ row }">{{ row.remark || '-' }}</template></el-table-column>
        <el-table-column label="操作" width="90" fixed="right" align="center"><template #default="{ row }"><el-button link type="primary" @click="showDetail(row)">详情</el-button></template></el-table-column>
      </el-table>
      <div class="biz-pagination"><el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total" v-model:current-page="query.page" v-model:page-size="query.size" :page-sizes="[10,20,50]" @change="load" /></div>
    </section>

    <el-dialog v-model="createVisible" title="新建退货申请" width="680px">
      <el-alert title="退款金额与可退数量由后端根据原销售单重新校验，前端填写结果仅作为申请内容。" type="info" show-icon :closable="false" />
      <el-form label-position="top" style="margin-top:14px">
        <div class="biz-form-grid"><el-form-item label="原销售单 ID" required><div class="sale-id-field"><el-input-number v-model="createForm.saleId" :min="1" controls-position="right" /><el-button :loading="saleLoading" @click="loadSourceSale">读取销售单</el-button></div></el-form-item><el-form-item label="退货原因"><el-input v-model="createForm.remark" maxlength="200" /></el-form-item></div>
      </el-form>
      <el-descriptions v-if="sourceSale" :column="2" border size="small" class="source-sale"><el-descriptions-item label="销售单号">{{ sourceSale.saleNo }}</el-descriptions-item><el-descriptions-item label="订单状态"><el-tag :type="sourceSale.status === '已完成' ? 'success' : 'warning'">{{ sourceSale.status || '-' }}</el-tag></el-descriptions-item><el-descriptions-item label="实付金额">{{ formatMoney(sourceSale.paidAmount) }}</el-descriptions-item><el-descriptions-item label="商品种类">{{ sourceSale.items?.length || 0 }}</el-descriptions-item></el-descriptions>
      <div class="return-lines"><header><b>选择退货商品</b><small v-if="sourceSale">数量填写为 0 表示不退该商品</small></header><el-table v-loading="saleLoading" :data="createForm.items" border size="small"><el-table-column label="商品" min-width="230"><template #default="{ row }"><b>{{ sourceItem(row.productId)?.productName || `商品 #${row.productId}` }}</b><small class="biz-muted" style="display:block">{{ sourceItem(row.productId)?.barcode || '-' }}</small></template></el-table-column><el-table-column label="购买数量" width="100" align="center"><template #default="{ row }">{{ sourceItem(row.productId)?.quantity ?? '-' }}</template></el-table-column><el-table-column label="退货数量" width="180"><template #default="{ row }"><el-input-number v-model="row.quantity" :min="0" :max="sourceItem(row.productId)?.quantity || 1" controls-position="right" /></template></el-table-column></el-table><el-empty v-if="!saleLoading && !createForm.items.length" description="请先读取包含商品明细的销售单" :image-size="70" /></div>
      <template #footer><el-button @click="createVisible=false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitReturn">提交申请</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { CircleCheckFilled, Clock, Money, Plus, RefreshLeft, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { returnApi } from '../../api/return'
import { saleApi } from '../../api/sale'
import type { CreateReturnPayload, ReturnOrder, ReturnQuery, ReturnStatus } from '../../types/return'
import type { SaleOrder } from '../../types/sale'
import { formatDateTime, formatMoney } from '../../utils/format'

const route = useRoute(), router = useRouter(), orders = ref<ReturnOrder[]>([]), loading = ref(false), total = ref(0), dateRange = ref<string[]>([])
const query = reactive<ReturnQuery>({ page: 1, size: 10, keyword: '', status: '', startDate: '', endDate: '' })
const createVisible = ref(false), submitting = ref(false)
const createForm = reactive<CreateReturnPayload>({ saleId: Number(route.query.saleId) || 0, remark: '', items: [] })
const sourceSale = ref<SaleOrder | null>(null), saleLoading = ref(false)
watch(dateRange, value => { query.startDate = value?.[0] || ''; query.endDate = value?.[1] || '' })
const refundTotal = computed(() => orders.value.reduce((sum, item) => sum + Number(item.refundAmount ?? 0), 0))
const pendingCount = computed(() => orders.value.filter(item => item.status === '待处理').length)
const completedCount = computed(() => orders.value.filter(item => item.status === '已完成').length)
const statusTone = (status: ReturnStatus) => status === '已完成' ? 'green' : status === '待处理' ? 'orange' : 'red'
async function load() { loading.value = true; try { const result = await returnApi.getList({ ...query, keyword: query.keyword || undefined, status: query.status || undefined, startDate: query.startDate || undefined, endDate: query.endDate || undefined }); orders.value = result?.list ?? []; total.value = result?.total ?? 0 } catch { orders.value = []; total.value = 0 } finally { loading.value = false } }
function search() { query.page = 1; load() }
function reset() { dateRange.value = []; Object.assign(query, { page: 1, size: 10, keyword: '', status: '', startDate: '', endDate: '' }); load() }
function showDetail(row: ReturnOrder) { router.push(`/returns/${row.returnId}`) }
function openCreate() { createVisible.value = true; if (createForm.saleId > 0) void loadSourceSale() }
const sourceItem = (productId: number) => sourceSale.value?.items?.find(item => item.productId === productId)
async function loadSourceSale() { if (createForm.saleId <= 0) { ElMessage.warning('请先填写销售单 ID'); return } saleLoading.value = true; sourceSale.value = null; createForm.items.splice(0); try { const sale = await saleApi.getDetail(createForm.saleId); if (sale.status !== '已完成') { ElMessage.warning('只有已完成的销售单可以发起退货'); return } if (!sale.items?.length) { ElMessage.warning('该销售单未返回商品明细，暂时无法创建退货'); return } sourceSale.value = sale; createForm.items.push(...sale.items.map(item => ({ productId: item.productId, quantity: 0 }))) } catch { ElMessage.error('销售单读取失败，请检查编号后重试') } finally { saleLoading.value = false } }
async function submitReturn() { const items = createForm.items.filter(item => item.productId > 0 && item.quantity > 0); if (!sourceSale.value || !items.length) { ElMessage.warning('请读取销售单并选择至少一项退货商品'); return } submitting.value = true; try { await returnApi.create({ saleId: createForm.saleId, remark: createForm.remark || undefined, items }); ElMessage.success('退货申请已提交'); createVisible.value = false; Object.assign(createForm, { saleId: 0, remark: '', items: [] }); sourceSale.value = null; await load() } finally { submitting.value = false } }
onMounted(() => { load(); if (route.query.saleId) openCreate() })
</script>

<style scoped>.sale-id-field{width:100%;display:flex;gap:8px}.sale-id-field .el-input-number{flex:1}.source-sale{margin:2px 0 12px}.return-lines{margin-top:4px}.return-lines header{padding:8px 0;display:flex;align-items:center;justify-content:space-between}.return-lines header small{color:var(--text-muted)}.return-lines :deep(.el-input-number){width:100%}</style>
