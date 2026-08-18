<template>
  <div class="purchase-page" v-loading="loading">
    <template v-if="detail">
    <header class="page-head">
      <div>
        <p>首页 / 采购管理 / 采购单列表 / 采购单详情</p>
        <h1>采购单：{{ detail.orderCode }}</h1>
      </div>
      <el-button @click="$router.back()">返回</el-button>
    </header>

    <div class="detail-container">
      <div class="detail-main">
        <section class="content-card">
          <div class="card-title">基本信息</div>
          <div class="info-grid">
            <div class="info-item">
              <label>供应商ID：</label>
              <span>{{ detail.supplierId ?? '-' }}</span>
            </div>
            <div class="info-item"><label>采购日期：</label><span>{{ detail.purchaseDate }}</span></div>
            <div class="info-item"><label>申请人ID：</label><span>{{ detail.applicantId ?? '-' }}</span></div>
            <div class="info-item">
              <label>总金额：</label>
              <span class="money">¥ {{ detail.totalAmount ? detail.totalAmount.toFixed(2) : '0.00' }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <el-button v-if="detail.status === '待审批' && canApproveOrReject" type="success" @click="approveOrder">审批通过</el-button>
            <el-button v-if="detail.status === '待审批' && canApproveOrReject" type="warning" @click="rejectOrder">驳回</el-button>
            <el-button v-if="detail.status === '待审批' && canCancelPurchase(detail.status)" type="danger" @click="cancelOrder">作废</el-button>
            <el-button v-if="detail.status === '已审批' && canStockIn" type="primary" @click="stockInOrder">采购入库</el-button>
            <el-button v-if="canEditPurchase(detail.status)" @click="$router.push(`/purchases/edit/${detail.orderId}`)">编辑</el-button>
          </div>
        </section>

        <section class="content-card" style="margin-top:20px">
          <div class="card-title">商品明细清单</div>
          <el-table :data="detail.details" border class="beautify-table">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="productId" label="商品ID" width="120" />
            <el-table-column prop="purchasePrice" label="采购单价">
              <template #default="{ row }">¥ {{ row.purchasePrice?.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="purchaseQuantity" label="数量" />
            <el-table-column label="小计">
              <template #default="{ row }">
                <b>¥ {{ ((row.purchasePrice || 0) * (row.purchaseQuantity || 0)).toFixed(2) }}</b>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </div>

      <aside class="detail-side">
        <section class="content-card">
          <div class="card-title">单据进度</div>
          <el-timeline>
            <el-timeline-item timestamp="已完成" type="success" size="large">创建单据</el-timeline-item>
            <el-timeline-item
              :timestamp="detail.status === '待审批' ? '待处理' : '已完成'"
              :type="detail.status === '待审批' ? 'info' : 'success'"
              :hollow="detail.status === '待审批'"
              size="large"
            >
              审批处理
            </el-timeline-item>
            <el-timeline-item
              :timestamp="detail.status === '已入库' ? '已完成' : '等待中'"
              :type="detail.status === '已入库' ? 'success' : 'info'"
              :hollow="detail.status !== '已入库'"
              size="large"
            >
              入库完成
            </el-timeline-item>
          </el-timeline>
        </section>
      </aside>
    </div>
    </template>
    <el-empty v-else-if="!loading" description="未找到采购单"><el-button type="primary" @click="$router.push('/purchases')">返回列表</el-button></el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { purchaseApi } from '../../api/purchase';
import { canApproveOrStockIn, canCancelPurchaseBeforeApproval, canEditPurchaseBeforeApproval } from '../../utils/purchasePermissions';
import type { PurchaseOrder } from '../../types/purchase';

const route = useRoute();
const router = useRouter();
const detail = ref<PurchaseOrder | null>(null);
const canApproveOrReject = computed(() => canApproveOrStockIn());
const canStockIn = computed(() => canApproveOrStockIn());
const canEditPurchase = (status?: string) => canEditPurchaseBeforeApproval(status);
const canCancelPurchase = (status?: string) => canCancelPurchaseBeforeApproval(status);

const approveOrder = async () => {
  if (!detail.value) return;
  if (!canApproveOrStockIn()) {
    ElMessage.warning('只有店长、管理员、库存管理员可以审批采购单');
    return;
  }
  try {
    await purchaseApi.approve(detail.value.orderId, { approverId: 1, remark: '审批通过' });
    detail.value = { ...detail.value, status: '已审批' };
    ElMessage.success('审批通过成功');
  } catch (error) {
    console.error(error);
    ElMessage.error('审批失败');
  }
};

const rejectOrder = async () => {
  if (!detail.value) return;
  try {
    if (!canApproveOrStockIn()) {
      ElMessage.warning('只有店长、管理员、库存管理员可以驳回采购单');
      return;
    }
    await purchaseApi.reject(detail.value.orderId, { approverId: 1, remark: '审批驳回' });
    detail.value = { ...detail.value, status: '已驳回' };
    ElMessage.success('驳回成功');
  } catch (error) {
    console.error(error);
    ElMessage.error('驳回失败');
  }
};

const stockInOrder = async () => {
  if (!detail.value) return;
  try {
    if (!canApproveOrStockIn()) {
      ElMessage.warning('只有店长、管理员、库存管理员可以进行采购入库');
      return;
    }
    await purchaseApi.stockIn(detail.value.orderId, {
      operatorId: 1,
      warehouseId: 1,
      stockInDate: new Date().toISOString().split('T')[0],
      details: (detail.value.details || []).map((item) => ({
        productId: item.productId,
        stockInQuantity: item.purchaseQuantity,
      })),
      remark: '采购入库',
    });
    detail.value = { ...detail.value, status: '已入库' };
    ElMessage.success('采购入库成功');
  } catch (error) {
    console.error(error);
    ElMessage.error('入库失败');
  }
};

const cancelOrder = async () => {
  if (!detail.value) return;
  if (!canCancelPurchaseBeforeApproval(detail.value.status)) {
    ElMessage.warning('只有采购员、店长、管理员可以在待审批状态下作废采购单');
    return;
  }
  try {
    await purchaseApi.remove(detail.value.orderId);
    detail.value = { ...detail.value, status: '已作废' };
    ElMessage.success('作废成功');
  } catch (error) {
    console.error(error);
    ElMessage.error('作废失败');
  }
};

const unwrapResponse = <T>(res: any): T | null => {
  if (!res) return null;
  if (res.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data as T;
  }
  if (res.data && typeof res.data === 'object' && 'orderId' in res.data) {
    return res.data as T;
  }
  return res as T;
};

onMounted(async () => {
  try {
    const res = await purchaseApi.getDetail(Number(route.params.id));
    detail.value = unwrapResponse<PurchaseOrder>(res) || null;
    if (detail.value && detail.value.status !== '待审批' && route.name === 'PurchaseEdit') {
      ElMessage.warning('只有待审批采购单可以编辑');
      router.replace(`/purchases/${detail.value.orderId}`);
    }
  } catch (error) {
    console.error('获取采购单详情失败:', error);
  }
});
</script>

<style scoped>
.purchase-page { padding: 20px; background: #f0f2f5; min-height: 100vh; }
.detail-container { display: flex; gap: 20px; margin-top: 20px; }
.detail-main { flex: 1; }
.detail-side { width: 300px; }

.content-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
.card-title { font-size: 16px; font-weight: bold; margin-bottom: 20px; border-left: 4px solid #1890ff; padding-left: 10px; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.info-item label { color: #8c8c8c; }
.info-item span { color: #262626; font-weight: 500; }
.money { color: #f5222d; font-size: 18px; font-weight: bold !important; }

.beautify-table :deep(thead th) { background-color: #fafafa !important; color: #595959; }
.detail-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
</style>
