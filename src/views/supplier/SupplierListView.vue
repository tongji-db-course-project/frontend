<template>
  <div class="biz-page">
    <PageHeader eyebrow="基础资料 · 合作伙伴" title="供应商管理" description="维护供应商档案、信用等级与结算信息">
      <el-button type="primary" :icon="Plus" @click="openForm()">新增供应商</el-button>
    </PageHeader>

    <section class="biz-stats">
      <StatCard label="供应商总数" :value="total" :icon="OfficeBuilding" />
      <StatCard label="本页启用" :value="enabledCount" :icon="CircleCheckFilled" tone="green" />
      <StatCard label="本页 A 级" :value="aLevelCount" :icon="Medal" tone="orange" />
      <StatCard label="本页停用" :value="disabledCount" :icon="CircleCloseFilled" tone="red" />
    </section>

    <section class="biz-card">
      <div class="biz-toolbar">
        <el-input v-model="query.keyword" placeholder="名称、联系人或手机号" clearable :prefix-icon="Search" @keyup.enter="search" />
        <el-select v-model="query.creditLevel" placeholder="全部信用等级" clearable>
          <el-option v-for="level in ['A','B','C']" :key="level" :label="`${level} 级`" :value="level" />
        </el-select>
        <el-select v-model="query.status" placeholder="全部状态" clearable>
          <el-option label="启用" value="启用" /><el-option label="禁用" value="禁用" />
        </el-select>
        <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button>
        <span class="biz-toolbar__summary">共 {{ total }} 家供应商</span>
      </div>

      <el-table v-loading="loading" :data="suppliers" row-key="supplierId" stripe border class="biz-table">
        <el-table-column label="供应商" min-width="190">
          <template #default="{ row }"><div class="biz-product"><span class="biz-product__avatar">{{ row.supplierName.slice(0, 1) }}</span><div><b>{{ row.supplierName }}</b><small>{{ row.address || '地址未填写' }}</small></div></div></template>
        </el-table-column>
        <el-table-column label="联系人" min-width="135"><template #default="{ row }"><b>{{ row.contactName || '-' }}</b><small class="biz-muted" style="display:block">{{ maskPhone(row.phone) }}</small></template></el-table-column>
        <el-table-column label="信用等级" width="100" align="center"><template #default="{ row }"><el-tag :type="creditTag(row.creditLevel)">{{ row.creditLevel || '-' }}</el-tag></template></el-table-column>
        <el-table-column label="结算周期" width="105" align="center"><template #default="{ row }">{{ row.paymentCycle == null ? '-' : `${row.paymentCycle} 天` }}</template></el-table-column>
        <el-table-column label="最小起订量" width="110" align="right"><template #default="{ row }">{{ formatQuantity(row.minOrderQty) }}</template></el-table-column>
        <el-table-column label="银行账号" min-width="180"><template #default="{ row }"><span>{{ maskBankAccount(row.bankAccount) }}</span><small class="biz-muted" style="display:block">{{ row.bankName || '-' }}</small></template></el-table-column>
        <el-table-column label="状态" width="90" align="center"><template #default="{ row }"><span class="biz-status" :class="row.status === '启用' ? 'green' : 'gray'">{{ row.status }}</span></template></el-table-column>
        <el-table-column label="操作" width="235" fixed="right" align="center"><template #default="{ row }"><el-button link type="primary" @click="openDetail(row)">详情</el-button><el-button link type="primary" @click="openPerformance(row)">表现</el-button><el-button link type="primary" @click="openForm(row)">编辑</el-button><el-button link :type="row.status === '启用' ? 'danger' : 'success'" @click="toggleStatus(row)">{{ row.status === '启用' ? '禁用' : '启用' }}</el-button></template></el-table-column>
      </el-table>
      <div class="biz-pagination"><el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total" v-model:current-page="query.page" v-model:page-size="query.size" :page-sizes="[10,20,50]" @change="load" /></div>
    </section>

    <el-dialog v-model="formVisible" :title="editingId ? '编辑供应商' : '新增供应商'" width="720px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="biz-form-grid">
          <el-form-item label="供应商名称" prop="supplierName"><el-input v-model="form.supplierName" maxlength="100" /></el-form-item>
          <el-form-item label="联系人" prop="contactName"><el-input v-model="form.contactName" maxlength="50" /></el-form-item>
          <el-form-item label="联系电话" prop="phone"><el-input v-model="form.phone" maxlength="20" /></el-form-item>
          <el-form-item label="邮箱" prop="email"><el-input v-model="form.email" maxlength="100" /></el-form-item>
          <el-form-item label="信用等级"><el-select v-model="form.creditLevel"><el-option v-for="level in ['A','B','C']" :key="level" :label="`${level} 级`" :value="level" /></el-select></el-form-item>
          <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="启用">启用</el-radio><el-radio value="禁用">禁用</el-radio></el-radio-group></el-form-item>
          <el-form-item label="结算周期（天）"><el-input-number v-model="form.paymentCycle" :min="0" :max="3650" controls-position="right" /></el-form-item>
          <el-form-item label="最小起订量"><el-input-number v-model="form.minOrderQty" :min="0" controls-position="right" /></el-form-item>
          <el-form-item label="开户银行"><el-input v-model="form.bankName" /></el-form-item>
          <el-form-item label="银行账号"><el-input v-model="form.bankAccount" maxlength="50" /></el-form-item>
        </div>
        <el-form-item label="地址"><el-input v-model="form.address" maxlength="200" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="formVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="供应商详情" size="480px">
      <div v-loading="detailLoading" v-if="selected">
        <h2>{{ selected.supplierName }}</h2><p class="biz-muted">供应商编号 #{{ selected.supplierId }}</p>
        <dl class="biz-detail-grid"><div><dt>联系人</dt><dd>{{ selected.contactName || '-' }}</dd></div><div><dt>联系电话</dt><dd>{{ selected.phone || '-' }}</dd></div><div><dt>邮箱</dt><dd>{{ selected.email || '-' }}</dd></div><div><dt>信用等级</dt><dd>{{ selected.creditLevel || '-' }}</dd></div><div><dt>结算周期</dt><dd>{{ selected.paymentCycle ?? 0 }} 天</dd></div><div><dt>最小起订量</dt><dd>{{ selected.minOrderQty ?? 0 }}</dd></div><div><dt>开户银行</dt><dd>{{ selected.bankName || '-' }}</dd></div><div><dt>银行账号</dt><dd>{{ selected.bankAccount || '-' }}</dd></div><div style="grid-column:1/-1"><dt>地址</dt><dd>{{ selected.address || '-' }}</dd></div></dl>
      </div>
    </el-drawer>
    <el-dialog v-model="performanceVisible" title="供应商表现分析" width="600px"><div v-loading="performanceLoading" v-if="performance"><section class="biz-stats"><StatCard label="已入库订单" :value="performance.stockedOrderCount" :icon="OfficeBuilding"/><StatCard label="采购退货单" :value="performance.returnedOrderCount" :icon="CircleCloseFilled" tone="red"/></section><el-descriptions :column="2" border><el-descriptions-item label="供应商">{{performance.supplierName}}</el-descriptions-item><el-descriptions-item label="自动信誉等级"><el-tag>{{performance.creditLevel}}</el-tag></el-descriptions-item><el-descriptions-item label="按时入库率">{{formatRate(performance.onTimeRate)}}</el-descriptions-item><el-descriptions-item label="采购退货率">{{formatRate(performance.returnRate)}}</el-descriptions-item></el-descriptions></div><template #footer><el-button @click="performanceVisible=false">关闭</el-button><el-button type="primary" :loading="performanceLoading" @click="refreshPerformance">重新计算并更新等级</el-button></template></el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { CircleCheckFilled, CircleCloseFilled, Medal, OfficeBuilding, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { supplierApi } from '../../api/supplier'
