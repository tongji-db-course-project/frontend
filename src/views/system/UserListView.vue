<template>
  <div class="biz-page">
    <PageHeader eyebrow="系统管理 · 员工账号" title="员工管理" description="维护员工资料、登录账号、岗位角色与账号状态">
      <el-button type="primary" :icon="Plus" @click="openForm()">新增员工</el-button>
    </PageHeader>
    <section class="biz-stats">
      <StatCard label="员工总数" :value="total" :icon="UserFilled" />
      <StatCard label="本页启用" :value="enabledCount" :icon="CircleCheckFilled" tone="green" />
      <StatCard label="本页禁用" :value="disabledCount" :icon="Lock" tone="orange" />
    </section>
    <section class="biz-card">
      <div class="biz-toolbar">
        <el-input v-model.trim="query.keyword" placeholder="账号、姓名或手机号" clearable :prefix-icon="Search" @keyup.enter="search" />
        <el-select v-model="query.status" placeholder="全部状态" clearable><el-option label="启用" value="启用" /><el-option label="禁用" value="禁用" /></el-select>
        <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button>
        <span class="biz-toolbar__summary">共 {{ total }} 名员工</span>
      </div>
      <el-table v-loading="loading" :data="users" row-key="userId" stripe border class="biz-table">
        <el-table-column label="员工" min-width="180"><template #default="{ row }"><div class="biz-product"><span class="biz-product__avatar">{{ (row.realName || row.username).slice(0,1) }}</span><div><b>{{ row.realName || '未填写姓名' }}</b><small>@{{ row.username }}</small></div></div></template></el-table-column>
        <el-table-column label="手机号" min-width="130"><template #default="{ row }">{{ row.phone || '-' }}</template></el-table-column>
        <el-table-column label="性别" width="80"><template #default="{ row }">{{ row.gender || '-' }}</template></el-table-column>
        <el-table-column label="角色" min-width="120"><template #default="{ row }">{{ row.roleName || '未分配' }}</template></el-table-column>
        <el-table-column label="创建时间" width="170"><template #default="{ row }">{{ formatDateTime(row.createTime) }}</template></el-table-column>
        <el-table-column label="状态" width="90" align="center"><template #default="{ row }"><span class="biz-status" :class="row.status === '启用' ? 'green' : 'gray'">{{ row.status || '-' }}</span></template></el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center"><template #default="{ row }"><el-button link type="primary" @click="openDetail(row)">详情</el-button><el-button link type="primary" @click="openForm(row)">编辑</el-button><el-button link :type="row.status === '启用' ? 'danger' : 'success'" @click="toggleStatus(row)">{{ row.status === '启用' ? '禁用' : '启用' }}</el-button></template></el-table-column>
      </el-table>
      <div class="biz-pagination"><el-pagination v-model:current-page="query.page" v-model:page-size="query.size" background layout="total, sizes, prev, pager, next, jumper" :page-sizes="[10,20,50]" :total="total" @change="load" /></div>
    </section>

    <el-dialog v-model="formVisible" :title="editingId ? '编辑员工' : '新增员工'" width="680px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="form-grid">
        <el-form-item label="登录账号" prop="username"><el-input v-model.trim="form.username" :disabled="Boolean(editingId)" /></el-form-item>
        <el-form-item v-if="!editingId" label="初始密码" prop="password"><el-input v-model="form.password" type="password" show-password /></el-form-item>
        <el-form-item label="员工姓名"><el-input v-model.trim="form.realName" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model.trim="form.phone" maxlength="20" /></el-form-item>
        <el-form-item label="性别"><el-select v-model="form.gender"><el-option label="男" value="男" /><el-option label="女" value="女" /><el-option label="未知" value="未知" /></el-select></el-form-item>
        <el-form-item label="角色"><el-select v-model="form.roleId" clearable filterable><el-option v-for="role in roles" :key="role.roleId" :label="role.roleName" :value="role.roleId" /></el-select></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="启用">启用</el-radio><el-radio value="禁用">禁用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="formVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="员工详情" size="440px"><div v-loading="detailLoading" v-if="selected"><h2>{{ selected.realName || selected.username }}</h2><p class="biz-muted">@{{ selected.username }} · 员工编号 #{{ selected.userId }}</p><dl class="biz-detail-grid"><div><dt>角色</dt><dd>{{ selected.roleName || '未分配' }}</dd></div><div><dt>账号状态</dt><dd>{{ selected.status || '-' }}</dd></div><div><dt>性别</dt><dd>{{ selected.gender || '-' }}</dd></div><div><dt>手机号</dt><dd>{{ selected.phone || '-' }}</dd></div><div style="grid-column:1/-1"><dt>创建时间</dt><dd>{{ formatDateTime(selected.createTime) }}</dd></div></dl></div></el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { CircleCheckFilled, Lock, Plus, Search, UserFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { userApi } from '../../api/user'
