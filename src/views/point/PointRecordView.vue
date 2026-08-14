<template>
  <div class="biz-page">
    <PageHeader eyebrow="会员管理 · 积分流水" title="积分记录" description="查询会员积分增加、抵现和人工调整记录" />
    <section class="biz-card">
      <div class="biz-toolbar">
        <el-input-number v-model="query.memberId" :min="1" :precision="0" controls-position="right" placeholder="会员编号" />
        <el-select v-model="query.changeType" placeholder="全部类型" clearable><el-option v-for="type in ['增加','抵现','调整']" :key="type" :label="type" :value="type" /></el-select>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
      <el-table v-loading="loading" :data="records" row-key="pointRecordId" stripe border class="biz-table">
        <el-table-column prop="pointRecordId" label="记录编号" width="100" />
        <el-table-column label="会员" min-width="150"><template #default="{ row }">{{ row.memberName }}（#{{ row.memberId }}）</template></el-table-column>
        <el-table-column label="销售单" min-width="150"><template #default="{ row }">{{ row.saleNo || '—' }}</template></el-table-column>
        <el-table-column prop="changeType" label="变动类型" width="100" />
        <el-table-column label="变动积分" width="110" align="right"><template #default="{ row }"><strong :class="row.changePoints >= 0 ? 'positive' : 'negative'">{{ row.changePoints > 0 ? '+' : '' }}{{ row.changePoints }}</strong></template></el-table-column>
        <el-table-column prop="remainPoints" label="剩余积分" width="110" align="right" />
        <el-table-column label="记录时间" min-width="170"><template #default="{ row }">{{ formatDateTime(row.recordTime) }}</template></el-table-column>
        <el-table-column label="备注" min-width="180"><template #default="{ row }">{{ row.remark || '—' }}</template></el-table-column>
      </el-table>
      <div class="biz-pagination"><el-pagination background layout="total, sizes, prev, pager, next" :total="total" v-model:current-page="query.page" v-model:page-size="query.size" :page-sizes="[10,20,50]" @change="load" /></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import { pointApi } from '../../api/point'
import type { PointQuery, PointRecord } from '../../types/point'
import { formatDateTime } from '../../utils/format'

const records = ref<PointRecord[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive<PointQuery>({ page: 1, size: 10, memberId: undefined, changeType: '' })

async function load() {
  loading.value = true
  try {
    const result = await pointApi.getList({ ...query, memberId: query.memberId || undefined, changeType: query.changeType || undefined })
    records.value = result?.list ?? []
    total.value = result?.total ?? 0
  } catch {
    records.value = []
    total.value = 0
  } finally { loading.value = false }
}

function search() { query.page = 1; void load() }
function reset() { Object.assign(query, { page: 1, size: 10, memberId: undefined, changeType: '' }); void load() }
onMounted(load)
</script>

<style scoped>
.positive{color:#16a67a}.negative{color:#e55358}
</style>
