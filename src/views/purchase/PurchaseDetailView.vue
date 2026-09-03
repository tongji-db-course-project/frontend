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
              <label>供应商：</label>
              <span>{{ detail.supplierName || `供应商 #${detail.supplierId ?? '-'}` }}</span>
            </div>
            <div class="info-item"><label>采购日期：</label><span>{{ detail.purchaseDate }}</span></div>
            <div class="info-item"><label>申请人：</label><span>{{ detail.applicantName || `用户 #${detail.applicantId ?? '-'}` }}</span></div>
            <div class="info-item">
              <label>总金额：</label>
              <span class="money">¥ {{ detail.totalAmount ? detail.totalAmount.toFixed(2) : '0.00' }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <el-button v-if="detail.status === '待审批' && canApproveOrReject" type="success" @click="approveOrder">审批通过</el-button>
            <el-button v-if="detail.status === '待审批' && canApproveOrReject" type="warning" @click="rejectOrder">驳回</el-button>
            <el-button v-if="canCancelPurchase(detail.status)" type="danger" @click="cancelOrder">作废</el-button>
            <el-button v-if="detail.status === '已审批' && canStockIn" type="primary" @click="openStockIn">采购入库</el-button>
            <el-button v-if="canEditPurchase(detail.status)" @click="$router.push(`/purchases/edit/${detail.orderId}`)">编辑</el-button>
          </div>
        </section>

        <section class="content-card" style="margin-top:20px">
          <div class="card-title">商品明细清单</div>
          <el-table :data="detail.details" border class="beautify-table">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column label="商品" min-width="180"><template #default="{ row }">{{ row.productName || `商品 #${row.productId}` }}</template></el-table-column>
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
          <el-timeline v-if="timeline.length"><el-timeline-item v-for="item in timeline" :key="item.logId" :timestamp="item.changeTime || '-'" type="success"><b>{{ item.newStatus }}</b><p>{{ item.remark || `操作人 #${item.operatorId}` }}</p></el-timeline-item></el-timeline><el-empty v-else description="暂无状态流转记录" :image-size="60" />
        </section>
      </aside>
    </div>
    </template>
    <el-empty v-else-if="!loading" description="未找到采购单"><el-button type="primary" @click="$router.push('/purchases')">返回列表</el-button></el-empty>

    <el-dialog v-model="stockInVisible" title="采购入库确认" width="720px" destroy-on-close>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="入库仓库" required><el-select v-model="stockInWarehouseId" placeholder="请选择仓库" style="width:100%"><el-option v-for="item in warehouses" :key="item.warehouseId" :label="item.warehouseName" :value="item.warehouseId" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="入库日期" required><el-date-picker v-model="stockInDate" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-table :data="stockInItems" border>
          <el-table-column label="商品" min-width="180"><template #default="{row}">{{row.productName || `商品 #${row.productId}`}}</template></el-table-column>
          <el-table-column prop="orderedQuantity" label="订单数量" width="110" />
          <el-table-column label="实际入库" width="170"><template #default="{row}"><el-input-number v-model="row.stockInQuantity" :min="0" :precision="0" style="width:100%" /></template></el-table-column>
          <el-table-column label="校验" width="100"><template #default="{row}"><el-tag :type="row.stockInQuantity===row.orderedQuantity?'success':'danger'">{{row.stockInQuantity===row.orderedQuantity?'一致':'不一致'}}</el-tag></template></el-table-column>
        </el-table>
        <el-alert v-if="hasStockInDifference" title="实际入库数量必须与采购单数量一致，请核对后再提交。" type="warning" :closable="false" show-icon style="margin-top:12px" />
        <el-form-item label="入库说明" style="margin-top:14px"><el-input v-model="stockInRemark" maxlength="200" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="stockInVisible=false">取消</el-button><el-button type="primary" :loading="stockingIn" :disabled="hasStockInDifference||!stockInWarehouseId" @click="submitStockIn">确认入库</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { purchaseApi } from '../../api/purchase';
import { inventoryApi } from '../../api/inventory';
import { useAuthStore } from '../../stores/auth';
import { canApproveOrStockIn, canCancelPurchaseBeforeApproval, canEditPurchaseBeforeApproval } from '../../utils/purchasePermissions';
import type { PurchaseOrder } from '../../types/purchase';
import type { Warehouse } from '../../types/inventory';
import type { OrderTimelineItem } from '../../types/common';

const route = useRoute();
const router = useRouter();
const detail = ref<PurchaseOrder | null>(null);
const loading = ref(false);
const timeline = ref<OrderTimelineItem[]>([]);
const authStore = useAuthStore();
const currentUserId = () => Number(authStore.userInfo?.userId || 0);
const canApproveOrReject = computed(() => canApproveOrStockIn());
const canStockIn = computed(() => canApproveOrStockIn());
const canEditPurchase = (status?: string) => canEditPurchaseBeforeApproval(status);
const canCancelPurchase = (status?: string) => canCancelPurchaseBeforeApproval(status);
const stockInVisible = ref(false);
const stockingIn = ref(false);
const warehouses = ref<Warehouse[]>([]);
const stockInWarehouseId = ref<number | null>(null);
const stockInDate = ref('');
const stockInRemark = ref('采购入库');
const stockInItems = ref<Array<{ productId: number; productName?: string; orderedQuantity: number; stockInQuantity: number }>>([]);
const hasStockInDifference = computed(() => stockInItems.value.some(item => item.stockInQuantity !== item.orderedQuantity));

const approveOrder = async () => {
  if (!detail.value) return;
  if (!canApproveOrStockIn()) {
    ElMessage.warning('只有管理员、采购员可以审批采购单');
    return;
  }
  try {
    await purchaseApi.approve(detail.value.orderId, { approverId: currentUserId(), remark: '审批通过' });
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
      ElMessage.warning('只有管理员、采购员可以驳回采购单');
      return;
    }
    await purchaseApi.reject(detail.value.orderId, { approverId: currentUserId(), remark: '审批驳回' });
    detail.value = { ...detail.value, status: '已驳回' };
    ElMessage.success('驳回成功');
  } catch (error) {
    console.error(error);
    ElMessage.error('驳回失败');
  }
};

