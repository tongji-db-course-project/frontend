<template>
  <div class="member-page">
    <section class="page-heading">
      <div>
        <p>客户中心 · 会员档案</p>
        <h1>会员管理</h1>
      </div>
      <button class="primary-button" @click="dialogVisible = true">
        <Plus />
        新增会员
      </button>
    </section>

    <section class="summary-grid">
      <article>
        <span>会员总数</span>
        <strong>2,846</strong>
        <small>本月新增 126 人</small>
      </article>
      <article>
        <span>活跃会员</span>
        <strong>1,932</strong>
        <small>活跃率 67.9%</small>
      </article>
      <article>
        <span>会员储值</span>
        <strong>¥ 186,420</strong>
        <small>较上月增长 8.6%</small>
      </article>
      <article>
        <span>累计积分</span>
        <strong>985,620</strong>
        <small>本月消耗 32,580</small>
      </article>
    </section>

    <section class="content-card">
      <div class="toolbar">
        <div class="search-field">
          <Search />
          <input v-model="keyword" placeholder="搜索姓名、手机号或会员编号" />
        </div>
        <select v-model="level">
          <option value="">全部等级</option>
          <option>普通会员</option>
          <option>银卡会员</option>
          <option>金卡会员</option>
        </select>
        <button class="filter-button">筛选</button>
        <span>共 {{ filteredMembers.length }} 条记录</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>会员信息</th>
              <th>手机号</th>
              <th>会员等级</th>
              <th>账户余额</th>
              <th>可用积分</th>
              <th>最近消费</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in filteredMembers" :key="member.id">
              <td>
                <div class="member-info">
                  <span>{{ member.name.slice(0, 1) }}</span>
                  <div>
                    <strong>{{ member.name }}</strong>
                    <small>{{ member.id }}</small>
                  </div>
                </div>
              </td>
              <td>{{ member.phone }}</td>
              <td><span class="level-tag">{{ member.level }}</span></td>
              <td>{{ member.balance }}</td>
              <td>{{ member.points }}</td>
              <td>{{ member.lastVisit }}</td>
              <td><span class="status"><i />正常</span></td>
              <td>
                <button class="link-button">详情</button>
                <button class="link-button">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="pagination">
        <span>显示 1–{{ filteredMembers.length }} 条</span>
        <div>
          <button disabled>‹</button>
          <button class="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>›</button>
        </div>
      </footer>
    </section>

    <el-dialog v-model="dialogVisible" title="新增会员" width="460px">
      <el-form label-position="top">
        <el-form-item label="会员姓名"><el-input placeholder="请输入会员姓名" /></el-form-item>
        <el-form-item label="手机号码"><el-input placeholder="请输入手机号码" /></el-form-item>
        <el-form-item label="会员等级">
          <el-select placeholder="请选择会员等级" style="width: 100%">
            <el-option label="普通会员" value="普通会员" />
            <el-option label="银卡会员" value="银卡会员" />
            <el-option label="金卡会员" value="金卡会员" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">保存会员</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'

const keyword = ref('')
const level = ref('')
const dialogVisible = ref(false)

const members = [
  { id: 'M202607001', name: '陈晓雨', phone: '138****6821', level: '金卡会员', balance: '¥ 1,260.00', points: '8,520', lastVisit: '2026-07-27' },
  { id: 'M202607002', name: '林子涵', phone: '139****1056', level: '银卡会员', balance: '¥ 586.50', points: '3,860', lastVisit: '2026-07-26' },
  { id: 'M202607003', name: '周明远', phone: '186****3378', level: '普通会员', balance: '¥ 128.00', points: '1,240', lastVisit: '2026-07-25' },
  { id: 'M202607004', name: '王若曦', phone: '158****9024', level: '金卡会员', balance: '¥ 2,430.80', points: '12,680', lastVisit: '2026-07-24' },
  { id: 'M202607005', name: '赵一鸣', phone: '177****4512', level: '普通会员', balance: '¥ 60.00', points: '860', lastVisit: '2026-07-22' },
]