import type { Supplier, SupplierPayload, SupplierPerformance, SupplierQuery } from '../../types/supplier'
import { formatQuantity, maskBankAccount, maskPhone } from '../../utils/format'

const suppliers = ref<Supplier[]>([])
const loading = ref(false), saving = ref(false), detailLoading = ref(false)
const formVisible = ref(false), detailVisible = ref(false)
const performanceVisible = ref(false), performanceLoading = ref(false)
const performance = ref<SupplierPerformance | null>(null), performanceSupplierId = ref<number | null>(null)
const total = ref(0), editingId = ref<number | null>(null), selected = ref<Supplier | null>(null)
const query = reactive<SupplierQuery>({ page: 1, size: 10, keyword: '', creditLevel: '', status: '' })
const emptyForm = (): SupplierPayload => ({ supplierName: '', contactName: '', phone: '', email: '', address: '', creditLevel: 'A', paymentCycle: 30, minOrderQty: 0, bankName: '', bankAccount: '', status: '启用' })
const form = reactive<SupplierPayload>(emptyForm())
const formRef = ref<FormInstance>()
const rules: FormRules<SupplierPayload> = {
  supplierName: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  phone: [{ pattern: /^[0-9+()\-\s]{6,20}$/, message: '请输入正确的联系电话', trigger: 'blur' }],
}
const enabledCount = computed(() => suppliers.value.filter(item => item.status === '启用').length)
const disabledCount = computed(() => suppliers.value.filter(item => item.status === '禁用').length)
const aLevelCount = computed(() => suppliers.value.filter(item => item.creditLevel === 'A').length)
const creditTag = (level?: string | null) => level === 'A' ? 'success' : level === 'B' ? 'warning' : 'info'

