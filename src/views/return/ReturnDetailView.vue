<template>
  <div class="biz-page">
    <PageHeader eyebrow="销售管理 · 售后详情" :title="detail?.returnNo || '退货单详情'" description="查看原销售单、退款金额和退货商品">
      <el-button :icon="ArrowLeft" @click="router.push('/returns')">返回列表</el-button>
      <el-button
        v-if="detail?.status === '待处理'"
        type="primary"
        :icon="CircleCheck"
        :loading="confirming"
        @click="confirmReturn"
      >确认退货</el-button>
    </PageHeader>
    <div v-loading="loading">
      <template v-if="detail">
        <section class="biz-stats">
          <StatCard label="退款金额" :value="formatMoney(detail.refundAmount)" :icon="Money" tone="orange" />
          <StatCard label="退货状态" :value="detail.status" :icon="RefreshLeft" :tone="detail.status === '已完成' ? 'green' : 'purple'" />
          <StatCard label="退货商品种类" :value="detail.items?.length ?? 0" :icon="Goods" />
          <StatCard label="退货总件数" :value="itemQuantity" :icon="Box" tone="purple" />
        </section>
        <section class="biz-card"><h3>退货信息</h3><dl class="biz-detail-grid"><div><dt>退货单号</dt><dd>{{ detail.returnNo }}</dd></div><div><dt>原销售单</dt><dd>{{ detail.saleNo || `销售单 #${detail.saleId}` }}</dd></div><div><dt>会员</dt><dd>{{ detail.memberName || (detail.memberId ? `会员 #${detail.memberId}` : '散客') }}</dd></div><div><dt>经办人</dt><dd>{{ detail.operatorName || `用户 #${detail.operatorId}` }}</dd></div><div><dt>退货时间</dt><dd>{{ formatDateTime(detail.returnDate) }}</dd></div><div><dt>最后更新</dt><dd>{{ formatDateTime(detail.updateTime) }}</dd></div><div style="grid-column:1/-1"><dt>退货原因 / 备注</dt><dd>{{ detail.remark || '-' }}</dd></div></dl></section>
        <section class="biz-card"><h3>退货商品</h3><el-table v-if="detail.items?.length" :data="detail.items" border class="biz-table"><el-table-column label="商品" min-width="210"><template #default="{ row }"><b>{{ row.productName || `商品 #${row.productId}` }}</b><small class="biz-muted" style="display:block">{{ row.barcode || '-' }}</small></template></el-table-column><el-table-column prop="quantity" label="数量" width="100" align="right" /><el-table-column label="退款单价" width="130" align="right"><template #default="{ row }">{{ formatMoney(row.refundPrice) }}</template></el-table-column><el-table-column label="退款小计" width="140" align="right"><template #default="{ row }"><strong>{{ formatMoney(row.subtotal) }}</strong></template></el-table-column></el-table><div v-else class="biz-empty"><h3>接口暂未返回退货明细</h3><p>页面已预留 items 字段，后端补充后会自动展示。</p></div><div class="biz-summary-row"><span>退款合计<strong>{{ formatMoney(detail.refundAmount) }}</strong></span></div></section>
      </template>
      <el-empty v-else description="未找到退货单" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Box, CircleCheck, Goods, Money, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { returnApi } from '../../api/return'
import type { ReturnDetail } from '../../types/return'
import { formatDateTime, formatMoney } from '../../utils/format'

const route = useRoute(), router = useRouter(), returnId = Number(route.params.id)
const detail = ref<ReturnDetail | null>(null), loading = ref(false), confirming = ref(false)
const itemQuantity = computed(() => detail.value?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0)
async function load() { if (!Number.isFinite(returnId)) return; loading.value = true; try { detail.value = await returnApi.getDetail(returnId) } catch { detail.value = null } finally { loading.value = false } }
async function confirmReturn() {
  if (!detail.value || detail.value.status !== '待处理' || confirming.value) return
  try {
    await ElMessageBox.confirm(
      `确认办理退货单“${detail.value.returnNo}”吗？确认后将执行退款、库存回补及相关积分调整。`,
      '确认退货',
      { type: 'warning', confirmButtonText: '确认退货', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  confirming.value = true
  try {
    await returnApi.confirm(returnId)
    ElMessage.success('退货已确认')
    await load()
  } finally {
    confirming.value = false
  }
}
onMounted(load)
</script>
