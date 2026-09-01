<template>
  <div class="biz-page">
    <PageHeader eyebrow="库存管理 · 实时库存" title="当前库存" description="按商品和仓库查询库存，及时处理库存预警" />
    <section class="biz-stats">
      <StatCard label="库存记录" :value="total" :icon="Box" />
      <StatCard label="本页库存总量" :value="stockTotal" :icon="GoodsFilled" tone="green" />
      <StatCard label="本页预警" :value="warningCount" :icon="WarningFilled" tone="orange" />
      <StatCard label="本页缺货" :value="outOfStockCount" :icon="CircleCloseFilled" tone="red" />
    </section>
    <section class="biz-card">
      <div class="biz-toolbar">
        <el-input v-model="query.keyword" placeholder="商品名称或条码" clearable :prefix-icon="Search" @keyup.enter="search" />
        <el-select v-model="query.warehouseId" placeholder="全部仓库" clearable><el-option v-for="item in warehouses" :key="item.warehouseId" :label="item.warehouseName" :value="item.warehouseId" /></el-select>
        <el-checkbox v-model="query.warningOnly">只看库存预警</el-checkbox>
        <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button>
        <span class="biz-toolbar__summary">共 {{ total }} 条库存记录</span>
      </div>
      <el-table v-loading="loading" :data="items" row-key="inventoryId" stripe border class="biz-table">
        <el-table-column label="商品信息" min-width="220"><template #default="{ row }"><div class="biz-product"><span class="biz-product__avatar">{{ (row.productName || '商').slice(0,1) }}</span><div><b>{{ row.productName || `商品 #${row.productId}` }}</b><small>{{ row.barcode || '-' }} · {{ row.specification || '规格未提供' }}</small></div></div></template></el-table-column>
        <el-table-column label="仓库" min-width="150"><template #default="{ row }">{{ row.warehouseName || `仓库 #${row.warehouseId}` }}</template></el-table-column>
        <el-table-column label="当前库存" width="125" align="right"><template #default="{ row }"><strong :class="statusOf(row) === '缺货' ? 'biz-negative' : ''">{{ formatQuantity(row.currentStock, row.unit || '') }}</strong></template></el-table-column>
        <el-table-column label="预警值" width="110" align="right"><template #default="{ row }">{{ row.stockWarning == null ? '-' : formatQuantity(row.stockWarning, row.unit || '') }}</template></el-table-column>
        <el-table-column label="库存状态" width="100" align="center"><template #default="{ row }"><span class="biz-status" :class="statusTone(statusOf(row))">{{ statusOf(row) }}</span></template></el-table-column>
        <el-table-column label="最后更新" width="170"><template #default="{ row }">{{ formatDateTime(row.lastUpdateTime) }}</template></el-table-column>
        <el-table-column label="操作" width="180" fixed="right"><template #default="{row}"><el-button v-if="statusOf(row)!=='正常'" link type="warning" @click="createPurchase(row)">发起采购</el-button><el-button v-if="canCount" link type="primary" @click="openCount(row)">库存盘点</el-button></template></el-table-column>
      </el-table>
      <div class="biz-pagination"><el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total" v-model:current-page="query.page" v-model:page-size="query.size" :page-sizes="[10,20,50]" @change="load" /></div>
    </section>
    <el-dialog v-model="countVisible" title="库存盘点与损益调整" width="520px"><el-descriptions v-if="countTarget" :column="2" border><el-descriptions-item label="商品">{{countTarget.productName}}</el-descriptions-item><el-descriptions-item label="账面库存">{{countTarget.currentStock}}</el-descriptions-item></el-descriptions><el-form label-position="top" style="margin-top:16px"><el-form-item label="实际盘点数量"><el-input-number v-model="actualStock" :min="0" :precision="0" style="width:100%"/></el-form-item><el-form-item label="盘点差异"><el-tag :type="countChange===0?'info':countChange>0?'success':'danger'">{{countChange>0?`盘盈 +${countChange}`:countChange<0?`盘亏 ${countChange}`:'无差异'}}</el-tag></el-form-item><el-form-item label="盘点说明"><el-input v-model="countRemark" maxlength="200"/></el-form-item></el-form><template #footer><el-button @click="countVisible=false">取消</el-button><el-button type="primary" :disabled="countChange===0" :loading="counting" @click="submitCount">确认调整库存</el-button></template></el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Box, CircleCloseFilled, GoodsFilled, Search, WarningFilled } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { inventoryApi } from '../../api/inventory'
import { useAuthStore } from '../../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { InventoryItem, InventoryQuery, InventoryStatus, Warehouse } from '../../types/inventory'
import { formatDateTime, formatQuantity } from '../../utils/format'
import { normalizeRoleName } from '../../utils/roles'

const items = ref<InventoryItem[]>([]), warehouses = ref<Warehouse[]>([])
const router = useRouter()
const loading = ref(false), total = ref(0)
const auth=useAuthStore(),canCount=computed(()=>normalizeRoleName(auth.userInfo?.roleName||auth.roleName)==='管理员')
const countVisible=ref(false),counting=ref(false),countTarget=ref<InventoryItem|null>(null),actualStock=ref(0),countRemark=ref('')
const countChange=computed(()=>actualStock.value-Number(countTarget.value?.currentStock||0))
const query = reactive<InventoryQuery>({ page: 1, size: 10, keyword: '', warehouseId: undefined, warningOnly: false })
const statusOf = (item: InventoryItem): InventoryStatus => item.currentStock <= 0 ? '缺货' : item.stockWarning != null && item.currentStock <= item.stockWarning ? '预警' : '正常'
const statusTone = (status: InventoryStatus) => status === '正常' ? 'green' : status === '预警' ? 'orange' : 'red'
const stockTotal = computed(() => items.value.reduce((sum, item) => sum + item.currentStock, 0))
const warningCount = computed(() => items.value.filter(item => statusOf(item) === '预警').length)
const outOfStockCount = computed(() => items.value.filter(item => statusOf(item) === '缺货').length)
function createPurchase(item: InventoryItem) { router.push({ path: '/purchases/create', query: { productId: String(item.productId), source: 'inventory-warning' } }) }
async function load() { loading.value = true; try { const params = { ...query, keyword: query.keyword || undefined, warehouseId: query.warehouseId || undefined }; const result = query.warningOnly ? await inventoryApi.getWarningList(params) : await inventoryApi.getList(params); items.value = result?.list ?? []; total.value = result?.total ?? 0 } catch { items.value = []; total.value = 0 } finally { loading.value = false } }
async function loadWarehouses() { try { warehouses.value = await inventoryApi.getWarehouses() ?? [] } catch { warehouses.value = [] } }
function search() { query.page = 1; load() }
function reset() { Object.assign(query, { page: 1, size: 10, keyword: '', warehouseId: undefined, warningOnly: false }); load() }
function openCount(row:InventoryItem){countTarget.value=row;actualStock.value=row.currentStock;countRemark.value='';countVisible.value=true}
async function submitCount(){if(!countTarget.value||countChange.value===0)return;await ElMessageBox.confirm(`确认按实际库存 ${actualStock.value} 调整吗？`,'确认盘点结果',{type:'warning'});counting.value=true;try{await inventoryApi.adjust({productId:countTarget.value.productId,changeQty:countChange.value,recordType:'盘点',remark:countRemark.value||'库存盘点调整',sourceNo:`PD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`});ElMessage.success('盘点库存已调整并生成流水');countVisible.value=false;await load()}finally{counting.value=false}}
onMounted(() => { load(); loadWarehouses() })
</script>