const openStockIn = async () => {
  if (!detail.value) return;
  try {
    if (!canApproveOrStockIn()) {
      ElMessage.warning('只有管理员、采购员可以进行采购入库');
      return;
    }
    warehouses.value = (await inventoryApi.getWarehouses() || []).filter(item => item.status !== '禁用');
    if (!warehouses.value.length) { ElMessage.warning('没有可用仓库，无法入库'); return; }
    stockInWarehouseId.value = warehouses.value.length === 1 ? warehouses.value[0]?.warehouseId || null : null;
    stockInDate.value = new Date().toISOString().split('T')[0];
    stockInRemark.value = '采购入库';
    stockInItems.value = (detail.value.details || []).map(item => ({ productId: item.productId, productName: item.productName, orderedQuantity: item.purchaseQuantity, stockInQuantity: item.purchaseQuantity }));
    stockInVisible.value = true;
  } catch (error) {
    console.error(error);
    ElMessage.error('仓库列表加载失败');
  }
};

const submitStockIn = async () => {
  if (!detail.value || !stockInWarehouseId.value || hasStockInDifference.value) return;
  stockingIn.value = true;
  try {
    await purchaseApi.stockIn(detail.value.orderId, {
      operatorId: currentUserId(),
      warehouseId: stockInWarehouseId.value,
      stockInDate: stockInDate.value,
      details: stockInItems.value.map((item) => ({
        productId: item.productId,
        stockInQuantity: item.stockInQuantity,
      })),
      remark: stockInRemark.value || '采购入库',
    });
    detail.value = { ...detail.value, status: '已入库' };
    stockInVisible.value = false;
    ElMessage.success('采购入库成功');
  } catch (error) {
    console.error(error);
    ElMessage.error('入库失败');
  } finally {
    stockingIn.value = false;
  }
};

const cancelOrder = async () => {
  if (!detail.value) return;
  if (!canCancelPurchaseBeforeApproval(detail.value.status)) {
    ElMessage.warning('只有管理员、采购员可以作废采购单（待审批、已驳回、已审批状态）');
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
  loading.value = true;
  try {
    const orderId = Number(route.params.id);
    const [res, logs] = await Promise.all([purchaseApi.getDetail(orderId), purchaseApi.getTimeline(orderId)]);
    detail.value = unwrapResponse<PurchaseOrder>(res) || null;
    timeline.value = logs || [];
    if (detail.value && detail.value.status !== '待审批' && route.name === 'PurchaseEdit') {
      ElMessage.warning('只有待审批采购单可以编辑');
      router.replace(`/purchases/${detail.value.orderId}`);
    }
  } catch (error) {
    console.error('获取采购单详情失败:', error);
  } finally {
    loading.value = false;
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
