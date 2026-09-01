<template>
  <div class="data-page">
    <header class="page-head"><div><p>基础资料 · 商品档案</p><h1>商品管理</h1></div><el-button v-if="canEdit" type="primary" :icon="Plus" @click="openForm()">新增商品</el-button></header>
    <section class="stats">
      <article><span class="blue"><Goods /></span><div><small>商品总数</small><strong>{{ total }}</strong></div></article>
      <article><span class="green"><CircleCheckFilled /></span><div><small>本页正常销售</small><strong>{{ enabledCount }}</strong></div></article>
      <article><span class="orange"><WarningFilled /></span><div><small>本页库存预警</small><strong>{{ warningTotal }}</strong></div></article>
      <article><span class="purple"><Collection /></span><div><small>本页商品分类</small><strong>{{ categoryCount }}</strong></div></article>
    </section>
    <section v-loading="loading" class="card">
      <div class="toolbar">
        <label><Search /><input v-model="keyword" placeholder="搜索商品名称" /></label>
        <select v-model="status"><option value="">全部状态</option><option value="在售">在售</option><option value="停售">停售</option></select>
        <select v-model.number="categoryId"><option :value="0">全部分类</option><option v-for="item in categories" :key="item.categoryId" :value="item.categoryId">{{ item.categoryName }}</option></select>
        <select v-model.number="supplierId"><option :value="0">全部供应商</option><option v-for="item in suppliers" :key="item.supplierId" :value="item.supplierId">{{ item.supplierName }}</option></select>
        <el-input-number v-model="minStock" :min="0" placeholder="最低库存" controls-position="right" />
        <el-input-number v-model="maxStock" :min="0" placeholder="最高库存" controls-position="right" />
        <button class="query" @click="search">查询</button><button @click="reset">重置</button><span>共 {{ total }} 件商品</span>
      </div>
      <div class="table-wrap"><table><thead><tr><th>商品信息</th><th>商品编号</th><th>分类 / 供应商</th><th>销售价</th><th>当前库存</th><th>状态</th><th>操作</th></tr></thead>
        <tbody><tr v-for="item in products" :key="item.productId">
          <td><div class="item-info"><i>{{ item.productName?.slice(0,1) || '?' }}</i><div><b>{{ item.productName }}</b><small>{{ item.barcode || '无条码' }} · {{ item.specification || '暂无规格' }}</small></div></div></td>
          <td><code>#{{ item.productId }}</code></td><td><b>{{ item.categoryName || `分类 #${item.categoryId}` }}</b><small class="block">{{ item.supplierName || `供应商 #${item.supplierId}` }}</small></td><td><b>¥ {{ Number(item.salePrice || 0).toFixed(2) }}</b></td><td>{{ item.currentStock }} {{ item.unit || '' }}</td>
          <td><span class="status" :class="{off:item.status!=='在售'}"><i />{{ item.status || '未知' }}</span></td>
          <td class="actions"><button @click="openDetail(item)">查看</button><button v-if="canEdit" @click="openForm(item)">编辑</button><button v-if="canEdit" class="danger" @click="removeProduct(item)">删除</button></td>
        </tr></tbody></table></div>
      <div v-if="!loading && products.length===0" class="empty-state">暂无商品数据</div>
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50]"
          :total="total"
          @current-change="loadProducts"
          @size-change="handleSizeChange"
        />
      </div>
    </section>

    <el-dialog v-model="formVisible" :title="editingId ? '编辑商品' : '新增商品'" width="680px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" class="form-grid">
        <el-form-item label="商品名称" prop="productName"><el-input v-model="form.productName" /></el-form-item>
        <el-form-item label="商品条码" prop="barcode"><el-input v-model="form.barcode" /></el-form-item>
        <el-form-item label="商品分类" prop="categoryId"><el-select v-model="form.categoryId" filterable><el-option v-for="item in categories" :key="item.categoryId" :label="item.categoryName" :value="item.categoryId" /></el-select></el-form-item>
        <el-form-item label="供应商" prop="supplierId"><el-select v-model="form.supplierId" filterable><el-option v-for="item in suppliers" :key="item.supplierId" :label="item.supplierName" :value="item.supplierId" /></el-select></el-form-item>
        <el-form-item label="规格"><el-input v-model="form.specification" /></el-form-item>
        <el-form-item label="单位"><el-input v-model="form.unit" /></el-form-item>
        <el-form-item label="采购价" prop="purchasePrice"><el-input-number v-model="form.purchasePrice" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="销售价" prop="salePrice"><el-input-number v-model="form.salePrice" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="库存预警"><el-input-number v-model="form.stockWarning" :min="0" :precision="0" /></el-form-item>
        <el-form-item label="销售状态"><el-select v-model="form.status"><el-option label="在售" value="在售" /><el-option label="停售" value="停售" /></el-select></el-form-item>
        <el-form-item label="促销商品"><el-switch v-model="promotionEnabled" /></el-form-item>
        <el-form-item v-if="promotionEnabled" label="促销价"><el-input-number v-model="form.promotionPrice" :min="0" :precision="2" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="formVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="saveProduct">保存</el-button></template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="商品详情" size="420px">
      <div v-loading="detailLoading" class="detail" v-if="selected"><h2>{{ selected.productName }}</h2><p>#{{ selected.productId }} · {{ selected.barcode || '无条码' }}</p><dl>
        <div><dt>分类</dt><dd>{{ categoryName(selected.categoryId) }}</dd></div><div><dt>供应商</dt><dd>{{ supplierName(selected.supplierId) }}</dd></div>
        <div><dt>规格 / 单位</dt><dd>{{ selected.specification || '-' }} / {{ selected.unit || '-' }}</dd></div><div><dt>采购价</dt><dd>¥ {{ Number(selected.purchasePrice).toFixed(2) }}</dd></div>
        <div><dt>销售价</dt><dd>¥ {{ Number(selected.salePrice).toFixed(2) }}</dd></div><div><dt>库存预警</dt><dd>{{ selected.stockWarning }}</dd></div><div><dt>状态</dt><dd>{{ selected.status }}</dd></div>
      </dl></div>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { CircleCheckFilled, Collection, Goods, Plus, Search, WarningFilled } from '@element-plus/icons-vue'
