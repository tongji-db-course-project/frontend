<template>
  <div class="biz-page">
    <PageHeader eyebrow="库存管理 · 盘点作业" title="库存盘点" description="创建盘点单锁定商品，录入实盘数量后一键生成盘盈盘亏并修正库存">
      <el-button type="primary" @click="openCreate()">新建盘点</el-button>
    </PageHeader>
    <section class="biz-card">
      <div class="biz-toolbar">
        <el-select v-model="query.status" placeholder="全部状态" clearable><el-option v-for="s in statuses" :key="s" :label="s" :value="s"/></el-select>
        <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button>
      </div>
      <el-table v-loading="loading" :data="rows" border stripe>
        <el-table-column prop="checkNo" label="盘点单号" min-width="210"/>
        <el-table-column prop="productName" label="商品名称" min-width="180"/>
        <el-table-column label="状态" width="100"><template #default="{row}"><el-tag :type="row.status==='已完成'?'success':row.status==='已作废'?'info':'warning'">{{row.status}}</el-tag></template></el-table-column>
        <el-table-column prop="operatorName" label="操作人" width="110"/>
        <el-table-column label="创建时间" width="170"><template #default="{row}">{{formatDateTime(row.checkDate)}}</template></el-table-column>
        <el-table-column label="操作" width="190" fixed="right"><template #default="{row}"><el-button link type="primary" @click="openDetail(row.checkId)">{{row.status==='盘点中'?'录入盘点':'查看'}}</el-button><el-button v-if="row.status==='盘点中'" link type="danger" @click="cancel(row)">作废</el-button></template></el-table-column>
      </el-table>
      <div class="biz-pagination"><el-pagination background layout="total, prev, pager, next" :total="total" v-model:current-page="query.page" v-model:page-size="query.size" @change="load"/></div>
    </section>

    <el-dialog v-model="createVisible" title="新建库存盘点" width="650px">
      <el-form label-position="top">
        <el-form-item label="盘点商品"><el-select v-model="createForm.productId" filterable clearable placeholder="请选择一个商品" style="width:100%"><el-option v-for="p in products" :key="p.productId" :label="`${p.productName}（库存 ${p.currentStock}）`" :value="p.productId"/></el-select></el-form-item>
        <el-form-item label="备注"><el-input v-model="createForm.remark" maxlength="200"/></el-form-item>
      </el-form>
      <template #footer><el-button @click="createVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="create">创建并锁定商品</el-button></template>
    </el-dialog>

    <el-dialog v-model="detailVisible" :title="detail?.checkNo || '盘点详情'" width="900px">
      <el-descriptions v-if="detail" :column="2" border><el-descriptions-item label="商品">{{detail.productName}}</el-descriptions-item><el-descriptions-item label="状态">{{detail.status}}</el-descriptions-item></el-descriptions>
      <el-table v-if="detail" :data="detail.items" border style="margin-top:16px">
        <el-table-column prop="productName" label="商品" min-width="180"/><el-table-column prop="systemQty" label="账面库存" width="100"/>
        <el-table-column label="实际库存" width="150"><template #default="{row}"><el-input-number v-if="detail.status==='盘点中'" v-model="actuals[row.productId]" :min="0" :precision="0" size="small"/><span v-else>{{row.actualQty}}</span></template></el-table-column>
        <el-table-column label="差异" width="100"><template #default="{row}"><span :class="difference(row)>0?'biz-positive':difference(row)<0?'biz-negative':''">{{difference(row)>0?'+':''}}{{difference(row)}}</span></template></el-table-column>
        <el-table-column label="结果" width="90"><template #default="{row}">{{resultType(row)}}</template></el-table-column>
        <el-table-column label="损益金额" width="120"><template #default="{row}">{{(difference(row)*Number(row.adjustPrice||0)).toFixed(2)}}</template></el-table-column>
      </el-table>
      <template #footer><el-button @click="detailVisible=false">关闭</el-button><el-button v-if="detail?.status==='盘点中'" type="primary" :loading="saving" @click="confirm">确认并修正库存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '../../components/PageHeader.vue'
import { stockCheckApi } from '../../api/stockCheck'
import { productApi } from '../../api/product'
import type { ProductListItem } from '../../types/product'
import type { StockCheckDetail, StockCheckItem, StockCheckListItem, StockCheckQuery } from '../../types/stockCheck'
import { formatDateTime } from '../../utils/format'

const statuses=['盘点中','已完成','已作废'],query=reactive<StockCheckQuery>({page:1,size:10,status:''})
const route=useRoute()
const rows=ref<StockCheckListItem[]>([]),total=ref(0),loading=ref(false),saving=ref(false),products=ref<ProductListItem[]>([])
const createVisible=ref(false),detailVisible=ref(false),detail=ref<StockCheckDetail|null>(null),actuals=reactive<Record<number,number>>({})
const createForm=reactive<{productId:number|null;remark:string}>({productId:null,remark:''})
async function load(){loading.value=true;try{const r=await stockCheckApi.list({...query,status:query.status||undefined});rows.value=r?.list??[];total.value=r?.total??0}finally{loading.value=false}}
function search(){query.page=1;load()} function reset(){Object.assign(query,{page:1,size:10,status:''});load()}
async function loadProducts(){const first=await productApi.getList({page:1,size:100});let list=first?.list??[];const pages=Math.ceil((first?.total??0)/100);for(let page=2;page<=pages;page++){const next=await productApi.getList({page,size:100});list=list.concat(next?.list??[])}products.value=list}
async function openCreate(productId?:number){createForm.productId=productId??null;createForm.remark='';createVisible.value=true;await loadProducts()}
async function create(){if(!createForm.productId){ElMessage.warning('请选择一个盘点商品');return}saving.value=true;try{const created=await stockCheckApi.create({productId:createForm.productId,remark:createForm.remark||undefined});createVisible.value=false;ElMessage.success('盘点单已创建，商品已锁定');await load();await showDetail(created)}finally{saving.value=false}}
async function openDetail(id:number){await showDetail(await stockCheckApi.get(id))}
async function showDetail(value:StockCheckDetail){detail.value=value;Object.keys(actuals).forEach(k=>delete actuals[Number(k)]);value.items.forEach(x=>actuals[x.productId]=x.actualQty??x.systemQty);detailVisible.value=true}
function difference(row:StockCheckItem){return detail.value?.status==='盘点中'?(actuals[row.productId]??row.systemQty)-row.systemQty:Number(row.differenceQty??0)}
function resultType(row:StockCheckItem){const d=difference(row);return d>0?'盘盈':d<0?'盘亏':'无差异'}
async function confirm(){if(!detail.value)return;await ElMessageBox.confirm('确认后将修正系统库存并解除商品锁定，是否继续？','确认盘点',{type:'warning'});saving.value=true;try{const value=await stockCheckApi.confirm(detail.value.checkId,{items:detail.value.items.map(x=>({productId:x.productId,actualQty:actuals[x.productId]}))});ElMessage.success('盘点完成，已生成盘盈盘亏流水');await showDetail(value);await Promise.all([load(),loadProducts()])}finally{saving.value=false}}
async function cancel(row:StockCheckListItem){await ElMessageBox.confirm('作废后将解除商品锁定，是否继续？','作废盘点',{type:'warning'});await stockCheckApi.cancel(row.checkId);ElMessage.success('盘点单已作废');load()}
onMounted(async()=>{await load();if(route.query.create==='1')await openCreate(Number(route.query.productId)||undefined)})
</script>
