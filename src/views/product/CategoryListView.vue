<template>
  <div class="category-page">
    <PageHeader eyebrow="基础资料 · 分类维护" title="商品分类" description="维护商品分类档案与启停状态">
      <el-button type="primary" :icon="Plus" @click="openForm()">新增分类</el-button>
    </PageHeader>

    <section class="category-grid" v-loading="loading">
      <article v-for="(item, index) in categories" :key="item.categoryId" :class="{ disabled: item.status === '停用' }">
        <header>
          <span :class="`tone-${index % 4}`"><Goods /></span>
          <div class="actions">
            <el-button link :icon="View" title="查看详情" @click="openDetail(item)" />
            <el-button link :icon="Edit" title="编辑" @click="openForm(item)" />
          </div>
        </header>
        <h2>{{ item.categoryName }}</h2>
        <p>{{ item.categoryDesc || '暂无分类说明' }}</p>
        <footer>
          <span>分类编号 #{{ item.categoryId }}</span>
          <b :class="{ off: item.status === '停用' }">{{ item.status }}</b>
        </footer>
      </article>
      <button class="add-card" @click="openForm()"><Plus /><strong>新建商品分类</strong><span>创建新的商品归类</span></button>
      <el-empty v-if="!loading && categories.length === 0" description="暂无商品分类" />
    </section>

    <section class="list-card">
      <div class="toolbar">
        <el-input v-model="query.keyword" placeholder="搜索分类名称" clearable :prefix-icon="Search" @keyup.enter="search" />
        <el-select v-model="query.status" placeholder="全部状态" clearable>
          <el-option label="启用" value="启用" /><el-option label="停用" value="停用" />
        </el-select>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
        <span>共 {{ total }} 个分类</span>
      </div>
      <el-table v-loading="loading" :data="categories" row-key="categoryId" stripe border>
        <el-table-column prop="categoryId" label="分类编号" width="110" />
        <el-table-column prop="categoryName" label="分类名称" min-width="160" />
        <el-table-column prop="categoryDesc" label="分类说明" min-width="260"><template #default="{ row }">{{ row.categoryDesc || '-' }}</template></el-table-column>
        <el-table-column label="状态" width="100" align="center"><template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="210" fixed="right" align="center"><template #default="{ row }"><el-button link type="primary" @click="openDetail(row)">详情</el-button><el-button link type="primary" @click="openForm(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
      </el-table>
      <div class="pagination"><el-pagination v-model:current-page="query.page" v-model:page-size="query.size" background layout="total, sizes, prev, pager, next, jumper" :total="total" :page-sizes="[10, 20, 50]" @change="load" /></div>
    </section>

    <el-dialog v-model="formVisible" :title="editingId ? '编辑分类' : '新增分类'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="分类名称" prop="categoryName"><el-input v-model="form.categoryName" maxlength="50" show-word-limit /></el-form-item>
        <el-form-item label="分类说明" prop="categoryDesc"><el-input v-model="form.categoryDesc" type="textarea" :rows="3" maxlength="200" show-word-limit /></el-form-item>
        <el-form-item label="状态" prop="status"><el-radio-group v-model="form.status"><el-radio value="启用">启用</el-radio><el-radio value="停用">停用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="formVisible = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存分类</el-button></template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="分类详情" size="420px">
      <div v-loading="detailLoading" v-if="selected">
        <h2>{{ selected.categoryName }}</h2>
        <p class="muted">分类编号 #{{ selected.categoryId }}</p>
        <dl><div><dt>状态</dt><dd>{{ selected.status }}</dd></div><div><dt>分类说明</dt><dd>{{ selected.categoryDesc || '-' }}</dd></div></dl>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Edit, Goods, Plus, Search, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '../../components/PageHeader.vue'
import { categoryApi } from '../../api/category'
import type { ProductCategory, ProductCategoryPayload, ProductCategoryQuery } from '../../types/product'