import { productApi } from '../../api/product'
import { categoryApi } from '../../api/category'
import { supplierApi } from '../../api/supplier'
import { useAuthStore } from '../../stores/auth'
import { normalizeRoleName } from '../../utils/roles'
import type { Product, ProductCategory, ProductListItem, ProductPayload } from '../../types/product'
import type { Supplier } from '../../types/supplier'

const products=ref<ProductListItem[]>([])
const authStore=useAuthStore()
const canEdit=computed(()=>normalizeRoleName(authStore.userInfo?.roleName||authStore.roleName)!=='收银员')
const keyword=ref(''),status=ref(''),categoryId=ref(0),supplierId=ref(0),minStock=ref<number|undefined>(),maxStock=ref<number|undefined>()
const loading=ref(false),total=ref(0),page=ref(1),size=ref(10)
const formVisible=ref(false),detailVisible=ref(false),saving=ref(false),detailLoading=ref(false)
const editingId=ref<number|null>(null),selected=ref<Product|null>(null),formRef=ref<FormInstance>()
const categories=ref<ProductCategory[]>([]),suppliers=ref<Supplier[]>([])
const emptyForm=():ProductPayload=>({categoryId:0,supplierId:0,productName:'',barcode:'',specification:'',purchasePrice:0,salePrice:0,stockWarning:0,unit:'件',status:'在售',isPromotion:'否',promotionPrice:null})
const form=reactive<ProductPayload>(emptyForm())
const promotionEnabled=computed({get:()=>form.isPromotion==='是',set:value=>{form.isPromotion=value?'是':'否';if(!value)form.promotionPrice=null}})
const rules:FormRules<ProductPayload>={productName:[{required:true,message:'请输入商品名称',trigger:'blur'}],barcode:[{required:true,message:'请输入商品条码',trigger:'blur'}],categoryId:[{required:true,type:'number',min:1,message:'请选择商品分类',trigger:'change'}],supplierId:[{required:true,type:'number',min:1,message:'请选择供应商',trigger:'change'}],purchasePrice:[{required:true,message:'请输入采购价',trigger:'change'}],salePrice:[{required:true,message:'请输入销售价',trigger:'change'}]}
const enabledCount=computed(()=>products.value.filter(x=>x.status==='在售').length)
const warningTotal=computed(()=>products.value.filter(x=>x.stockWarning != null && x.currentStock < x.stockWarning).length)
const categoryCount=computed(()=>new Set(products.value.map(x=>x.categoryId)).size)

async function loadProducts(){loading.value=true;try{const result=await productApi.getList({page:page.value,size:size.value,keyword:keyword.value||undefined,status:status.value||undefined,categoryId:categoryId.value||undefined,supplierId:supplierId.value||undefined,minStock:minStock.value,maxStock:maxStock.value});products.value=result?.list||[];total.value=result?.total||0;page.value=result?.page||page.value;size.value=result?.size||size.value}catch{products.value=[];total.value=0}finally{loading.value=false}}
async function search(){page.value=1;loadProducts()}
function reset(){keyword.value='';status.value='';categoryId.value=0;supplierId.value=0;minStock.value=undefined;maxStock.value=undefined;page.value=1;loadProducts()}
function handleSizeChange(){page.value=1;loadProducts()}
async function loadOptions(){const [categoryResult,supplierResult]=await Promise.all([categoryApi.getList({page:1,size:100,status:'启用'}),supplierApi.getList({page:1,size:100,status:'启用'})]);categories.value=categoryResult?.list||[];suppliers.value=supplierResult?.list||[]}
async function openForm(item?:ProductListItem){editingId.value=item?.productId??null;Object.assign(form,emptyForm());if(item){saving.value=true;try{Object.assign(form,await productApi.getDetail(item.productId))}finally{saving.value=false}}formVisible.value=true}
async function saveProduct(){if(!await formRef.value?.validate().catch(()=>false))return;saving.value=true;try{if(editingId.value)await productApi.update(editingId.value,{...form});else await productApi.create({...form});ElMessage.success(editingId.value?'商品已更新':'商品已新增');formVisible.value=false;await loadProducts()}finally{saving.value=false}}
async function openDetail(item:ProductListItem){detailVisible.value=true;detailLoading.value=true;selected.value=null;try{selected.value=await productApi.getDetail(item.productId)}finally{detailLoading.value=false}}
async function removeProduct(item:ProductListItem){await ElMessageBox.confirm(`确认删除商品“${item.productName}”吗？`,'删除商品',{type:'warning'});await productApi.remove(item.productId);ElMessage.success('商品已删除');await loadProducts()}
const categoryName=(id:number)=>categories.value.find(x=>x.categoryId===id)?.categoryName||`分类 #${id}`
const supplierName=(id:number)=>suppliers.value.find(x=>x.supplierId===id)?.supplierName||`供应商 #${id}`

