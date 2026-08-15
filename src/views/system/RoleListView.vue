<template>
  <div class="role-page">
    <section class="page-heading">
      <div>
        <p>系统管理 · 权限配置</p>
        <h1>角色管理</h1>
      </div>
    </section>

    <section class="summary-grid">
      <article>
        <span class="blue"><UserFilled /></span>
        <div>
          <small>角色总数</small>
          <strong>{{ loading && total === 0 ? '—' : total }}</strong>
          <p>系统内已配置的角色</p>
        </div>
      </article>
    </section>

    <section class="content-card">
      <div class="toolbar">
        <label>
          <Search />
          <input
            v-model="searchKeyword"
            placeholder="搜索角色名称"
            @keyup.enter="handleSearch"
          />
        </label>
        <button class="query" :disabled="loading" @click="handleSearch">
          查询
        </button>
        <button :disabled="loading" @click="handleReset">
          重置
        </button>
        <span>共 {{ total }} 个角色</span>
      </div>

      <div v-loading="loading" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>角色信息</th>
              <th>角色编号</th>
              <th>角色说明</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.roleId">
              <td>
                <div class="role-info">
                  <i class="blue"><UserFilled /></i>
                  <div>
                    <strong>{{ role.roleName }}</strong>
                    <small>角色名称</small>
                  </div>
                </div>
              </td>
              <td><code>#{{ role.roleId }}</code></td>
              <td class="description">{{ role.roleDesc || '暂无说明' }}</td>
              <td class="actions">
                <button @click="openDetail(role)">详情</button>
                <button @click="openEdit(role)">编辑</button>
                <el-popconfirm
                  title="确认删除该角色吗？"
                  confirm-button-text="确认删除"
                  cancel-button-text="取消"
                  width="220"
                  @confirm="handleDelete(role)"
                >
                  <template #reference>
                    <button
                      class="danger"
                      :disabled="deletingRoleId === role.roleId"
                    >
                      {{ deletingRoleId === role.roleId ? '删除中' : '删除' }}
                    </button>
                  </template>
                </el-popconfirm>
              </td>
            </tr>
            <tr v-if="!loading && roles.length === 0">
              <td class="empty-cell" colspan="4">
                <el-empty description="暂无角色数据" :image-size="72" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="pagination">
        <span>
          显示 {{ displayStart }}–{{ displayEnd }} 条，共 {{ total }} 条
        </span>
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          background
          layout="sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="total"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </footer>
    </section>

    <el-dialog
      v-model="editVisible"
      title="编辑角色"
      width="520px"
      destroy-on-close
      @closed="resetEditForm"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-position="top"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="editForm.roleName"
            maxlength="50"
            show-word-limit
            placeholder="请输入角色名称"
          />
        </el-form-item>
        <el-form-item label="角色说明" prop="roleDesc">
          <el-input
            v-model="editForm.roleDesc"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请输入角色说明"
          />
        </el-form-item>
        <p class="tip">
          <InfoFilled />
          角色名称用于标识系统职责，角色说明可简要描述其业务范围。
        </p>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="editVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存修改
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailVisible"
      title="角色详情"
      width="500px"
      destroy-on-close
    >
      <div v-loading="detailLoading" class="detail">
        <template v-if="selectedRole">
          <header>
            <i class="blue"><UserFilled /></i>
            <div>
              <h3>{{ selectedRole.roleName }}</h3>
              <code>#{{ selectedRole.roleId }}</code>
            </div>
          </header>
          <dl>
            <div>
              <dt>角色编号</dt>
              <dd>{{ selectedRole.roleId }}</dd>
            </div>
            <div>
              <dt>角色名称</dt>
              <dd>{{ selectedRole.roleName }}</dd>
            </div>
            <div>
              <dt>角色说明</dt>
              <dd>{{ selectedRole.roleDesc || '暂无说明' }}</dd>
            </div>
          </dl>
        </template>
      </div>
      <template #footer>
        <el-button type="primary" @click="detailVisible = false">
          知道了
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { InfoFilled, Search, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { roleApi } from '../../api/role'
import type { Role, UpdateRoleParams } from '../../types/role'

const roles = ref<Role[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const searchKeyword = ref('')
const appliedKeyword = ref('')
const loading = ref(false)

const detailVisible = ref(false)
const detailLoading = ref(false)
const selectedRole = ref<Role | null>(null)

const editVisible = ref(false)
const saving = ref(false)
const editingRoleId = ref<number | null>(null)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  roleName: '',
  roleDesc: '',
})

