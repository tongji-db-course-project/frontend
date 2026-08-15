<template>
  <div class="data-page">
    <header class="page-head"><div><p>基础资料 · 商品档案</p><h1>商品管理</h1></div><button class="primary" @click="openForm()"><Plus />新增商品</button></header>
    <section class="stats">
      <article><span class="blue"><Goods /></span><div><small>商品总数</small><strong>{{ total }}</strong></div></article>
      <article><span class="green"><CircleCheckFilled /></span><div><small>本页正常销售</small><strong>{{ enabledCount }}</strong></div></article>
      <article><span class="orange"><WarningFilled /></span><div><small>库存预警</small><strong>{{ warningTotal }}</strong></div></article>
      <article><span class="purple"><Collection /></span><div><small>商品分类</small><strong>5</strong></div></article>
    </section>
    <section v-loading="loading" class="card">
      <div class="toolbar">
        <label><Search /><input v-model="keyword" placeholder="搜索商品名称" /></label>
        <select v-model="status"><option value="">全部状态</option><option value="on_sale">在售</option><option value="off_shelf">下架</option></select>
        <button class="query" @click="search">查询</button><button @click="reset">重置</button><span>共 {{ total }} 件商品</span>
      </div>
      <div class="table-wrap"><table><thead><tr><th>商品信息</th><th>商品编号</th><th>销售价</th><th>当前库存</th><th>创建时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody><tr v-for="item in products" :key="item.productId">
          <td><div class="item-info"><i>{{ item.productName.slice(0,1) }}</i><div><b>{{ item.productName }}</b></div></div></td>
          <td><code>#{{ item.productId }}</code></td><td><b>¥ {{ item.salePrice?.toFixed(2) }}</b></td><td>{{ item.currentStock }}</td>
          <td><span class="status" :class="{off:item.status==='停售'}"><i />{{ item.status }}</span></td>
          <td class="actions"><button @click="openDetail(item)">详情</button><button @click="openForm(item)">编辑</button><button class="danger" @click="toggle(item)">{{ item.status==='在售'?'下架':'上架' }}</button></td>
        </tr></tbody></table></div>
      <div v-if="!loading && products.length===0" class="empty-state">暂无商品数据</div>
      <footer><span>第 {{ page }} 页，每页 {{ size }} 条</span><div><button :disabled="page<=1" @click="changePage(page-1)">‹</button><button class="active">{{ page }}</button><button :disabled="page*size>=total" @click="changePage(page+1)">›</button></div></footer>
    </section>
    <el-dialog v-model="formVisible" :title="editingId ? '编辑商品' : '新增商品'" width="650px">
      <el-form label-position="top"><div class="form-grid">
        <el-form-item label="商品名称" required><el-input v-model="form.productName" /></el-form-item>
        <el-form-item label="商品条码" required><el-input v-model="form.barcode" /></el-form-item>
        <el-form-item label="商品分类" required><el-select v-model="form.categoryId"><el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" /></el-select></el-form-item>
        <el-form-item label="供应商" required><el-select v-model="form.supplierId"><el-option v-for="s in suppliers" :key="s.id" :label="s.name" :value="s.id"/></el-select></el-form-item>
        <el-form-item label="规格"><el-input v-model="form.specification" /></el-form-item><el-form-item label="单位"><el-input v-model="form.unit" /></el-form-item>
        <el-form-item label="采购价"><el-input-number v-model="form.purchasePrice" :min="0" :precision="2" /></el-form-item><el-form-item label="销售价"><el-input-number v-model="form.salePrice" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="库存预警值"><el-input-number v-model="form.stockWarning" :min="0" /></el-form-item><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="正常">正常</el-radio><el-radio value="停用">停用</el-radio></el-radio-group></el-form-item>
      </div></el-form><template #footer><el-button @click="formVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存商品</el-button></template>
    </el-dialog>
    <el-drawer v-model="detailVisible" title="商品详情" size="420px"><div v-loading="detailLoading" class="detail"><template v-if="selected"><h2>{{ selected.productName }}</h2><p>{{ selected.barcode }}</p><dl><div><dt>分类</dt><dd>{{ categoryName(selected.categoryId) }}</dd></div><div><dt>供应商</dt><dd>{{ supplierName(selected.supplierId) }}</dd></div><div><dt>规格单位</dt><dd>{{ selected.specification }} / {{ selected.unit }}</dd></div><div><dt>采购价</dt><dd>¥ {{ selected.purchasePrice.toFixed(2) }}</dd></div><div><dt>销售价</dt><dd>¥ {{ selected.salePrice.toFixed(2) }}</dd></div><div><dt>预警值</dt><dd>{{ selected.stockWarning }} {{ selected.unit }}</dd></div></dl></template></div></el-drawer>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheckFilled, Collection, Goods, Plus, Search, WarningFilled } from '@element-plus/icons-vue'
