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
            <el-form-item label="供应商ID" required>
              <el-input-number
                :model-value="form.supplierId"
                :min="1"
                :precision="0"
                placeholder="请输入供应商编号"
                style="width:100%"
                @change="(value: number | string | null | undefined) => (form.supplierId = clampPositiveInt(value, 1))"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="采购日期" required>
              <el-date-picker
                v-model="form.purchaseDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择采购日期"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请人ID" required>
              <el-input-number
                :model-value="form.applicantId"
                :min="1"
                :precision="0"
                placeholder="请输入申请人编号"
                style="width:100%"
                @change="(value: number | string | null | undefined) => (form.applicantId = clampPositiveInt(value, 1))"
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
        <el-table-column label="商品ID" width="140">
          <template #default="{ row }">
            <el-input-number
              :model-value="row.productId"
              :min="1"
              :precision="0"
              style="width:100%"
              @change="(value: number | string | null | undefined) => (row.productId = clampPositiveInt(value, 1))"
            />
          </template>
        </el-table-column>
        <el-table-column label="单价" width="160">
          <template #default="{ row }">
            <el-input-number v-model="row.purchasePrice" :precision="2" :min="0" style="width:100%" />
          </template>
        </el-table-column>
        <el-table-column label="数量" width="160">
          <template #default="{ row }">
            <el-input-number v-model="row.purchaseQuantity" :min="0" style="width:100%" />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            ¥ {{ ((row.purchasePrice || 0) * (row.purchaseQuantity || 0)).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ $index }">
            <el-button type="danger" link @click="form.details.splice($index, 1)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { purchaseApi } from '../../api/purchase';
import { canCreatePurchase, canEditPurchaseBeforeApproval } from '../../utils/purchasePermissions';
import type { PurchaseFormDto, PurchaseOrder } from '../../types/purchase';

const route = useRoute();
const router = useRouter();
const isEdit = ref(!!route.params.id);
const submitting = ref(false);

const clampPositiveInt = (value: number | string | null | undefined, fallback = 1) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) return fallback;
  return Math.floor(num);
};

const form = reactive<PurchaseFormDto>({
  supplierId: null,
  purchaseDate: '',
  applicantId: null,
  details: [],
});

const addLine = () => {
  form.details.push({
    productId: 0,
    purchasePrice: 0,
    purchaseQuantity: 0,
  });
};

const unwrapPurchaseDetail = (payload: unknown): PurchaseOrder | null => {
  const maybe = payload as any;
  if (!maybe) return null;
  if (maybe.data && typeof maybe.data === 'object') {
    const inner = maybe.data;
    if (inner && typeof inner === 'object' && 'data' in inner) {
      return (inner.data as PurchaseOrder) || null;
    }
    return (inner as PurchaseOrder) || null;
  }
  return maybe as PurchaseOrder | null;
};

const ensureEditable = async () => {
  if (!isEdit.value || !route.params.id) return true;
  try {
    const res = await purchaseApi.getDetail(Number(route.params.id));
    const detail = unwrapPurchaseDetail(res);
    if (!detail || !canEditPurchaseBeforeApproval(detail.status)) {
      ElMessage.warning('只有待审批状态的采购单可以编辑');
      router.replace(`/purchases/${route.params.id}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('校验编辑权限失败:', error);
    ElMessage.warning('当前采购单不能编辑');
    router.replace(`/purchases/${route.params.id}`);
    return false;
  }
};

const loadPurchase = async () => {
  if (!route.params.id) return;
  try {
    const res = await purchaseApi.getDetail(Number(route.params.id));
    const data = unwrapPurchaseDetail(res);
    if (data) {
      form.supplierId = clampPositiveInt(data.supplierId, 1);
      form.purchaseDate = data.purchaseDate;
      form.applicantId = clampPositiveInt(data.applicantId, 1);
      form.details = (data.details || []).map((item) => ({
        productId: clampPositiveInt(item.productId, 1),
        purchasePrice: item.purchasePrice || 0,
        purchaseQuantity: item.purchaseQuantity || 0,
      }));
    }
  } catch (error) {
    console.error('加载采购单失败:', error);
  }
};

const handleSave = async () => {
  if (!isEdit.value && !canCreatePurchase()) {
    ElMessage.warning('当前角色无权创建采购单');
    return;
  }

  if (isEdit.value && route.params.id) {
    try {
      const current = await purchaseApi.getDetail(Number(route.params.id));
      const detail = unwrapPurchaseDetail(current);
      if (!detail || detail.status !== '待审批') {
        ElMessage.warning('只有待审批状态的采购单才能编辑');
        router.replace(`/purchases/${route.params.id}`);
        return;
      }
    } catch (error) {
      console.error('校验采购单状态失败:', error);
      ElMessage.warning('无法确认采购单状态，禁止编辑');
      router.replace(`/purchases/${route.params.id}`);
      return;
    }
  }

  if (!form.supplierId || !form.applicantId) {
    ElMessage.warning('供应商ID和申请人ID不能为空');
    return;
  }

  const validDetails = form.details
    .filter((item) => (item.productId || 0) > 0 && (item.purchaseQuantity || 0) > 0 && (item.purchasePrice || 0) > 0)
    .map((item) => ({
      productId: item.productId,
      purchaseQuantity: item.purchaseQuantity,
      purchasePrice: item.purchasePrice,
    }));

  if (validDetails.length === 0) {
    ElMessage.warning('请至少添加一条有效商品明细');
    return;
  }

  const submitData: PurchaseFormDto = {
    supplierId: form.supplierId,
    purchaseDate: form.purchaseDate,
    applicantId: form.applicantId,
    details: validDetails,
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
    ElMessage.error('保存失败');
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  if (isEdit.value) {
    const editable = await ensureEditable();
    if (editable) {
      loadPurchase();
    }
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
