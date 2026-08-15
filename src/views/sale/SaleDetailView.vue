<template>
  <div class="biz-page">
    <PageHeader eyebrow="销售管理 · 订单详情" :title="detail?.saleNo || '销售单详情'" description="查看订单金额、支付信息与商品明细">
      <el-button :icon="ArrowLeft" @click="router.push('/sales')">返回列表</el-button>
    </PageHeader>
    <div v-loading="loading">
      <template v-if="detail">
        <section class="biz-stats">
          <StatCard label="原始金额" :value="formatMoney(detail.totalAmount)" :icon="Wallet" />
          <StatCard label="优惠金额" :value="formatMoney(detail.discountAmount)" :icon="Discount" tone="orange" />
          <StatCard label="实付金额" :value="formatMoney(detail.paidAmount)" :icon="Money" tone="green" />
          <StatCard label="订单状态" :value="detail.status || '-'" :icon="CircleCheckFilled" tone="purple" />
        </section>
        <section class="biz-card">
          <h3>订单信息</h3>
          <dl class="biz-detail-grid"><div><dt>销售单号</dt><dd>{{ detail.saleNo }}</dd></div><div><dt>销售时间</dt><dd>{{ formatDateTime(detail.saleDate) }}</dd></div><div><dt>会员</dt><dd>{{ detail.memberId ? `会员 #${detail.memberId}` : '散客' }}</dd></div><div><dt>收银员</dt><dd>用户 #{{ detail.userId }}</dd></div><div><dt>支付方式</dt><dd>{{ detail.payType || '-' }}</dd></div><div><dt>创建时间</dt><dd>{{ formatDateTime(detail.createTime) }}</dd></div><div><dt>最后更新</dt><dd>{{ formatDateTime(detail.updateTime) }}</dd></div></dl>
          <div class="biz-summary-row"><span>优惠<strong>-{{ formatMoney(detail.discountAmount) }}</strong></span><span>实付<strong>{{ formatMoney(detail.paidAmount) }}</strong></span></div>
        </section>
      </template>
      <el-empty v-else description="未找到销售单" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, CircleCheckFilled, Discount, Money, Wallet } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { saleApi } from '../../api/sale'
import type { SaleOrder } from '../../types/sale'
import { formatDateTime, formatMoney } from '../../utils/format'

const route = useRoute(), router = useRouter(), saleId = Number(route.params.id)
const detail = ref<SaleOrder | null>(null), loading = ref(false)
async function load() { if (!Number.isFinite(saleId)) return; loading.value = true; try { detail.value = await saleApi.getDetail(saleId) } catch { detail.value = null } finally { loading.value = false } }
onMounted(load)
</script>