const categories = ref<ProductCategory[]>([])
const total = ref(0)
const loading = ref(false), saving = ref(false), detailLoading = ref(false)
const formVisible = ref(false), detailVisible = ref(false)
const editingId = ref<number | null>(null)
const selected = ref<ProductCategory | null>(null)
const query = reactive<ProductCategoryQuery>({ page: 1, size: 10, keyword: '', status: '' })
const emptyForm = (): ProductCategoryPayload => ({ categoryName: '', categoryDesc: '', status: '启用' })
const form = reactive<ProductCategoryPayload>(emptyForm())
const formRef = ref<FormInstance>()
const rules: FormRules<ProductCategoryPayload> = {
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

async function load() {
  loading.value = true
  try {
    const result = await categoryApi.getList({ ...query, keyword: query.keyword || undefined, status: query.status || undefined })
    categories.value = result?.list ?? []
    total.value = result?.total ?? 0
  } catch {
    categories.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}
function search() { query.page = 1; load() }
function reset() { Object.assign(query, { page: 1, size: 10, keyword: '', status: '' }); load() }
async function openForm(item?: ProductCategory) {
  editingId.value = item?.categoryId ?? null
  Object.assign(form, item ? await categoryApi.getDetail(item.categoryId) : emptyForm())
  formVisible.value = true
}
async function save() {
  if (!await formRef.value?.validate()) return
  saving.value = true
  try {
    if (editingId.value) await categoryApi.update(editingId.value, { ...form })
    else await categoryApi.create({ ...form })
    ElMessage.success(editingId.value ? '分类修改成功' : '分类新增成功')
    formVisible.value = false
    await load()
  } finally { saving.value = false }
}
async function openDetail(item: ProductCategory) {
  detailVisible.value = true
  detailLoading.value = true
  try { selected.value = await categoryApi.getDetail(item.categoryId) }
  finally { detailLoading.value = false }
}
async function remove(item: ProductCategory) {
  await ElMessageBox.confirm(`确认删除分类“${item.categoryName}”吗？`, '删除分类', { type: 'warning' })
  await categoryApi.remove(item.categoryId)
  ElMessage.success('分类删除成功')
  if (categories.value.length === 1 && query.page > 1) query.page--
  await load()
}
onMounted(load)
</script>

<style scoped>
.category-page{color:#29384f}.category-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.category-grid article,.add-card,.list-card{border:1px solid #e6ebf2;border-radius:8px;background:#fff}.category-grid article{padding:16px}.category-grid article.disabled{opacity:.65}.category-grid article header{display:flex;justify-content:space-between}.category-grid article header>span{width:42px;height:42px;display:grid;place-items:center;color:#1677ff;border-radius:10px;background:#e8f4ff}.category-grid article header>span.tone-1{background:#fff3df}.category-grid article header>span.tone-2{background:#ebf8ed}.category-grid article header>span.tone-3{background:#f1edff}.category-grid svg{width:19px}.actions{display:flex}.category-grid h2{margin:13px 0 4px;font-size:15px}.category-grid p{min-height:34px;margin:0;color:#8b97a8;font-size:12px}.category-grid footer{margin-top:13px;padding-top:11px;display:flex;justify-content:space-between;border-top:1px solid #edf1f5;color:#718096;font-size:11px}.category-grid footer b{color:#169c73}.category-grid footer b.off{color:#9aa5b4}.add-card{min-height:165px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#8090a5;border-style:dashed}.add-card svg{color:#1677ff}.add-card strong{margin:7px 0 3px;color:#34445b}.add-card span{font-size:11px}.list-card{margin-top:12px;padding:15px;overflow:hidden}.toolbar{margin-bottom:12px;display:flex;gap:9px;align-items:center}.toolbar .el-input{width:260px}.toolbar .el-select{width:150px}.toolbar>span{margin-left:auto;color:#9ba6b5;font-size:12px}.pagination{display:flex;justify-content:flex-end;margin-top:16px}.muted,dt{color:#8b97a8}dl div{padding:14px 0;border-bottom:1px solid #edf1f5}dt{font-size:12px}dd{margin:6px 0 0}@media(max-width:1000px){.category-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:680px){.category-grid{grid-template-columns:1fr}.toolbar{flex-wrap:wrap}.toolbar .el-input,.toolbar .el-select{width:100%}.toolbar>span{width:100%;margin:0}}
</style>
