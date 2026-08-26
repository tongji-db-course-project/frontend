<template>
  <div class="user-page">
    <PageHeader eyebrow="系统管理 · 员工账号" title="用户管理" description="办理员工入职、资料维护、角色分配与离职停用">
      <el-button type="primary" :icon="Plus" @click="openForm()">新增用户</el-button>
    </PageHeader>

    <section class="metrics">
      <article><span>用户总数</span><strong>{{ total }}</strong><small>来自系统用户接口</small></article>
      <article><span>本页启用</span><strong>{{ enabledCount }}</strong><small>可正常登录的账号</small></article>
      <article><span>本页停用</span><strong>{{ disabledCount }}</strong><small>保留历史记录的离职账号</small></article>
      <article><span>角色数量</span><strong>{{ roles.length }}</strong><small>当前可分配角色</small></article>
    </section>

    <section class="card">
      <div class="toolbar">
        <el-input v-model="query.keyword" placeholder="搜索账号、姓名或手机号" clearable :prefix-icon="Search" @keyup.enter="search" />
        <el-select v-model="query.status" placeholder="全部状态" clearable>
          <el-option label="启用" value="启用" /><el-option label="禁用" value="禁用" />
        </el-select>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="users" row-key="userId" stripe border>
        <el-table-column prop="userId" label="编号" width="80" />
        <el-table-column label="员工信息" min-width="180">
          <template #default="{ row }"><strong>{{ row.realName || '-' }}</strong><small class="block">{{ row.username }}</small></template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="140"><template #default="{ row }">{{ row.phone || '-' }}</template></el-table-column>
        <el-table-column prop="gender" label="性别" width="90"><template #default="{ row }">{{ row.gender || '未知' }}</template></el-table-column>
        <el-table-column prop="roleName" label="角色" min-width="130"><template #default="{ row }"><el-tag>{{ row.roleName || '未分配' }}</el-tag></template></el-table-column>
        <el-table-column label="状态" width="100" align="center"><template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status || '-' }}</el-tag></template></el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170"><template #default="{ row }">{{ formatTime(row.createTime) }}</template></el-table-column>
        <el-table-column label="操作" width="190" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openForm(row)">编辑</el-button>
            <el-button link :type="row.status === '启用' ? 'danger' : 'success'" :disabled="row.userId === currentUserId" @click="toggleStatus(row)">{{ row.status === '启用' ? '办理离职' : '重新启用' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination"><el-pagination v-model:current-page="query.page" v-model:page-size="query.size" background layout="total, sizes, prev, pager, next" :total="total" :page-sizes="[10,20,50]" @change="load" /></div>
    </section>

    <el-dialog v-model="formVisible" :title="editingId ? '编辑用户' : '新增用户'" width="620px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="form-grid">
        <el-form-item label="登录账号" prop="username"><el-input v-model="form.username" :disabled="!!editingId" maxlength="50" /></el-form-item>
        <el-form-item v-if="!editingId" label="初始密码" prop="password"><el-input v-model="form.password" type="password" show-password maxlength="100" /></el-form-item>
        <el-form-item label="真实姓名" prop="realName"><el-input v-model="form.realName" maxlength="50" /></el-form-item>
        <el-form-item label="手机号" prop="phone"><el-input v-model="form.phone" maxlength="20" /></el-form-item>
        <el-form-item label="性别"><el-select v-model="form.gender"><el-option label="未知" value="未知" /><el-option label="男" value="男" /><el-option label="女" value="女" /></el-select></el-form-item>
        <el-form-item label="角色" prop="roleId"><el-select v-model="form.roleId"><el-option v-for="role in roles" :key="role.roleId" :label="role.roleName" :value="role.roleId" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="form.status"><el-option label="启用" value="启用" /><el-option label="禁用" value="禁用" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="formVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存用户</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '../../components/PageHeader.vue'
import { userApi } from '../../api/user'
import { roleApi } from '../../api/role'
import { useAuthStore } from '../../stores/auth'
import type { Role } from '../../types/role'
import type { CreateUserPayload, SystemUser } from '../../types/user'

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.userInfo?.userId)
const users = ref<SystemUser[]>([]), roles = ref<Role[]>([])
const loading = ref(false), saving = ref(false), total = ref(0)
const formVisible = ref(false), editingId = ref<number | null>(null), formRef = ref<FormInstance>()
const query = reactive({ page: 1, size: 10, keyword: '', status: '' })
const emptyForm = (): CreateUserPayload => ({ roleId: 0, username: '', password: '', realName: '', gender: '未知', phone: '', status: '启用' })
const form = reactive<CreateUserPayload>(emptyForm())
const rules: FormRules<CreateUserPayload> = {
  username: [{ required: true, message: '请输入登录账号', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '初始密码至少 6 位', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  roleId: [{ required: true, type: 'number', min: 1, message: '请选择角色', trigger: 'change' }],
}
const enabledCount = computed(() => users.value.filter(item => item.status === '启用').length)
const disabledCount = computed(() => users.value.filter(item => item.status === '禁用').length)

async function load() {
  loading.value = true
  try {
    const result = await userApi.getList({ page: query.page, size: query.size, keyword: query.keyword || undefined, status: query.status || undefined })
    users.value = result?.list ?? []
    total.value = result?.total ?? 0
  } finally { loading.value = false }
}
async function loadRoles() {
  const result = await roleApi.getList({ page: 1, size: 100 })
  roles.value = result?.list ?? []
}
function search() { query.page = 1; load() }
function reset() { Object.assign(query, { page: 1, keyword: '', status: '' }); load() }
async function openForm(item?: SystemUser) {
  editingId.value = item?.userId ?? null
  Object.assign(form, emptyForm())
  if (item) {
    const detail = await userApi.getDetail(item.userId)
    Object.assign(form, { roleId: detail.roleId ?? 0, username: detail.username, realName: detail.realName ?? '', gender: detail.gender ?? '未知', phone: detail.phone ?? '', status: detail.status ?? '启用' })
  }
  formVisible.value = true
}
async function save() {
  if (!await formRef.value?.validate().catch(() => false)) return
  saving.value = true
  try {
    if (editingId.value) {
      const { roleId, realName, gender, phone, status } = form
      await userApi.update(editingId.value, { roleId, realName, gender, phone, status })
      ElMessage.success('用户资料已更新')
    } else {
      await userApi.create({ ...form })
      ElMessage.success('用户创建成功')
    }
    formVisible.value = false
    await load()
  } finally { saving.value = false }
}
async function toggleStatus(item: SystemUser) {
  const next = item.status === '启用' ? '禁用' : '启用'
  const action = next === '禁用' ? '办理离职并停用账号' : '重新启用账号'
  await ElMessageBox.confirm(`确认${action}“${item.realName || item.username}”吗？`, '员工状态确认', { type: 'warning' })
  await userApi.changeStatus(item.userId, next)
  ElMessage.success(`账号已${next}`)
  await load()
}
function formatTime(value?: string | null) { return value ? value.replace('T', ' ').slice(0, 19) : '-' }

onMounted(() => Promise.all([load(), loadRoles()]))
</script>

<style scoped>
.user-page{color:#29384f}.metrics{margin:14px 0;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.metrics article,.card{border:1px solid #e6ebf2;border-radius:9px;background:#fff}.metrics article{padding:16px;display:grid;gap:4px}.metrics span,.metrics small,.block{color:#8a97a8;font-size:11px}.metrics strong{font-size:24px}.card{padding:16px}.toolbar{margin-bottom:14px;display:flex;gap:10px}.toolbar .el-input{width:320px}.toolbar .el-select{width:150px}.block{display:block}.pagination{padding-top:14px;display:flex;justify-content:flex-end}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.form-grid :deep(.el-select){width:100%}@media(max-width:900px){.metrics{grid-template-columns:repeat(2,1fr)}}@media(max-width:640px){.metrics,.form-grid{grid-template-columns:1fr}.toolbar{flex-wrap:wrap}.toolbar .el-input,.toolbar .el-select{width:100%}}
</style>