async function load() { loading.value = true; try { const result = await supplierApi.getList({ ...query, keyword: query.keyword || undefined, creditLevel: query.creditLevel || undefined, status: query.status || undefined }); suppliers.value = result?.list ?? []; total.value = result?.total ?? 0 } catch { suppliers.value = []; total.value = 0 } finally { loading.value = false } }
function search() { query.page = 1; load() }
function reset() { Object.assign(query, { page: 1, size: 10, keyword: '', creditLevel: '', status: '' }); load() }
async function openForm(item?: Supplier) { editingId.value = item?.supplierId ?? null; Object.assign(form, item ? await supplierApi.getDetail(item.supplierId) : emptyForm()); formVisible.value = true }
async function save() { if (!await formRef.value?.validate()) return; saving.value = true; try { if (editingId.value) await supplierApi.update(editingId.value, { ...form }); else await supplierApi.create({ ...form }); ElMessage.success(editingId.value ? '供应商修改成功' : '供应商新增成功'); formVisible.value = false; await load() } finally { saving.value = false } }
async function toggleStatus(item: Supplier) { const next = item.status === '启用' ? '禁用' : '启用'; await ElMessageBox.confirm(`确认${next}供应商“${item.supplierName}”吗？`, `${next}供应商`, { type: 'warning' }); if (next === '禁用') await supplierApi.remove(item.supplierId); else await supplierApi.update(item.supplierId, { ...item, status: next }); ElMessage.success(`供应商已${next}`); await load() }
async function openDetail(item: Supplier) { detailVisible.value = true; detailLoading.value = true; try { selected.value = await supplierApi.getDetail(item.supplierId) } finally { detailLoading.value = false } }
const formatRate = (value: number) => `${(Number(value || 0) * 100).toFixed(2)}%`
async function openPerformance(item: Supplier) { performanceSupplierId.value = item.supplierId; performanceVisible.value = true; await loadPerformance(false) }
async function loadPerformance(update: boolean) { if (!performanceSupplierId.value) return; performanceLoading.value = true; try { performance.value = await supplierApi.getPerformance(performanceSupplierId.value, update); if (update) { ElMessage.success('信誉等级已重新计算'); await load() } } finally { performanceLoading.value = false } }
async function refreshPerformance() { await loadPerformance(true) }
onMounted(load)
</script>