const filteredMembers = computed(() => members.filter((member) => {
  const matchesKeyword = !keyword.value
    || member.name.includes(keyword.value)
    || member.phone.includes(keyword.value)
    || member.id.toLowerCase().includes(keyword.value.toLowerCase())
  return matchesKeyword && (!level.value || member.level === level.value)
}))
</script>

<style scoped>
.member-page { color: #29384f; }
.page-heading { margin: 3px 2px 14px; display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.page-heading p { margin: 0; color: #98a4b6; font-size: 12px; }
.page-heading h1 { margin: 3px 0 0; color: #1e2d43; font-size: 24px; }
.primary-button { height: 36px; padding: 0 14px; display: flex; align-items: center; gap: 7px; color: #fff; border: 0; border-radius: 7px; background: #1677ff; box-shadow: 0 5px 12px rgba(22,119,255,.18); }
.primary-button svg { width: 14px; }
.summary-grid { margin-bottom: 12px; display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
.summary-grid article, .content-card { border: 1px solid #e6ebf2; border-radius: 8px; background: #fff; }
.summary-grid article { padding: 16px; display: grid; gap: 3px; }
.summary-grid span { color: #7d899b; font-size: 11px; }
.summary-grid strong { color: #24344a; font-size: 21px; }
.summary-grid small { color: #19a77b; font-size: 10px; }
.content-card { padding: 15px; }
.toolbar { margin-bottom: 14px; display: flex; align-items: center; gap: 9px; }
.search-field { width: 280px; height: 34px; padding: 0 10px; display: flex; align-items: center; gap: 7px; border: 1px solid #dde4ed; border-radius: 6px; background: #fbfcfe; }
.search-field svg { width: 15px; color: #91a0b4; }
.search-field input { width: 100%; border: 0; background: transparent; font-size: 11px; }
.toolbar select, .filter-button { height: 34px; padding: 0 11px; color: #56657b; border: 1px solid #dde4ed; border-radius: 6px; background: #fff; font-size: 11px; }
.toolbar > span { margin-left: auto; color: #9ba6b5; font-size: 10px; }
.table-wrap { overflow-x: auto; border: 1px solid #e8edf3; border-radius: 7px; }
table { width: 100%; min-width: 900px; border-collapse: collapse; }
th, td { padding: 12px 13px; text-align: left; border-bottom: 1px solid #edf1f5; font-size: 11px; }
th { color: #718096; font-weight: 600; background: #f7f9fc; }
td { color: #46556b; }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: #fafcff; }
.member-info { display: flex; align-items: center; gap: 9px; }
.member-info > span { width: 31px; height: 31px; display: grid; place-items: center; color: #1677ff; border-radius: 8px; background: #eaf3ff; font-weight: 700; }
.member-info div { display: grid; }
.member-info strong { color: #344359; font-size: 11px; }
.member-info small { color: #a1abb9; font-size: 9px; }
.level-tag { padding: 4px 7px; color: #7d5bd6; border-radius: 4px; background: #f2edff; font-size: 9px; }
.status { display: flex; align-items: center; gap: 5px; color: #169c73; }
.status i { width: 6px; height: 6px; border-radius: 50%; background: #20bd87; }
.link-button { margin-right: 8px; padding: 0; color: #1677ff; border: 0; background: transparent; font-size: 10px; }
.pagination { padding-top: 13px; display: flex; align-items: center; justify-content: space-between; color: #99a5b5; font-size: 10px; }
.pagination div { display: flex; gap: 5px; }
.pagination button { width: 28px; height: 28px; color: #6f7e92; border: 1px solid #e0e6ee; border-radius: 5px; background: #fff; }
.pagination button.active { color: #fff; border-color: #1677ff; background: #1677ff; }
@media (max-width: 1000px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 680px) {
  .summary-grid { grid-template-columns: 1fr; }
  .toolbar { align-items: stretch; flex-wrap: wrap; }
  .search-field { width: 100%; }
  .toolbar > span { width: 100%; margin-left: 0; }
}
</style>
