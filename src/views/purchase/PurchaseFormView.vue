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
          <el-col :xs="24" :md="8">
            <el-form-item label="供应商" required>
              <el-select v-model="form.supplierId" filterable placeholder="搜索并选择供应商" :loading="optionLoading" style="width:100%">
                <el-option v-for="item in suppliers" :key="item.supplierId" :label="item.supplierName" :value="item.supplierId"><span>{{ item.supplierName }}</span><small class="option-meta">#{{ item.supplierId }} · {{ item.contactName || '暂无联系人' }}</small></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="8">
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
          <el-col :xs="24" :md="8">
            <el-form-item label="申请人" required>
              <el-input :model-value="applicantLabel" disabled />
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
        <el-table-column label="商品" min-width="250">
          <template #default="{ row }">
            <el-select v-model="row.productId" filterable placeholder="搜索商品名称或条码" :loading="optionLoading" style="width:100%" @change="selectProduct(row)">
              <el-option v-for="item in products" :key="item.productId" :label="item.productName" :value="item.productId" :disabled="isProductSelected(item.productId, row)"><span>{{ item.productName }}</span><small class="option-meta">{{ item.barcode || `#${item.productId}` }} · {{ item.specification || '暂无规格' }}</small></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="160">
          <template #default="{ row }">
            <el-input-number v-model="row.purchasePrice" :precision="2" :min="0.01" style="width:100%" />
          </template>
        </el-table-column>
        <el-table-column label="数量" width="160">
          <template #default="{ row }">
            <el-input-number v-model="row.purchaseQuantity" :min="1" :precision="0" style="width:100%" />
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
      <div v-if="!form.details.length" class="empty-lines">暂无商品，请点击“添加商品”</div>
      <div class="purchase-summary"><span>商品种类<strong>{{ validLineCount }}</strong></span><span>采购总件数<strong>{{ totalQuantity }}</strong></span><span>预计总金额<strong>¥ {{ totalAmount.toFixed(2) }}</strong></span></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { purchaseApi } from '../../api/purchase';
import { supplierApi } from '../../api/supplier';
import { productApi } from '../../api/product';
import { useAuthStore } from '../../stores/auth';
import { canCreatePurchase, canEditPurchaseBeforeApproval } from '../../utils/purchasePermissions';
import type { PurchaseFormDto, PurchaseOrder } from '../../types/purchase';
import type { Supplier } from '../../types/supplier';
import type { ProductListItem } from '../../types/product';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isEdit = ref(!!route.params.id);
const submitting = ref(false);
const optionLoading = ref(false);
const suppliers = ref<Supplier[]>([]);
const products = ref<ProductListItem[]>([]);
const currentUserId = computed(() => Number(authStore.userInfo?.userId || 0));
const applicantLabel = computed(() => authStore.userInfo?.realName || authStore.userInfo?.username || (form.applicantId ? `用户 #${form.applicantId}` : '未识别当前用户'));

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

const validLineCount = computed(() => form.details.filter(item => item.productId > 0).length);
const totalQuantity = computed(() => form.details.reduce((sum, item) => sum + Number(item.purchaseQuantity || 0), 0));
const totalAmount = computed(() => form.details.reduce((sum, item) => sum + Number(item.purchasePrice || 0) * Number(item.purchaseQuantity || 0), 0));
const isProductSelected = (productId: number, current: PurchaseFormDto['details'][number]) => form.details.some(item => item !== current && item.productId === productId);
const selectProduct = (row: PurchaseFormDto['details'][number]) => {
  const product = products.value.find(item => item.productId === row.productId);
  if (!product) return;
  row.productName = product.productName;
  if (!(row.purchasePrice > 0)) row.purchasePrice = Number(product.purchasePrice || 0);
};

const applyInventorySuggestion = () => {
  if (isEdit.value || route.query.source !== 'inventory-warning') return;
  const productId = Number(route.query.productId);
  const product = products.value.find(item => item.productId === productId);
  if (!product) return;
  const suggestedQuantity = Math.max(1, Number(product.stockWarning || 0) - Number(product.currentStock || 0));
  form.supplierId = product.supplierId || form.supplierId;
  form.details = [{
    productId: product.productId,
    productName: product.productName,
    purchasePrice: Number(product.purchasePrice || 0),
    purchaseQuantity: suggestedQuantity,
  }];
  ElMessage.success(`已根据库存预警带入 ${product.productName}，请确认采购数量和价格`);
};

const loadOptions = async () => {
  optionLoading.value = true;
  try {
    const [supplierResult, productResult] = await Promise.all([
      supplierApi.getList({ page: 1, size: 200 }),
      productApi.getList({ page: 1, size: 200 }),
    ]);
    suppliers.value = (supplierResult?.list || []).filter(item => item.status === '启用');
    products.value = (productResult?.list || []).filter(item => item.status !== '停用');
  } catch {
    ElMessage.warning('供应商或商品选项加载失败，请刷新后重试');
  } finally {
    optionLoading.value = false;
  }
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
    ElMessage.warning('请选择供应商，并确认当前登录用户信息完整');
    return;
  }

  const selectedIds = form.details.filter(item => item.productId > 0).map(item => item.productId);
  if (new Set(selectedIds).size !== selectedIds.length) {
    ElMessage.warning('同一商品不能重复添加');
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
  await loadOptions();
  if (isEdit.value) {
    const editable = await ensureEditable();
    if (editable) {
      loadPurchase();
    }
  } else {
    form.applicantId = currentUserId.value || null;
    form.purchaseDate = new Date().toISOString().slice(0, 10);
    addLine();
    applyInventorySuggestion();
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
.option-meta{float:right;margin-left:24px;color:#909399}.empty-lines{padding:30px;text-align:center;color:#909399;border:1px dashed #dfe5ed;border-top:0}.purchase-summary{padding:18px 4px 2px;display:flex;justify-content:flex-end;gap:30px;color:#6f7c90}.purchase-summary strong{margin-left:8px;color:#27364b;font-size:16px}.purchase-summary span:last-child strong{color:#1677ff;font-size:19px}@media(max-width:680px){.purchase-page{padding:12px}.page-head{align-items:flex-start;gap:12px;flex-direction:column}.btns{width:100%}.btns>*{flex:1}.purchase-summary{align-items:flex-end;gap:8px;flex-direction:column}.option-meta{display:none}}
</style>