const deletingRoleId = ref<number | null>(null)

const editRules: FormRules<typeof editForm> = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { max: 50, message: '角色名称不能超过 50 个字符', trigger: 'blur' },
  ],
  roleDesc: [
    { max: 200, message: '角色说明不能超过 200 个字符', trigger: 'blur' },
  ],
}

const displayStart = computed(() => {
  if (total.value === 0 || roles.value.length === 0) {
    return 0
  }
  return (page.value - 1) * size.value + 1
})

const displayEnd = computed(() => {
  if (total.value === 0 || roles.value.length === 0) {
    return 0
  }
  return Math.min(displayStart.value + roles.value.length - 1, total.value)
})

const fetchRoles = async () => {
  loading.value = true
  try {
    const result = await roleApi.getList({
      page: page.value,
      size: size.value,
      keyword: appliedKeyword.value || undefined,
    })
    roles.value = Array.isArray(result.list) ? result.list : []
    total.value = Number(result.total) || 0
    page.value = Number(result.page) || page.value
    size.value = Number(result.size) || size.value
  } catch {
    // 具体错误信息由统一响应拦截器展示，此处保留当前列表。
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  appliedKeyword.value = searchKeyword.value.trim()
  page.value = 1
  void fetchRoles()
}

const handleReset = () => {
  searchKeyword.value = ''
  appliedKeyword.value = ''
  page.value = 1
  void fetchRoles()
}

const handlePageChange = (nextPage: number) => {
  page.value = nextPage
  void fetchRoles()
}

const handleSizeChange = (nextSize: number) => {
  size.value = nextSize
  page.value = 1
  void fetchRoles()
}

const openDetail = async (role: Role) => {
  detailVisible.value = true
  detailLoading.value = true
  selectedRole.value = null
  try {
    selectedRole.value = await roleApi.getDetail(role.roleId)
  } catch {
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

const openEdit = (role: Role) => {
  editingRoleId.value = role.roleId
  editForm.roleName = role.roleName
  editForm.roleDesc = role.roleDesc ?? ''
  editVisible.value = true
}

const resetEditForm = () => {
  editingRoleId.value = null
  editForm.roleName = ''
  editForm.roleDesc = ''
  editFormRef.value?.clearValidate()
}

const handleSave = async () => {
  if (editingRoleId.value === null) {
    return
  }

  editForm.roleName = editForm.roleName.trim()
  editForm.roleDesc = editForm.roleDesc.trim()
  const valid = await editFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  const data: UpdateRoleParams = {
    roleName: editForm.roleName,
    roleDesc: editForm.roleDesc || null,
  }

  saving.value = true
  try {
    await roleApi.update(editingRoleId.value, data)
    ElMessage.success('角色修改成功')
    editVisible.value = false
    await fetchRoles()
  } catch {
    // 具体错误信息由统一响应拦截器展示。
  } finally {
    saving.value = false
  }
}

const handleDelete = async (role: Role) => {
  deletingRoleId.value = role.roleId
  try {
    await roleApi.remove(role.roleId)
    ElMessage.success('角色删除成功')
    if (roles.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await fetchRoles()
  } catch {
    // 具体错误信息由统一响应拦截器展示。
  } finally {
    deletingRoleId.value = null
  }
}

onMounted(() => {
  void fetchRoles()
})
</script>

<style scoped>
.role-page {
  color: #29384f;
}

.page-heading {
  margin: 3px 2px 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.page-heading p {
  margin: 0;
  color: #98a4b6;
  font-size: 12px;
}

.page-heading h1 {
  margin: 3px 0 0;
  color: #1e2d43;
  font-size: 24px;
}

.summary-grid {
  max-width: 320px;
  margin-bottom: 12px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.summary-grid article,
.content-card {
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  background: #fff;
}

.summary-grid article {
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-grid article > span,
.role-info > i,
.detail header > i {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 9px;
}

.summary-grid svg,
.role-info svg,
.detail svg {
  width: 18px;
}

.summary-grid article > div {
  display: grid;
}

.summary-grid small {
  color: #8290a3;
  font-size: 10px;
}

.summary-grid strong {
  color: #24344a;
  font-size: 21px;
}

.summary-grid p {
  margin: 1px 0 0;
  color: #9aa6b6;
  font-size: 9px;
}

.blue {
  color: #1677ff;
  background: #eaf3ff;
}

.content-card {
  padding: 15px;
}

.toolbar {
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.toolbar label {
  width: 280px;
  height: 34px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #dde4ed;
  border-radius: 6px;
  background: #fbfcfe;
}

.toolbar svg {
  width: 15px;
  color: #91a0b4;
}

.toolbar input {
  width: 100%;
  border: 0;
  background: transparent;
  font-size: 11px;
}

.toolbar > button {
  height: 34px;
  padding: 0 11px;
  color: #56657b;
  border: 1px solid #dde4ed;
  border-radius: 6px;
  background: #fff;
  font-size: 11px;
}

.toolbar > button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.toolbar .query {
  color: #fff;
  border-color: #1677ff;
  background: #1677ff;
}

.toolbar > span {
  margin-left: auto;
  color: #9ba6b5;
  font-size: 10px;
}

.table-wrap {
  min-height: 190px;
  overflow-x: auto;
  border: 1px solid #e8edf3;
  border-radius: 7px;
}

table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 13px;
  text-align: left;
  border-bottom: 1px solid #edf1f5;
  font-size: 11px;
}

th {
  color: #718096;
  font-weight: 600;
  background: #f7f9fc;
}

td {
  color: #46556b;
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:hover {
  background: #fafcff;
}

.role-info {
  min-width: 190px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.role-info > i {
  width: 34px;
  height: 34px;
}

.role-info div {
  display: grid;
}

.role-info strong {
  color: #344359;
  font-size: 11px;
}

.role-info small {
  color: #a1abb9;
  font-size: 9px;
}

code {
  padding: 3px 6px;
  color: #586981;
  border-radius: 4px;
  background: #f1f4f8;
  font-size: 10px;
}

.description {
  min-width: 260px;
  color: #66758a;
}

.actions {
  width: 180px;
  white-space: nowrap;
}

.actions button {
  margin-right: 12px;
  padding: 0;
  color: #1677ff;
  border: 0;
  background: transparent;
  font-size: 10px;
}

.actions button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.actions .danger {
  color: #e55358;
}

.empty-cell {
  height: 160px;
  padding: 0;
  text-align: center;
}

.empty-cell :deep(.el-empty) {
  padding: 20px 0;
}

.empty-cell :deep(.el-empty__description) {
  margin-top: 6px;
}

.empty-cell :deep(.el-empty__description p) {
  color: #9aa6b6;
  font-size: 11px;
}

.pagination {
  padding-top: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #99a5b5;
  font-size: 10px;
}

.pagination :deep(.el-pagination) {
  --el-pagination-button-bg-color: #fff;
  --el-pagination-hover-color: #1677ff;
  --el-pagination-button-color: #6f7e92;
  font-size: 10px;
}

.pagination :deep(.el-select__wrapper) {
  min-height: 28px;
  font-size: 10px;
}

.pagination :deep(.btn-prev),
.pagination :deep(.btn-next),
.pagination :deep(.el-pager li) {
  min-width: 28px;
  height: 28px;
  border: 1px solid #e0e6ee;
  border-radius: 5px;
}

.pagination :deep(.el-pager li.is-active) {
  color: #fff;
  border-color: #1677ff;
  background: #1677ff;
}

.tip {
  margin: 4px 0 0;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #64758c;
  border-radius: 6px;
  background: #f3f7fc;
  font-size: 11px;
}

.tip svg {
  width: 15px;
  color: #1677ff;
}

.detail {
  min-height: 180px;
}

.detail header {
  padding-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 11px;
  border-bottom: 1px solid #edf0f4;
}

.detail header div {
  flex: 1;
}

.detail h3 {
  margin: 0 0 5px;
  color: #344359;
}

.detail dl {
  display: grid;
  gap: 13px;
}

.detail dl div {
  display: grid;
  grid-template-columns: 80px 1fr;
  font-size: 11px;
}

.detail dt {
  color: #929eaf;
}

.detail dd {
  margin: 0;
  color: #46556b;
}

@media (max-width: 680px) {
  .summary-grid {
    max-width: none;
  }

  .toolbar {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .toolbar label {
    width: 100%;
  }

  .toolbar > span {
    width: 100%;
    margin-left: 0;
  }

  .pagination {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
