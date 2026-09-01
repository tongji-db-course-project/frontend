<template>
  <div class="biz-page">
    <PageHeader eyebrow="销售管理 · 订单详情" :title="detail?.saleNo || '销售单详情'" description="查看订单金额与商品明细">
      <el-button v-if="detail?.status === '已完成'" type="primary" :icon="RefreshLeft" @click="router.push({ path: '/returns', query: { saleId } })">发起退货</el-button>
      <el-button :icon="ArrowLeft" @click="router.push('/sales')">返回列表</el-button>
    </PageHeader>
    <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" show-icon style="margin-bottom:14px" />
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
          <dl class="biz-detail-grid"><div><dt>销售单号</dt><dd>{{ detail.saleNo }}</dd></div><div><dt>销售时间</dt><dd>{{ formatDateTime(detail.saleDate) }}</dd></div><div><dt>会员</dt><dd>{{ detail.memberId ? `会员 #${detail.memberId}` : '散客' }}</dd></div><div><dt>收银员</dt><dd>用户 #{{ detail.userId }}</dd></div><div><dt>创建时间</dt><dd>{{ formatDateTime(detail.createTime) }}</dd></div><div><dt>最后更新</dt><dd>{{ formatDateTime(detail.updateTime) }}</dd></div></dl>
          <div class="biz-summary-row"><span>优惠<strong>-{{ formatMoney(detail.discountAmount) }}</strong></span><span>实付<strong>{{ formatMoney(detail.paidAmount) }}</strong></span></div>
        </section>
        <section class="biz-card"><h3>状态流转</h3><el-timeline v-if="timeline.length"><el-timeline-item v-for="item in timeline" :key="item.logId" :timestamp="formatDateTime(item.changeTime)" type="success"><b>{{ item.newStatus }}</b><p>{{ item.remark || `操作人 #${item.operatorId}` }}</p></el-timeline-item></el-timeline><el-empty v-else description="暂无状态流转记录" :image-size="60" /></section>
        <section class="biz-card">
          <h3>商品明细</h3>
          <el-table v-if="detail.items?.length" :data="detail.items" border class="biz-table">
            <el-table-column label="商品" min-width="220"><template #default="{ row }"><b>{{ row.productName || `商品 #${row.productId}` }}</b><small class="biz-muted" style="display:block">{{ row.barcode || row.specification || '-' }}</small></template></el-table-column>
            <el-table-column label="单价" width="130" align="right"><template #default="{ row }">{{ formatMoney(row.unitPrice ?? row.salePrice) }}</template></el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" align="right" />
            <el-table-column label="小计" width="140" align="right"><template #default="{ row }"><strong>{{ formatMoney(row.subtotal ?? Number(row.unitPrice ?? row.salePrice ?? 0) * row.quantity) }}</strong></template></el-table-column>
          </el-table>
          <el-empty v-else description="该销售单暂无商品明细" :image-size="80" />
        </section>
      </template>
      <el-empty v-else description="未找到销售单" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, CircleCheckFilled, Discount, Money, RefreshLeft, Wallet } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { saleApi } from '../../api/sale'
import type { SaleOrder } from '../../types/sale'
import type { OrderTimelineItem } from '../../types/common'
import { formatDateTime, formatMoney } from '../../utils/format'

const route = useRoute(), router = useRouter(), saleId = Number(route.params.id)
const detail = ref<SaleOrder | null>(null), loading = ref(false)
const timeline = ref<OrderTimelineItem[]>([])
const loadError = ref('')
async function load() {
  if (!Number.isInteger(saleId) || saleId <= 0) { loadError.value = '销售单编号无效，请返回列表重新进入'; return }
  loading.value = true; loadError.value = ''
  const [detailResult, timelineResult] = await Promise.allSettled([saleApi.getDetail(saleId), saleApi.getTimeline(saleId)])
  if (detailResult.status === 'fulfilled') detail.value = detailResult.value
  else { detail.value = null; loadError.value = `销售单 #${saleId} 详情接口加载失败，请检查后端 GET /sales/${saleId}` }
  timeline.value = timelineResult.status === 'fulfilled' ? timelineResult.value : []
  loading.value = false
}
onMounted(load)
</script>
