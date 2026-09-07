<template>
  <div class="member-page">
    <section class="page-heading">
      <div>
        <p>客户中心 · 会员全生命周期</p>
        <h1>会员管理</h1>
      </div>
      <button class="primary-button" @click="openCreate">
        <Plus />新增会员
      </button>
    </section>

    <section class="summary-grid">
      <article><span>会员总数</span><strong>{{ total }}</strong><small>来自会员分页接口</small></article>
      <article><span>本页会员数</span><strong>{{ members.length }}</strong><small>当前分页记录数</small></article>
      <article><span>本页累计消费</span><strong>{{ formatMoney(pageTotalAmount) }}</strong><small>会员累计消费合计</small></article>
      <article><span>本页可用积分</span><strong>{{ pagePoints.toLocaleString() }}</strong><small>当前页会员合计</small></article>
    </section>

    <section class="content-card">
      <div class="toolbar">
        <div class="search-field">
          <Search />
          <input
            v-model.trim="query.keyword"
            placeholder="搜索姓名、手机号或会员编号"
            @keyup.enter="search"
          />
        </div>
        <select v-model="query.status" @change="search">
          <option value="">全部状态</option>
          <option value="启用">启用</option>
          <option value="禁用">禁用</option>
        </select>
        <button class="query-button" @click="search">查询</button>
        <button class="filter-button" @click="resetQuery">重置</button>
        <span>共 {{ total }} 条记录</span>
      </div>

      <div class="table-wrap" v-loading="loading">
        <table>
          <thead>
            <tr>
              <th>会员信息</th><th>手机号</th><th>性别</th><th>会员等级</th><th>状态</th>
              <th>累计消费</th><th>可用积分</th><th>注册时间</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member.memberId">
              <td>
                <div class="member-info">
                  <span>{{ member.memberName?.slice(0, 1) || '?' }}</span>
                  <div><strong>{{ member.memberName }}</strong><small>#{{ member.memberId }}</small></div>
                </div>
              </td>
              <td>{{ maskPhone(member.phone) }}</td>
              <td>{{ member.gender || '未知' }}</td>
              <td>{{ member.levelName || '普通会员' }}</td>
              <td>{{ member.status || '—' }}</td>
              <td>{{ formatMoney(member.totalAmount) }}</td>
              <td>{{ Number(member.points || 0).toLocaleString() }}</td>
              <td>{{ formatDateTime(member.registerTime) }}</td>
              <td class="actions">
                <button @click="showDetail(member)">详情/轨迹</button>
                <button @click="openEdit(member)">编辑</button>
                <el-popconfirm v-if="member.status === '启用'" title="确认禁用该会员吗？" width="220" @confirm="disableMember(member)">
                  <template #reference><button class="danger">禁用</button></template>
                </el-popconfirm>
              </td>
            </tr>
            <tr v-if="!loading && !members.length"><td colspan="9" class="empty">暂无会员数据</td></tr>
          </tbody>
        </table>
      </div>

      <footer class="pagination">
        <span>第 {{ query.page }} 页，每页 {{ query.size }} 条</span>
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.size"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="sizes, prev, pager, next"
          @current-change="loadMembers"
          @size-change="handleSizeChange"
        />
      </footer>
    </section>

    <el-dialog v-model="formVisible" :title="editingId ? '编辑会员' : '新增会员'" width="640px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="会员姓名" prop="memberName"><el-input v-model.trim="form.memberName" placeholder="请输入会员姓名" /></el-form-item>
          <el-form-item label="手机号" prop="phone"><el-input v-model.trim="form.phone" maxlength="11" placeholder="请输入 11 位手机号" /></el-form-item>
          <el-form-item label="性别"><el-select v-model="form.gender" placeholder="请选择"><el-option label="男" value="男" /><el-option label="女" value="女" /><el-option label="未知" value="未知" /></el-select></el-form-item>
          <el-form-item label="会员等级"><el-input :model-value="editingId ? '由累计消费自动计算' : '普通会员'" disabled /><small class="field-tip">会员等级由系统根据累计消费自动维护，不支持人工修改。</small></el-form-item>
          <el-form-item label="状态"><el-select v-model="form.status"><el-option label="启用" value="启用" /><el-option label="禁用" value="禁用" /></el-select></el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveMember">保存会员</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" size="720px" destroy-on-close>
      <template #header><div class="drawer-title"><strong>会员详情与消费轨迹</strong><small v-if="selected">#{{ selected.memberId }} · {{ selected.memberName }}</small></div></template>
      <div v-loading="detailLoading">
        <template v-if="selected">
          <section class="profile-card">
            <div class="avatar">{{ selected.memberName?.slice(0, 1) }}</div>
            <div><h3>{{ selected.memberName }}</h3><p>{{ selected.levelName || '普通会员' }}</p></div>
            <button class="drawer-edit" @click="openEdit(selected)">编辑资料</button>
          </section>
          <dl class="detail-grid">
            <div><dt>手机号</dt><dd>{{ selected.phone }}</dd></div><div><dt>性别</dt><dd>{{ selected.gender || '—' }}</dd></div>
            <div><dt>会员等级</dt><dd>{{ selected.levelName || '普通会员' }}</dd></div><div><dt>注册时间</dt><dd>{{ formatDateTime(selected.registerTime) }}</dd></div>
            <div><dt>状态</dt><dd>{{ selected.status || '—' }}</dd></div><div><dt>会员类型</dt><dd>{{ selected.levelName || '普通会员' }}</dd></div>
            <div><dt>累计消费</dt><dd>{{ formatMoney(selected.totalAmount) }}</dd></div>
            <div><dt>可用积分</dt><dd>{{ Number(selected.points || 0).toLocaleString() }}</dd></div>
          </dl>

          <div class="track-heading"><div><h3>消费轨迹</h3><small>按交易时间记录会员历史订单</small></div><strong>共 {{ orderTotal }} 笔</strong></div>
          <div class="order-list" v-loading="ordersLoading">
            <article v-for="order in orders" :key="order.saleId">
              <i />
              <div class="order-main"><strong>{{ order.saleNo || `订单 #${order.saleId}` }}</strong><small>{{ formatDateTime(order.saleDate) }}</small></div>
              <div class="order-amount"><strong>{{ formatMoney(order.paidAmount ?? order.totalAmount) }}</strong><small>{{ order.status || '—' }}</small></div>
            </article>
            <div v-if="!ordersLoading && !orders.length" class="empty">暂无消费记录</div>
          </div>
          <el-pagination v-if="orderTotal > orderQuery.size" v-model:current-page="orderQuery.page" :page-size="orderQuery.size" :total="orderTotal" layout="prev, pager, next" @current-change="loadOrders" />
        </template>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { memberApi } from '../../api/member'
