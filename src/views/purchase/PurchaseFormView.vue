<template>
  <div class="purchase-page">
    <header class="page-head">
      <div>
        <p>首页 / 采购管理 / 采购单列表 / {{ isEdit ? '编辑' : '新建' }}</p>
        <h1>{{ isEdit ? '编辑采购单' : '新建采购单' }}</h1>
      </div>
      <div class="btns">
        <el-button @click="$router.back()">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">保存并返回</el-button>
      </div>
    </header>

    <el-card class="form-card" title="基础信息">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="供应商" required>
              <el-input v-model="form.supplierName" placeholder="输入供应商名称" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日期" required>
              <el-date-picker 
                v-model="form.purchaseDate" 
                type="date" 
                value-format="YYYY-MM-DD" 
                placeholder="选择采购日期"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="form-card" style="margin-top:20px">
      <template #header>
        <div class="card-header">
          <span>商品明细</span>
          <el-button type="primary" link @click="addLine">+ 添加商品</el-button>
        </div>
      </template>
      <el-table :data="form.details" border stripe>
        <el-table-column label="商品" min-width="200">
          <template #default="{row}">
            <el-input v-model="row.productName" placeholder="输入商品名称"/>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="150">
          <template #default="{row}">
            <el-input-number v-model="row.purchasePrice" :precision="2" :min="0" style="width:100%"/>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="150">
          <template #default="{row}">
            <el-input-number v-model="row.purchaseQuantity" :min="0" style="width:100%"/>
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template #default="{row}">
            ¥ {{ ((row.purchasePrice || 0) * (row.purchaseQuantity || 0)).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{$index}">
            <el-button type="danger" link @click="form.details.splice($index,1)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { purchaseApi } from '../../api/purchase';
import { ElMessage } from 'element-plus';
import type { PurchaseFormDto, PurchaseOrder } from '../../types/purchase';

const route = useRoute();
const router = useRouter();
const isEdit = ref(!!route.params.id);
const submitting = ref(false);

const form = reactive<PurchaseFormDto>({
  supplierId: null,
  supplierName: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  applicantId: 1,
  details: []
});

const addLine = () => {
  form.details.push({
    productId: 0,
    productName: '',
    purchasePrice: 0,
    purchaseQuantity: 0
  });
};

const loadPurchase = async () => {
  if (!route.params.id) return;
  try {
    const res = await purchaseApi.getDetail(Number(route.params.id));
    const data = res as PurchaseOrder;
    if (data) {
      form.supplierId = data.supplierId;
      form.supplierName = data.supplierName || '';
      form.purchaseDate = data.purchaseDate;
      form.applicantId = data.applicantId;
      form.details = (data.details || []).map(item => ({
        productId: item.productId || 0,
        productName: item.productName || '',
        purchasePrice: item.purchasePrice || 0,
        purchaseQuantity: item.purchaseQuantity || 0,
      }));
    }
  } catch (error) {
    console.error('加载采购单失败:', error);
  }
};

const handleSave = async () => {
  // 使用可选链 `?.` 避免未定义引发 TS 报错
  const supplierNameStr = form.supplierName?.trim() || '';
  if (!supplierNameStr) {
    ElMessage.warning('请输入供应商名称');
    return;
  }

  // 使用可选链与非空约束保障 TS 安全
  const validDetails = form.details
    .filter(item => (item.productName?.trim() ?? '') !== '' && (item.purchaseQuantity || 0) > 0 && (item.purchasePrice || 0) > 0)
    .map(item => ({
      productId: item.productId || 0,
      productName: item.productName!.trim(),
      purchaseQuantity: item.purchaseQuantity,
      purchasePrice: item.purchasePrice,
    }));

  if (validDetails.length === 0) {
    ElMessage.warning('请至少添加一种有效的商品（需填商品名称、单价>0、数量>0）');
    return;
  }

  const submitData = {
    ...form,
    supplierName: supplierNameStr,
    details: validDetails
  };

  submitting.value = true;
  try {
    if (isEdit.value) {
      await purchaseApi.update(Number(route.params.id), submitData);
    } else {
      await purchaseApi.create(submitData);
    }
    ElMessage.success('保存成功');
    router.push('/purchases');
  } catch (err) {
    console.error('保存失败:', err);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (isEdit.value) {
    loadPurchase();
  } else {
    addLine();
  }
});
</script>

<style scoped>
.purchase-page { padding: 20px; background: #f0f2f5; min-height: 100vh; }
.page-head { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
.page-head p { font-size: 12px; color: #8c8c8c; margin: 0; }
.page-head h1 { margin: 4px 0 0; font-size: 22px; }
.btns { display: flex; gap: 10px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
