<template>
  <div class="purchase-page">
    <header class="page-head">
      <div>
        <p>首页 / 采购管理 / 采购单列表</p>
        <h1>采购管理</h1>
      </div>
      <button v-if="canCreatePurchase()" class="primary-btn" @click="$router.push('/purchases/create')">
        <el-icon><Plus /></el-icon>新建采购单
      </button>
    </header>

    <section class="stats">
      <article class="warning" :class="{ active: queryParams.status === '待审批' }" @click="filterByStatus('待审批')">
        <small>本页待审批</small>
        <strong>{{ pendingCount }}</strong>
      </article>
      <article :class="{ active: queryParams.status === '已审批' }" @click="filterByStatus('已审批')">
        <small>本页已审批</small>
        <strong>{{ approvedCount }}</strong>
      </article>
      <article class="success" :class="{ active: queryParams.status === '已入库' }" @click="filterByStatus('已入库')">
        <small>本页已入库</small>
        <strong>{{ stockInCount }}</strong>
      </article>
    </section>

    <div class="main-card">
      <div class="toolbar">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索单号、关键词..."
          class="search-box"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable @change="handleSearch">
          <el-option v-for="s in ['待审批','已审批','已入库','已驳回','已作废']" :key="s" :label="s" :value="s" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>

      <el-table :data="list" v-loading="loading" border stripe class="custom-table">
        <el-table-column prop="orderCode" label="采购单号">
          <template #default="{ row }">
            <el-link type="primary" @click="$router.push(`/purchases/${row.orderId}`)">{{ row.orderCode }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="供应商" min-width="160">
          <template #default="{ row }">{{ row.supplierName || supplierNameOf(row.supplierId) }}</template>
        </el-table-column>
        <el-table-column prop="purchaseDate" label="采购日期" width="120" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="{ row }">¥ {{ (row.totalAmount || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="row.status">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push(`/purchases/${row.orderId}`)">详情</el-button>
            <el-button v-if="canEditPurchase(row.status)" link type="primary" @click="$router.push(`/purchases/edit/${row.orderId}`)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.size" background
          layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 50]" :total="total"
          @current-change="getList" @size-change="handleSizeChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Plus, Search } from '@element-plus/icons-vue';
import { purchaseApi } from '../../api/purchase';
import { supplierApi } from '../../api/supplier';
import { canCreatePurchase, canEditPurchaseBeforeApproval } from '../../utils/purchasePermissions';
import type { PurchaseOrder, PurchaseQueryParams } from '../../types/purchase';
import type { Supplier } from '../../types/supplier';

const loading = ref(false);
const list = ref<PurchaseOrder[]>([]);
const suppliers = ref<Supplier[]>([]);
const total = ref(0);
const pendingCount = ref(0);
const approvedCount = ref(0);
const stockInCount = ref(0);
const queryParams = reactive<PurchaseQueryParams>({
  page: 1,
  size: 10,
  keyword: '',
  status: undefined,
  supplierId: undefined,
});

const unwrapResponse = <T>(res: any): T | null => {
  if (!res) return null;
  if (res.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data as T;
  }
  if (res.data && typeof res.data === 'object' && 'list' in res.data) {
    return res.data as T;
  }
  return res as T;
};

const canEditPurchase = (status?: string) => canEditPurchaseBeforeApproval(status);

const getList = async () => {
  loading.value = true;
  try {
    const res = await purchaseApi.getList(queryParams);
    const payload = unwrapResponse<{ list?: PurchaseOrder[]; total?: number; page?: number; size?: number }>(res);
    list.value = payload?.list ?? [];
    total.value = Number(payload?.total ?? 0);
    queryParams.page = Number(payload?.page || queryParams.page);
    queryParams.size = Number(payload?.size || queryParams.size);

    pendingCount.value = list.value.filter((x) => x.status === '待审批').length;
    approvedCount.value = list.value.filter((x) => x.status === '已审批').length;
    stockInCount.value = list.value.filter((x) => x.status === '已入库').length;
  } catch (error) {
    list.value = [];
    console.error('获取采购列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  queryParams.page = 1;
  getList();
};

const filterByStatus = (status: PurchaseQueryParams['status']) => {
  queryParams.status = queryParams.status === status ? undefined : status;
  handleSearch();
};

const handleSizeChange = () => {
  queryParams.page = 1;
  getList();
};

const supplierNameOf = (supplierId?: number | null) =>
  suppliers.value.find((item) => item.supplierId === supplierId)?.supplierName || `供应商 #${supplierId ?? '-'}`;

const loadSuppliers = async () => {
  try {
    const result = await supplierApi.getList({ page: 1, size: 100, status: '启用' });
    suppliers.value = result?.list ?? [];
  } catch {
    suppliers.value = [];
  }
};

onMounted(() => Promise.all([getList(), loadSuppliers()]));
</script>

<style scoped>
.purchase-page { padding: 20px; background: #f0f2f5; min-height: 100vh; }
.page-head { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
.page-head p { font-size: 12px; color: #8c8c8c; margin: 0; }
.page-head h1 { margin: 4px 0 0; font-size: 22px; }
.primary-btn { background: #1890ff; color: #fff; border: 0; padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.stats article { cursor: pointer; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid transparent; border-left: 4px solid #1890ff; transition: .18s ease; }
.stats article:hover,.stats article.active { border-color: #91caff; box-shadow: 0 4px 14px rgba(24,144,255,.12); transform: translateY(-1px); }
.stats article.warning { border-left-color: #faad14; }
.stats article.success { border-left-color: #52c41a; }
.stats small { color: #8c8c8c; }
.stats strong { display: block; font-size: 24px; margin-top: 5px; }

.main-card { background: #fff; padding: 20px; border-radius: 8px; }
.toolbar { margin-bottom: 20px; display: flex; gap: 10px; }
.search-box { width: 260px; }
.pagination { display: flex; justify-content: flex-end; padding-top: 16px; }

.status-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.status-tag.待审批 { background: #fff7e6; color: #faad14; }
.status-tag.已审批 { background: #e6f7ff; color: #1890ff; }
.status-tag.已入库 { background: #f6ffed; color: #52c41a; }
.status-tag.已驳回 { background: #fff1f0; color: #cf1322; }
.status-tag.已作废 { background: #f5f5f5; color: #8c8c8c; }
</style>