import { roleApi } from '../../api/role'
import type { Role } from '../../types/role'
import type { CreateUserPayload, SystemUser, UserQuery } from '../../types/user'
import { formatDateTime } from '../../utils/format'

const users = ref<SystemUser[]>([]), roles = ref<Role[]>([]), total = ref(0)
const loading = ref(false), saving = ref(false), detailLoading = ref(false)
const formVisible = ref(false), detailVisible = ref(false), editingId = ref<number | null>(null)
const selected = ref<SystemUser | null>(null), formRef = ref<FormInstance>()
const query = reactive<UserQuery>({ page: 1, size: 10, keyword: '', status: '' })
const emptyForm = (): CreateUserPayload => ({ username: '', password: '', realName: '', phone: '', gender: '未知', roleId: null, status: '启用' })
const form = reactive<CreateUserPayload>(emptyForm())
const rules: FormRules<CreateUserPayload> = { username: [{ required: true, message: '请输入登录账号', trigger: 'blur' }], password: [{ required: true, min: 6, message: '初始密码至少 6 位', trigger: 'blur' }] }
const enabledCount = computed(() => users.value.filter(item => item.status === '启用').length)
const disabledCount = computed(() => users.value.filter(item => item.status === '禁用').length)

async function load() { loading.value = true; try { const result = await userApi.getList({ ...query, keyword: query.keyword || undefined, status: query.status || undefined }); users.value = result?.list ?? []; total.value = result?.total ?? 0 } finally { loading.value = false } }
function search() { query.page = 1; void load() }
function reset() { Object.assign(query, { page: 1, size: 10, keyword: '', status: '' }); void load() }
async function loadRoles() { const result = await roleApi.getList({ page: 1, size: 100 }); roles.value = result?.list ?? [] }
async function openForm(item?: SystemUser) { editingId.value = item?.userId ?? null; Object.assign(form, emptyForm()); if (item) { const detail = await userApi.getDetail(item.userId); Object.assign(form, { username: detail.username, realName: detail.realName || '', phone: detail.phone || '', gender: detail.gender || '未知', roleId: detail.roleId ?? null, status: detail.status || '启用' }) } formVisible.value = true }
async function save() { if (!await formRef.value?.validate().catch(() => false)) return; saving.value = true; try { if (editingId.value) await userApi.update(editingId.value, { roleId: form.roleId, realName: form.realName, phone: form.phone, gender: form.gender, status: form.status }); else await userApi.create({ ...form }); ElMessage.success(editingId.value ? '员工资料已更新' : '员工账号已创建'); formVisible.value = false; await load() } finally { saving.value = false } }
async function toggleStatus(item: SystemUser) { const next = item.status === '启用' ? '禁用' : '启用'; await ElMessageBox.confirm(`确认${next}员工“${item.realName || item.username}”吗？`, `${next}员工`, { type: 'warning' }); await userApi.changeStatus(item.userId, next); ElMessage.success(`员工已${next}`); await load() }
async function openDetail(item: SystemUser) { detailVisible.value = true; detailLoading.value = true; try { selected.value = await userApi.getDetail(item.userId) } finally { detailLoading.value = false } }
onMounted(() => Promise.all([load(), loadRoles()]))
</script>

<style scoped>.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.form-grid :deep(.el-select){width:100%}@media(max-width:680px){.form-grid{grid-template-columns:1fr}}</style>
