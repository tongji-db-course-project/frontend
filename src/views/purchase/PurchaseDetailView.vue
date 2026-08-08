<template>
  <div class="purchase-page" v-if="detail">
    <header class="page-head">
      <div>
        <p>首页 / 采购管理 / 采购单列表 / 采购单详情</p>
        <h1>采购单：{{ detail.orderCode }}</h1>
      </div>
      <el-button @click="$router.back()">返回</el-button>
    </header>

    <div class="detail-container">
      <!-- 左侧主内容 -->
      <div class="detail-main">
        <section class="content-card">
          <div class="card-title">基本信息</div>
          <div class="info-grid">
            <div class="info-item"><label>供应商：</label><span>{{ detail.supplierName }}</span></div>
            <div class="info-item"><label>采购日期：</label><span>{{ detail.purchaseDate }}</span></div>
            <div class="info-item"><label>申请人：</label><span>{{ detail.applicantName || '陈经理' }}</span></div>
            <div class="info-item"><label>总金额：</label><span class="money">¥ {{ detail.totalAmount.toFixed(2) }}</span></div>
          </div>
          <div class="detail-actions">
            <el-button type="primary" @click="$router.push(`/purchases/edit/${detail.orderId}`)">编辑</el-button>
            <el-button v-if="detail.status === '草稿'" type="warning" @click="submitApproval">提交审批</el-button>
            <el-button type="danger" @click="deleteOrder">删除</el-button>
          </div>
        </section>

        <section class="content-card" style="margin-top:20px">
          <div class="card-title">商品明细清单</div>
          <el-table :data="detail.details" border class="beautify-table">
            <th-table-column type="index" label="#" />
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="purchasePrice" label="进货单价">
              <template #default="{row}">¥ {{ row.purchasePrice.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="purchaseQuantity" label="数量" />
            <el-table-column label="小计">
              <template #default="{row}"><b>¥ {{ (row.purchasePrice * row.purchaseQuantity).toFixed(2) }}</b></template>
            </el-table-column>
          </el-table>
        </section>
      </div>

      <!-- 右侧时间轴 -->
      <aside class="detail-side">
        <section class="content-card">
          <div class="card-title">单据进度</div>
          <el-timeline>
            <el-timeline-item timestamp="2026-08-04" type="success" color="#0bbd87">创建单据</el-timeline-item>
            <el-timeline-item timestamp="2026-08-05" :type="detail.status !== '草稿' ? 'success' : ''">提交审批</el-timeline-item>
            <el-timeline-item timestamp="等待中" :type="detail.status === '已入库' ? 'success' : ''">入库完成</el-timeline-item>
          </el-timeline>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { purchaseApi } from '../../api/purchase';
import type { PurchaseOrder } from '../../types/purchase';

const route = useRoute();
const detail = ref<PurchaseOrder | null>(null);

const submitApproval = async () => {
  if (!detail.value) return;
  try {
    await purchaseApi.submit(detail.value.orderId);
    detail.value.status = '待审批';
  } catch (error) {
    console.error(error);
  }
};

const deleteOrder = async () => {
  if (!detail.value) return;
  try {
    await purchaseApi.delete(detail.value.orderId);
    history.back();
  } catch (error) {
    console.error(error);
  }
};

onMounted(async () => {
  const res = await purchaseApi.getDetail(Number(route.params.id));
  detail.value = res.data.data;
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
</style>