import { productApi } from '../../api/product'
import type { Product, ProductListItem, ProductPayload } from '../../types/product'

const categories=[{id:1,name:'饮料酒水'},{id:2,name:'休闲零食'},{id:3,name:'粮油调味'},{id:4,name:'日用百货'},{id:5,name:'乳品烘焙'}]
const suppliers=[{id:1,name:'华东食品供应链'},{id:2,name:'城市生鲜配送'}]
const products=ref<ProductListItem[]>([])
const keyword=ref(''),status=ref(''),formVisible=ref(false),detailVisible=ref(false)
const editingId=ref<number|null>(null),selected=ref<ProductListItem|null>(null)
const loading=ref(false),saving=ref(false),detailLoading=ref(false),warningTotal=ref(0),total=ref(0),page=ref(1),size=ref(10)
const empty=():ProductPayload=>({productName:'',barcode:'',categoryId:1,supplierId:1,specification:'',purchasePrice:0,salePrice:0,stockWarning:10,unit:'件',status:'在售'})
const form=reactive(empty())
const enabledCount=computed(()=>products.value.filter(x=>x.status==='在售').length)
const categoryName=(id:number)=>categories.find(x=>x.id===id)?.name||`分类 #${id}`
const supplierName=(id:number)=>suppliers.find(x=>x.id===id)?.name||`供应商 #${id}`
const statusLabel=(value:string)=>value||'-'

async function loadProducts(){loading.value=true;try{const result=await productApi.getList({page:page.value,size:size.value,keyword:keyword.value||undefined,status:status.value||undefined});products.value=result?.list||[];total.value=result?.total||0;page.value=result?.page||page.value;size.value=result?.size||size.value}catch{products.value=[];total.value=0}finally{loading.value=false}}
async function loadWarningTotal(){try{const result=await productApi.getWarningStock({page:1,size:1});warningTotal.value=result?.total||0}catch{warningTotal.value=0}}
async function search(){page.value=1;loadProducts()}
function reset(){keyword.value='';status.value='';page.value=1;loadProducts()}
function changePage(next:number){page.value=next;loadProducts()}
async function openForm(item:ProductListItem|null=null){editingId.value=item?.productId||null;Object.assign(form,item?await productApi.getDetail(item.productId):empty());formVisible.value=true}
async function save(){if(!form.productName||!form.barcode){ElMessage.warning('请填写商品名称和条码');return}saving.value=true;try{if(editingId.value)await productApi.update(editingId.value,{...form});else await productApi.create({...form});ElMessage.success(editingId.value?'商品修改成功':'商品新增成功');formVisible.value=false;await loadProducts()}finally{saving.value=false}}
async function toggle(item:ProductListItem){if(item.status==='在售'){await ElMessageBox.confirm('下架后该商品将不可继续销售，确认下架吗？','下架商品',{type:'warning'});await productApi.remove(item.productId);ElMessage.success('商品已下架')}else{const detail=await productApi.getDetail(item.productId);await productApi.update(item.productId,{...detail,status:'在售'});ElMessage.success('商品已上架')}await loadProducts()}
async function openDetail(item:ProductListItem){selected.value=null;detailVisible.value=true;detailLoading.value=true;try{selected.value=await productApi.getDetail(item.productId)}finally{detailLoading.value=false}}

