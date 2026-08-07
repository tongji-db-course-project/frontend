<template>
  <div class="biz-page">
    <PageHeader eyebrow="库存管理 · 变动追溯" title="库存流水" description="库存流水由采购、销售、退货和盘点业务自动生成，仅支持查询" />
    <section class="biz-card">
      <div class="biz-toolbar">
        <el-input v-model="query.keyword" placeholder="商品名称或条码" clearable :prefix-icon="Search" @keyup.enter="search" />
        <el-select v-model="query.recordType" placeholder="全部流水类型" clearable><el-option v-for="type in recordTypes" :key="type" :label="type" :value="type" /></el-select>
        <el-input v-model="query.sourceNo" placeholder="来源单号" clearable />
        <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" />
        <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button>
        <span class="biz-toolbar__summary">共 {{ total }} 条流水</span>
      </div>
      <el-table v-loading="loading" :data="records" row-key="recordId" stripe border class="biz-table">
        <el-table-column label="流水编号" width="105"><template #default="{ row }">#{{ row.recordId }}</template></el-table-column>
        <el-table-column label="商品" min-width="190"><template #default="{ row }"><b>{{ row.productName || `商品 #${row.productId}` }}</b><small class="biz-muted" style="display:block">{{ row.barcode || '-' }}</small></template></el-table-column>
        <el-table-column prop="recordType" label="类型" width="90" align="center"><template #default="{ row }"><span class="biz-status" :class="typeTone(row.recordType)">{{ row.recordType }}</span></template></el-table-column>
        <el-table-column label="变动数量" width="110" align="right"><template #default="{ row }"><span :class="row.changeQty >= 0 ? 'biz-positive' : 'biz-negative'">{{ row.changeQty > 0 ? '+' : '' }}{{ row.changeQty }}</span></template></el-table-column>
        <el-table-column prop="remainQty" label="变动后库存" width="115" align="right" />
        <el-table-column label="来源单号" min-width="145"><template #default="{ row }">{{ row.sourceNo || '-' }}</template></el-table-column>
        <el-table-column label="操作人" width="120"><template #default="{ row }">{{ row.operatorName || `用户 #${row.operatorId}` }}</template></el-table-column>
        <el-table-column label="记录时间" width="170"><template #default="{ row }">{{ formatDateTime(row.recordTime) }}</template></el-table-column>
        <el-table-column label="备注" min-width="150"><template #default="{ row }">{{ row.remark || '-' }}</template></el-table-column>
      </el-table>
      <div class="biz-pagination"><el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total" v-model:current-page="query.page" v-model:page-size="query.size" :page-sizes="[10,20,50]" @change="load" /></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import { inventoryApi } from '../../api/inventory'
import type { InventoryRecord, InventoryRecordQuery } from '../../types/inventory'
import { formatDateTime } from '../../utils/format'

const recordTypes = ['入库', '销售', '退货', '盘点']
const records = ref<InventoryRecord[]>([]), loading = ref(false), total = ref(0)
const dateRange = ref<string[]>([])
const query = reactive<InventoryRecordQuery>({ page: 1, size: 10, keyword: '', recordType: '', sourceNo: '', startDate: '', endDate: '' })
watch(dateRange, value => { query.startDate = value?.[0] || ''; query.endDate = value?.[1] || '' })
const typeTone = (type: string) => type === '入库' || type === '退货' ? 'green' : type === '销售' ? 'blue' : 'orange'
async function load() { loading.value = true; try { const result = await inventoryApi.getRecords({ ...query, keyword: query.keyword || undefined, recordType: query.recordType || undefined, sourceNo: query.sourceNo || undefined, startDate: query.startDate || undefined, endDate: query.endDate || undefined }); records.value = result?.list ?? []; total.value = result?.total ?? 0 } catch { records.value = []; total.value = 0 } finally { loading.value = false } }
function search() { query.page = 1; load() }
function reset() { dateRange.value = []; Object.assign(query, { page: 1, size: 10, keyword: '', recordType: '', sourceNo: '', startDate: '', endDate: '' }); load() }
onMounted(load)
</script>
