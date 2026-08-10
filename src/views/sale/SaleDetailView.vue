<template>
  <div class="biz-page">
    <PageHeader eyebrow="销售管理 · 订单详情" :title="detail?.saleNo || '销售单详情'" description="查看订单金额、支付信息与商品明细">
      <el-button :icon="ArrowLeft" @click="router.push('/sales')">返回列表</el-button>
      <el-button v-if="detail && detail.status !== '已取消'" type="danger" plain :loading="cancelling" @click="cancelSale">取消销售单</el-button>
      <el-button v-if="detail?.status === '已完成'" type="primary" @click="router.push(`/returns?saleId=${saleId}`)">发起退货</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, CircleCheckFilled, Discount, Money, Wallet } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { saleApi } from '../../api/sale'
import type { SaleOrder } from '../../types/sale'
import { formatDateTime, formatMoney } from '../../utils/format'

const route = useRoute(), router = useRouter(), saleId = Number(route.params.id)
const authStore = useAuthStore()
const detail = ref<SaleOrder | null>(null), loading = ref(false), cancelling = ref(false)
async function load() { if (!Number.isFinite(saleId)) return; loading.value = true; try { detail.value = await saleApi.getDetail(saleId) } catch { detail.value = null } finally { loading.value = false } }
async function cancelSale() {
  const operatorId = Number(authStore.userInfo?.userId)
  if (!Number.isInteger(operatorId) || operatorId <= 0) { ElMessage.warning('当前登录信息缺少用户编号，请重新登录'); return }
  const { value } = await ElMessageBox.prompt('请输入取消或作废原因', '取消销售单', { confirmButtonText: '确认取消', cancelButtonText: '返回', inputPattern: /\S+/, inputErrorMessage: '取消原因不能为空', type: 'warning' })
  cancelling.value = true
  try { await saleApi.cancel(saleId, { operatorId, reason: value.trim() }); ElMessage.success('销售单已取消'); await load() } finally { cancelling.value = false }
}
onMounted(load)
</script>
