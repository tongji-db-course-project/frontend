<template>
  <div class="biz-page">
    <PageHeader eyebrow="销售管理 · 订单查询" title="销售单列表" description="查询门店销售订单、支付金额与订单状态">
      <el-button type="primary" :icon="ShoppingCart" @click="router.push('/sales/checkout')">进入 POS 收银</el-button>
    </PageHeader>
    <section class="biz-stats">
      <StatCard label="订单总数" :value="total" :icon="Tickets" />
      <StatCard label="本页实收" :value="formatMoney(pagePaidAmount)" :icon="Money" tone="green" />
      <StatCard label="本页优惠" :value="formatMoney(pageDiscount)" :icon="Discount" tone="orange" />
      <StatCard label="本页已完成" :value="completedCount" :icon="CircleCheckFilled" tone="purple" />
    </section>
    <section class="biz-card">
      <div class="biz-toolbar">
        <el-input v-model="query.keyword" placeholder="销售单号、会员或收银员" clearable :prefix-icon="Search" @keyup.enter="search" />
        <el-select v-model="query.status" placeholder="全部状态" clearable><el-option v-for="item in ['待支付','已完成','已取消']" :key="item" :label="item" :value="item" /></el-select>
        <el-select v-model="query.payType" placeholder="全部支付方式" clearable><el-option v-for="item in ['现金','微信','支付宝']" :key="item" :label="item" :value="item" /></el-select>
        <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" />
        <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button>
      </div>
      <el-table v-loading="loading" :data="orders" row-key="saleId" stripe border class="biz-table" @row-click="showDetail">
        <el-table-column label="销售单号" min-width="170"><template #default="{ row }"><button class="biz-link" @click.stop="showDetail(row)">{{ row.saleNo }}</button><small class="biz-muted" style="display:block">{{ formatDateTime(row.saleDate) }}</small></template></el-table-column>
        <el-table-column label="会员" min-width="130"><template #default="{ row }">{{ row.memberName || (row.memberId ? `会员 #${row.memberId}` : '散客') }}</template></el-table-column>
        <el-table-column label="收银员" min-width="120"><template #default="{ row }">{{ row.cashierName || `用户 #${row.userId}` }}</template></el-table-column>
        <el-table-column label="原始金额" width="115" align="right"><template #default="{ row }">{{ formatMoney(row.totalAmount) }}</template></el-table-column>
        <el-table-column label="优惠金额" width="115" align="right"><template #default="{ row }"><span class="biz-negative">-{{ formatMoney(row.discountAmount) }}</span></template></el-table-column>
        <el-table-column label="实付金额" width="120" align="right"><template #default="{ row }"><span class="biz-money">{{ formatMoney(row.paidAmount) }}</span></template></el-table-column>
        <el-table-column prop="payType" label="支付方式" width="105" align="center"><template #default="{ row }">{{ row.payType || '-' }}</template></el-table-column>
        <el-table-column label="状态" width="95" align="center"><template #default="{ row }"><span class="biz-status" :class="statusTone(row.status)">{{ row.status || '-' }}</span></template></el-table-column>
        <el-table-column label="操作" width="90" fixed="right" align="center"><template #default="{ row }"><el-button link type="primary" @click.stop="showDetail(row)">详情</el-button></template></el-table-column>
      </el-table>
      <div class="biz-pagination"><el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total" v-model:current-page="query.page" v-model:page-size="query.size" :page-sizes="[10,20,50]" @change="load" /></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { CircleCheckFilled, Discount, Money, Search, ShoppingCart, Tickets } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { saleApi } from '../../api/sale'
import type { SaleOrder, SaleQuery, SaleStatus } from '../../types/sale'
import { formatDateTime, formatMoney } from '../../utils/format'

const router = useRouter(), orders = ref<SaleOrder[]>([]), loading = ref(false), total = ref(0), dateRange = ref<string[]>([])
const query = reactive<SaleQuery>({ page: 1, size: 10, keyword: '', status: '', payType: '', startDate: '', endDate: '' })
watch(dateRange, value => { query.startDate = value?.[0] || ''; query.endDate = value?.[1] || '' })
const pagePaidAmount = computed(() => orders.value.reduce((sum, item) => sum + Number(item.paidAmount ?? 0), 0))
const pageDiscount = computed(() => orders.value.reduce((sum, item) => sum + Number(item.discountAmount ?? 0), 0))
const completedCount = computed(() => orders.value.filter(item => item.status === '已完成').length)
const statusTone = (status?: SaleStatus | null) => status === '已完成' ? 'green' : status === '待支付' ? 'orange' : 'gray'
async function load() { loading.value = true; try { const result = await saleApi.getList({ ...query, keyword: query.keyword || undefined, status: query.status || undefined, payType: query.payType || undefined, startDate: query.startDate || undefined, endDate: query.endDate || undefined }); orders.value = result?.list ?? []; total.value = result?.total ?? 0 } catch { orders.value = []; total.value = 0 } finally { loading.value = false } }
function search() { query.page = 1; load() }
function reset() { dateRange.value = []; Object.assign(query, { page: 1, size: 10, keyword: '', status: '', payType: '', startDate: '', endDate: '' }); load() }
function showDetail(row: SaleOrder) { router.push(`/sales/${row.saleId}`) }
onMounted(load)
</script>
