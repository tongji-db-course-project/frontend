<template>
  <div class="purchase-page">
    <header class="page-head">
      <div>
        <p>首页 / 采购管理 / 采购单列表</p>
        <h1>采购管理</h1>
      </div>
      <button class="primary-btn" @click="$router.push('/purchases/create')">
        <el-icon><Plus /></el-icon>新建采购单
      </button>
    </header>

    <section class="stats">
      <article>
        <small>待提交</small>
        <strong>{{ draftCount }}</strong>
      </article>
      <article class="warning">
        <small>待审批</small>
        <strong>{{ pendingCount }}</strong>
      </article>
      <article class="success">
        <small>已入库</small>
        <strong>{{ stockInCount }}</strong>
      </article>
    </section>

    <div class="main-card">
      <div class="toolbar">
        <el-input v-model="queryParams.keyword" placeholder="搜索单号、供应商..." class="search-box">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable @change="getList">
          <el-option v-for="s in ['草稿','待审批','已审批','已入库']" :key="s" :label="s" :value="s" />
        </el-select>
        <el-button type="primary" @click="getList">查询</el-button>
      </div>

      <el-table :data="list" v-loading="loading" border stripe class="custom-table">
        <el-table-column prop="orderCode" label="采购单号">
          <template #default="{row}">
            <el-link type="primary" @click="$router.push(`/purchases/${row.orderId}`)">{{ row.orderCode }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="supplierName" label="供应商" />
        <el-table-column prop="purchaseDate" label="日期" width="120" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="{row}">¥ {{ row.totalAmount.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{row}">
            <span class="status-tag" :class="row.status">{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{row}">
            <el-button link type="primary" @click="$router.push(`/purchases/${row.orderId}`)">详情</el-button>
            <el-button v-if="row.status==='草稿'" link type="primary" @click="$router.push(`/purchases/edit/${row.orderId}`)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Plus, Search } from '@element-plus/icons-vue';
import { purchaseApi } from '../../api/purchase';
import type { PurchaseOrder } from '../../types/purchase';

const loading = ref(false);
const list = ref<PurchaseOrder[]>([]);
const draftCount = ref(0), pendingCount = ref(0), stockInCount = ref(0);
const queryParams = reactive({ page: 1, size: 10, keyword: '', status: '' });

const getList = async () => {
  loading.value = true;
  const res = await purchaseApi.getList(queryParams);
  list.value = res.data.data.list;
  // 模拟更新统计
  draftCount.value = list.value.filter(x => x.status === '草稿').length;
  pendingCount.value = list.value.filter(x => x.status === '待审批').length;
  stockInCount.value = list.value.filter(x => x.status === '已入库').length;
  loading.value = false;
};

onMounted(getList);
</script>

<style scoped>
.purchase-page { padding: 20px; background: #f0f2f5; min-height: 100vh; }
.page-head { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
.page-head p { font-size: 12px; color: #8c8c8c; margin: 0; }
.page-head h1 { margin: 4px 0 0; font-size: 22px; }
.primary-btn { background: #1890ff; color: #fff; border: 0; padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.stats article { background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #1890ff; }
.stats article.warning { border-left-color: #faad14; }
.stats article.success { border-left-color: #52c41a; }
.stats small { color: #8c8c8c; }
.stats strong { display: block; font-size: 24px; margin-top: 5px; }

.main-card { background: #fff; padding: 20px; border-radius: 8px; }
.toolbar { margin-bottom: 20px; display: flex; gap: 10px; }
.search-box { width: 260px; }

.status-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.status-tag.草稿 { background: #f5f5f5; color: #595959; }
.status-tag.待审批 { background: #fff7e6; color: #faad14; }
.status-tag.已入库 { background: #f6ffed; color: #52c41a; }
</style>