onMounted(()=>Promise.all([loadProducts(),loadOptions()]))
</script>
<style scoped>
.read-only-tip{padding:8px 12px;color:#1677ff;border-radius:6px;background:#eaf3ff;font-size:11px}
.data-page{color:#29384f}.page-head{margin:3px 2px 14px;display:flex;align-items:flex-end;justify-content:space-between}.page-head p{margin:0;color:#98a4b6;font-size:12px}.page-head h1{margin:3px 0 0;font-size:24px}.primary{height:36px;padding:0 14px;display:flex;align-items:center;gap:7px;color:#fff;border:0;border-radius:7px;background:#1677ff}.primary svg{width:14px}.stats{margin-bottom:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.stats article,.card{border:1px solid #e6ebf2;border-radius:8px;background:#fff}.stats article{padding:15px;display:flex;align-items:center;gap:12px}.stats article>span{width:40px;height:40px;display:grid;place-items:center;border-radius:9px}.stats svg{width:19px}.stats article div{display:grid}.stats small{color:#8290a3;font-size:10px}.stats strong{font-size:21px}.blue{color:#1677ff;background:#eaf3ff}.green{color:#16a67a;background:#e8f8f2}.orange{color:#e58c12;background:#fff4df}.purple{color:#8b5cf6;background:#f1edff}.card{padding:15px}.toolbar{margin-bottom:14px;display:flex;align-items:center;gap:9px}.toolbar label{width:260px;height:34px;padding:0 10px;display:flex;align-items:center;gap:7px;border:1px solid #dde4ed;border-radius:6px}.toolbar label svg{width:15px}.toolbar input{width:100%;border:0;background:transparent}.toolbar select,.toolbar>button{height:34px;padding:0 11px;border:1px solid #dde4ed;border-radius:6px;background:#fff;font-size:11px}.toolbar .query{color:#fff;border-color:#1677ff;background:#1677ff}.toolbar>span{margin-left:auto;color:#9ba6b5;font-size:10px}.table-wrap{overflow-x:auto;border:1px solid #e8edf3;border-radius:7px}table{width:100%;min-width:1000px;border-collapse:collapse}th,td{padding:12px 13px;text-align:left;border-bottom:1px solid #edf1f5;font-size:11px}th{color:#718096;background:#f7f9fc}.item-info{display:flex;align-items:center;gap:9px}.item-info>i{width:34px;height:34px;display:grid;place-items:center;color:#1677ff;border-radius:8px;background:#eaf3ff;font-style:normal}.item-info div{display:grid}.item-info small,.block{display:block;color:#9ba6b5;font-size:9px}code{padding:3px 6px;background:#f1f4f8}.status{display:flex;align-items:center;gap:5px;color:#169c73}.status i{width:6px;height:6px;border-radius:50%;background:#20bd87}.status.off{color:#8995a6}.status.off i{background:#a5aebb}.actions{white-space:nowrap}.actions button{margin-right:9px;color:#1677ff;border:0;background:transparent}.actions .danger{color:#e55358}.empty-state{padding:28px;text-align:center;color:#9aa5b4;font-size:12px}.pagination{padding-top:16px;display:flex;justify-content:flex-end}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}.form-grid :deep(.el-select),.form-grid :deep(.el-input-number){width:100%}.detail{min-height:180px}.detail h2{margin-bottom:4px}.detail>p{color:#98a4b6}.detail dl{display:grid;gap:12px}.detail dl div{display:grid;grid-template-columns:90px 1fr;padding-bottom:10px;border-bottom:1px solid #edf1f5}.detail dt{color:#98a4b6}.detail dd{margin:0}@media(max-width:1000px){.stats{grid-template-columns:repeat(2,1fr)}}@media(max-width:680px){.stats{grid-template-columns:1fr}.toolbar{flex-wrap:wrap}.toolbar label{width:100%}.toolbar>span{width:100%;margin:0}.form-grid{grid-template-columns:1fr}}
</style>