import type { Member, MemberDto, MemberQuery } from '../../types/member'
import type { SaleOrder } from '../../types/sale'

interface MemberForm extends Required<Pick<MemberDto, 'memberName' | 'phone'>> {
  gender: '男' | '女' | '未知'
  status: string
}

const members = ref<Member[]>([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const formVisible = ref(false)
const detailVisible = ref(false)
const detailLoading = ref(false)
const ordersLoading = ref(false)
const editingId = ref<number | null>(null)
const selected = ref<Member | null>(null)
const orders = ref<SaleOrder[]>([])
const orderTotal = ref(0)
const formRef = ref<FormInstance>()
const query = reactive<MemberQuery>({ page: 1, size: 10, keyword: '', status: '' })
const orderQuery = reactive({ page: 1, size: 8 })
const emptyForm = (): MemberForm => ({ memberName: '', phone: '', gender: '未知', status: '启用' })
const form = reactive<MemberForm>(emptyForm())

const rules: FormRules<MemberForm> = {
  memberName: [{ required: true, message: '请输入会员姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入正确的 11 位手机号', trigger: 'blur' },
  ],
}

const pageTotalAmount = computed(() => members.value.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0))
const pagePoints = computed(() => members.value.reduce((sum, item) => sum + Number(item.points || 0), 0))

function maskPhone(phone?: string | null) {
  return phone?.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') || '—'
}

function formatMoney(value?: number | null) {
  return `¥ ${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDateTime(value?: string | null) {
  return value ? value.replace('T', ' ').slice(0, 19) : '—'
}

async function loadMembers() {
  loading.value = true
  try {
    const result = await memberApi.getList({ ...query, keyword: query.keyword || undefined, status: query.status || undefined })
    members.value = result?.list || []
    total.value = result?.total || 0
  } finally {
    loading.value = false
  }
}

function search() {
  query.page = 1
  void loadMembers()
}

function resetQuery() {
  query.keyword = ''
  query.status = ''
  search()
}

function handleSizeChange() {
  query.page = 1
  void loadMembers()
}

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  formVisible.value = true
}

async function openEdit(member: Member) {
  editingId.value = member.memberId
  detailLoading.value = true
  try {
    const detail = await memberApi.getDetail(member.memberId)
    Object.assign(form, {
      memberName: detail.memberName,
      phone: detail.phone,
      gender: detail.gender || '未知',
      status: detail.status || '启用',
    })
    formVisible.value = true
  } finally {
    detailLoading.value = false
  }
}

function buildPayload(): MemberDto {
  return {
    memberName: form.memberName,
    phone: form.phone,
    gender: form.gender,
    status: form.status,
  }
}

async function saveMember() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (editingId.value) {
      await memberApi.update(editingId.value, buildPayload())
      ElMessage.success('会员资料已更新')
    } else {
      await memberApi.create(buildPayload())
      ElMessage.success('会员创建成功')
    }
    formVisible.value = false
    await loadMembers()
    if (selected.value && editingId.value === selected.value.memberId) await refreshSelected(selected.value.memberId)
  } finally {
    saving.value = false
  }
}

async function disableMember(member: Member) {
  await memberApi.remove(member.memberId)
  ElMessage.success('会员已禁用')
  if (members.value.length === 1 && query.page > 1) query.page -= 1
  await loadMembers()
}

async function refreshSelected(memberId: number) {
  selected.value = await memberApi.getDetail(memberId)
}

async function showDetail(member: Member) {
  detailVisible.value = true
  detailLoading.value = true
  orderQuery.page = 1
  selected.value = null
  try {
    await refreshSelected(member.memberId)
    await loadOrders()
  } finally {
    detailLoading.value = false
  }
}

async function loadOrders() {
  if (!selected.value) return
  ordersLoading.value = true
  try {
    const result = await memberApi.getOrders(selected.value.memberId, orderQuery.page, orderQuery.size)
    orders.value = result?.list || []
    orderTotal.value = result?.total || 0
  } finally {
    ordersLoading.value = false
  }
}

onMounted(loadMembers)
</script>

<style scoped>
.member-page{color:#29384f}.page-heading{margin:3px 2px 14px;display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.page-heading p{margin:0;color:#98a4b6;font-size:12px}.page-heading h1{margin:3px 0 0;color:#1e2d43;font-size:24px}.primary-button{height:36px;padding:0 14px;display:flex;align-items:center;gap:7px;color:#fff;border:0;border-radius:7px;background:#1677ff;box-shadow:0 5px 12px rgba(22,119,255,.18)}.primary-button svg{width:14px}.summary-grid{margin-bottom:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.summary-grid article,.content-card{border:1px solid #e6ebf2;border-radius:8px;background:#fff}.summary-grid article{padding:16px;display:grid;gap:3px}.summary-grid span{color:#7d899b;font-size:11px}.summary-grid strong{color:#24344a;font-size:21px}.summary-grid small{color:#8996a8;font-size:10px}.content-card{padding:15px}.toolbar{margin-bottom:14px;display:flex;align-items:center;gap:9px}.search-field{width:280px;height:34px;padding:0 10px;display:flex;align-items:center;gap:7px;border:1px solid #dde4ed;border-radius:6px;background:#fbfcfe}.search-field svg{width:15px;color:#91a0b4}.search-field input{width:100%;outline:0;border:0;background:transparent;font-size:11px}.toolbar select,.toolbar>button{height:34px;padding:0 11px;color:#56657b;border:1px solid #dde4ed;border-radius:6px;background:#fff;font-size:11px}.toolbar .query-button{color:#fff;border-color:#1677ff;background:#1677ff}.toolbar>span{margin-left:auto;color:#9ba6b5;font-size:10px}.table-wrap{min-height:180px;overflow-x:auto;border:1px solid #e8edf3;border-radius:7px}table{width:100%;min-width:1050px;border-collapse:collapse}th,td{padding:12px 13px;text-align:left;border-bottom:1px solid #edf1f5;font-size:11px}th{color:#718096;font-weight:600;background:#f7f9fc}td{color:#46556b}tbody tr:last-child td{border-bottom:0}tbody tr:hover{background:#fafcff}.member-info{display:flex;align-items:center;gap:9px}.member-info>span,.avatar{width:31px;height:31px;display:grid;place-items:center;color:#1677ff;border-radius:8px;background:#eaf3ff;font-weight:700}.member-info div{display:grid}.member-info strong{color:#344359;font-size:11px}.member-info small{color:#a1abb9;font-size:9px}.level-tag{padding:4px 7px;display:inline-block;color:#7d5bd6;border-radius:4px;background:#f2edff;font-size:9px}.status{display:flex;align-items:center;gap:5px;color:#169c73}.status i{width:6px;height:6px;border-radius:50%;background:#20bd87}.status.disabled{color:#9aa4b2}.status.disabled i{background:#aeb6c1}.actions{white-space:nowrap}.actions button{margin-right:9px;padding:0;color:#1677ff;border:0;background:transparent;font-size:10px}.actions .danger{color:#e55358}.empty{text-align:center!important;color:#9aa6b5!important;padding:30px!important}.pagination{padding-top:13px;display:flex;align-items:center;justify-content:space-between;color:#99a5b5;font-size:10px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}.form-grid :deep(.el-select),.form-grid :deep(.el-date-editor),.form-grid :deep(.el-input-number){width:100%}.field-tip{margin-top:4px;color:#9a7a43}.drawer-title{display:grid;gap:3px}.drawer-title small{color:#94a0b1;font-size:11px}.profile-card{padding:16px;display:flex;align-items:center;gap:12px;border:1px solid #e5ebf3;border-radius:9px;background:#f8fbff}.profile-card .avatar{width:44px;height:44px;font-size:17px}.profile-card h3{margin:0 0 4px}.profile-card p{margin:0;color:#8592a5;font-size:11px}.drawer-edit{margin-left:auto;color:#1677ff;border:0;background:transparent}.detail-grid{margin:14px 0 22px;display:grid;grid-template-columns:1fr 1fr;border:1px solid #e8edf3;border-radius:8px}.detail-grid div{padding:12px 14px;border-bottom:1px solid #edf1f5}.detail-grid div:nth-child(odd){border-right:1px solid #edf1f5}.detail-grid dt{margin-bottom:5px;color:#94a0b0;font-size:10px}.detail-grid dd{margin:0;font-size:12px}.track-heading{margin-bottom:10px;display:flex;align-items:flex-end;justify-content:space-between}.track-heading h3{margin:0 0 3px;font-size:15px}.track-heading small{color:#95a1b2}.track-heading>strong{color:#1677ff;font-size:12px}.order-list{margin-bottom:14px;border-left:2px solid #e2ebf6}.order-list article{margin-left:-5px;padding:10px 0;display:flex;align-items:center;gap:12px}.order-list article>i{width:8px;height:8px;flex:none;border:2px solid #fff;border-radius:50%;background:#1677ff;box-shadow:0 0 0 2px #b9d8ff}.order-main{display:grid;flex:1}.order-main small,.order-amount small{margin-top:3px;color:#96a2b2;font-size:10px}.order-amount{display:grid;text-align:right}.order-amount strong{color:#24344a}@media(max-width:1000px){.summary-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:680px){.summary-grid{grid-template-columns:1fr}.toolbar{align-items:stretch;flex-wrap:wrap}.search-field{width:100%}.toolbar>span{width:100%;margin-left:0}.form-grid,.detail-grid{grid-template-columns:1fr}.detail-grid div:nth-child(odd){border-right:0}.pagination{align-items:flex-start;gap:8px;flex-direction:column}}
</style>
