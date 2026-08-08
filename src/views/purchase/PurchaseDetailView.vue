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
            <div class="info-item">
              <label>供应商：</label>
              <span>{{ detail.supplierName || (detail.supplierId ? `供应商 ID: ${detail.supplierId}` : '-') }}</span>
            </div>
            <div class="info-item"><label>采购日期：</label><span>{{ detail.purchaseDate }}</span></div>
            <div class="info-item"><label>申请人：</label><span>{{ detail.applicantName || '陈经理' }}</span></div>
            <div class="info-item">
              <label>总金额：</label>
              <span class="money">¥ {{ detail.totalAmount ? detail.totalAmount.toFixed(2) : '0.00' }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <el-button v-if="detail.status === '草稿'" type="primary" @click="$router.push(`/purchases/edit/${detail.orderId}`)">编辑</el-button>
            <el-button v-if="detail.status === '草稿'" type="warning" @click="submitApproval">提交审批</el-button>
            <el-button type="danger" @click="deleteOrder">删除</el-button>
          </div>
        </section>

        <section class="content-card" style="margin-top:20px">
          <div class="card-title">商品明细清单</div>
          <el-table :data="detail.details" border class="beautify-table">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column label="商品名称">
              <template #default="{row}">
                {{ row.productName || `商品 ID: ${row.productId}` }}
              </template>
            </el-table-column>
            <el-table-column prop="purchasePrice" label="进货单价">
              <template #default="{row}">¥ {{ row.purchasePrice?.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="purchaseQuantity" label="数量" />
            <el-table-column label="小计">
              <template #default="{row}">
                <b>¥ {{ ((row.purchasePrice || 0) * (row.purchaseQuantity || 0)).toFixed(2) }}</b>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </div>

      <!-- 右侧进度 -->
      <aside class="detail-side">
        <section class="content-card">
          <div class="card-title">单据进度</div>
          <el-timeline>
            <el-timeline-item timestamp="已完成" type="success" size="large">
              创建单据
            </el-timeline-item>
            
            <el-timeline-item 
              :timestamp="detail.status !== '草稿' ? '已完成' : '待处理'" 
              :type="detail.status !== '草稿' ? 'success' : 'info'"
              :hollow="detail.status === '草稿'"
              size="large">
              提交审批
            </el-timeline-item>

            <el-timeline-item 
              :timestamp="detail.status === '已入库' ? '已完成' : '等待中'" 
              :type="detail.status === '已入库' ? 'success' : 'info'"
              :hollow="detail.status !== '已入库'"
              size="large">
              入库完成
            </el-timeline-item>
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
import { ElMessage } from 'element-plus';

const route = useRoute();
const detail = ref<PurchaseOrder | null>(null);

const submitApproval = async () => {
  if (!detail.value) return;
  try {
    await purchaseApi.submit(detail.value.orderId);
    detail.value = { ...detail.value, status: '待审批' };
    ElMessage.success('提交审批成功');
  } catch (error) {
    console.error(error);
  }
};

const deleteOrder = async () => {
  if (!detail.value) return;
  try {
    await purchaseApi.delete(detail.value.orderId);
    ElMessage.success('删除成功');
    history.back();
  } catch (error) {
    console.error(error);
  }
};

onMounted(async () => {
  try {
    const res = await purchaseApi.getDetail(Number(route.params.id));
    // 兼容 Axios 响应与拦截器直接返回 data 的两种格式
    detail.value = res.data?.data || res.data || null;
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
</style>