onMounted(()=>{loadProducts();loadWarningTotal()})
</script>
<style scoped>
.data-page{color:#29384f}.page-head{margin:3px 2px 14px;display:flex;align-items:flex-end;justify-content:space-between}.page-head p{margin:0;color:#98a4b6;font-size:12px}.page-head h1{margin:3px 0 0;font-size:24px}.primary{height:36px;padding:0 14px;display:flex;align-items:center;gap:7px;color:#fff;border:0;border-radius:7px;background:#1677ff}.primary svg{width:14px}.stats{margin-bottom:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.stats article,.card{border:1px solid #e6ebf2;border-radius:8px;background:#fff}.stats article{padding:15px;display:flex;align-items:center;gap:12px}.stats article>span{width:40px;height:40px;display:grid;place-items:center;border-radius:9px}.stats svg{width:19px}.stats article div{display:grid}.stats small{color:#8290a3;font-size:10px}.stats strong{font-size:21px}.blue{color:#1677ff;background:#eaf3ff}.green{color:#16a67a;background:#e8f8f2}.orange{color:#e58c12;background:#fff4df}.purple{color:#8b5cf6;background:#f1edff}.card{padding:15px}.toolbar{margin-bottom:14px;display:flex;align-items:center;gap:9px}.toolbar label{width:260px;height:34px;padding:0 10px;display:flex;align-items:center;gap:7px;border:1px solid #dde4ed;border-radius:6px}.toolbar label svg{width:15px}.toolbar input{width:100%;border:0;background:transparent}.toolbar select,.toolbar>button{height:34px;padding:0 11px;border:1px solid #dde4ed;border-radius:6px;background:#fff;font-size:11px}.toolbar .query{color:#fff;border-color:#1677ff;background:#1677ff}.toolbar>span{margin-left:auto;color:#9ba6b5;font-size:10px}.table-wrap{overflow-x:auto;border:1px solid #e8edf3;border-radius:7px}table{width:100%;min-width:1000px;border-collapse:collapse}th,td{padding:12px 13px;text-align:left;border-bottom:1px solid #edf1f5;font-size:11px}th{color:#718096;background:#f7f9fc}.item-info{display:flex;align-items:center;gap:9px}.item-info>i{width:34px;height:34px;display:grid;place-items:center;color:#1677ff;border-radius:8px;background:#eaf3ff;font-style:normal}.item-info div{display:grid}.item-info small,.block{display:block;color:#9ba6b5;font-size:9px}code{padding:3px 6px;background:#f1f4f8}.status{display:flex;align-items:center;gap:5px;color:#169c73}.status i{width:6px;height:6px;border-radius:50%;background:#20bd87}.status.off{color:#8995a6}.status.off i{background:#a5aebb}.actions{white-space:nowrap}.actions button{margin-right:9px;color:#1677ff;border:0;background:transparent}.actions .danger{color:#e55358}.empty-state{padding:28px;text-align:center;color:#9aa5b4;font-size:12px}.card footer{padding-top:13px;display:flex;justify-content:space-between;color:#99a5b5;font-size:10px}.card footer div{display:flex;gap:5px}.card footer button{width:28px;height:28px;border:1px solid #e0e6ee;border-radius:5px;background:#fff}.card footer button:disabled{cursor:not-allowed;opacity:.45}.card footer .active{color:#fff;background:#1677ff}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}.form-grid :deep(.el-select),.form-grid :deep(.el-input-number){width:100%}.detail{min-height:180px}.detail h2{margin-bottom:4px}.detail>p{color:#98a4b6}.detail dl{display:grid;gap:12px}.detail dl div{display:grid;grid-template-columns:90px 1fr;padding-bottom:10px;border-bottom:1px solid #edf1f5}.detail dt{color:#98a4b6}.detail dd{margin:0}@media(max-width:1000px){.stats{grid-template-columns:repeat(2,1fr)}}@media(max-width:680px){.stats{grid-template-columns:1fr}.toolbar{flex-wrap:wrap}.toolbar label{width:100%}.toolbar>span{width:100%;margin:0}.form-grid{grid-template-columns:1fr}}
</style>
