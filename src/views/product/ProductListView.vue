<template>
  <div class="data-page">
    <header class="page-head"><div><p>基础资料 · 商品档案</p><h1>商品管理</h1></div><span class="read-only-tip">当前后端支持商品查询</span></header>
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
        <button class="query" @click="search">查询</button><button @click="reset">重置</button><span>共 {{ total }} 件商品</span>
      </div>
      <div class="table-wrap"><table><thead><tr><th>商品信息</th><th>商品编号</th><th>分类 / 供应商</th><th>销售价</th><th>当前库存</th><th>状态</th></tr></thead>
        <tbody><tr v-for="item in products" :key="item.productId">
          <td><div class="item-info"><i>{{ item.productName?.slice(0,1) || '?' }}</i><div><b>{{ item.productName }}</b><small>{{ item.barcode || '无条码' }} · {{ item.specification || '暂无规格' }}</small></div></div></td>
          <td><code>#{{ item.productId }}</code></td><td><b>{{ item.categoryName || `分类 #${item.categoryId}` }}</b><small class="block">{{ item.supplierName || `供应商 #${item.supplierId}` }}</small></td><td><b>¥ {{ Number(item.salePrice || 0).toFixed(2) }}</b></td><td>{{ item.currentStock }} {{ item.unit || '' }}</td>
          <td><span class="status" :class="{off:item.status!=='在售'}"><i />{{ item.status || '未知' }}</span></td>
        </tr></tbody></table></div>
      <div v-if="!loading && products.length===0" class="empty-state">暂无商品数据</div>
      <footer><span>第 {{ page }} 页，每页 {{ size }} 条</span><div><button :disabled="page<=1" @click="changePage(page-1)">‹</button><button class="active">{{ page }}</button><button :disabled="page*size>=total" @click="changePage(page+1)">›</button></div></footer>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CircleCheckFilled, Collection, Goods, Search, WarningFilled } from '@element-plus/icons-vue'
import { productApi } from '../../api/product'
import type { ProductListItem } from '../../types/product'

const products=ref<ProductListItem[]>([])
const keyword=ref(''),status=ref('')
const loading=ref(false),total=ref(0),page=ref(1),size=ref(10)
const enabledCount=computed(()=>products.value.filter(x=>x.status==='在售').length)
const warningTotal=computed(()=>products.value.filter(x=>x.stockWarning != null && x.currentStock < x.stockWarning).length)
const categoryCount=computed(()=>new Set(products.value.map(x=>x.categoryId)).size)

async function loadProducts(){loading.value=true;try{const result=await productApi.getList({page:page.value,size:size.value,keyword:keyword.value||undefined,status:status.value||undefined});products.value=result?.list||[];total.value=result?.total||0;page.value=result?.page||page.value;size.value=result?.size||size.value}catch{products.value=[];total.value=0}finally{loading.value=false}}
async function search(){page.value=1;loadProducts()}
function reset(){keyword.value='';status.value='';page.value=1;loadProducts()}
function changePage(next:number){page.value=next;loadProducts()}

onMounted(loadProducts)
</script>
<style scoped>
.read-only-tip{padding:8px 12px;color:#1677ff;border-radius:6px;background:#eaf3ff;font-size:11px}
.data-page{color:#29384f}.page-head{margin:3px 2px 14px;display:flex;align-items:flex-end;justify-content:space-between}.page-head p{margin:0;color:#98a4b6;font-size:12px}.page-head h1{margin:3px 0 0;font-size:24px}.primary{height:36px;padding:0 14px;display:flex;align-items:center;gap:7px;color:#fff;border:0;border-radius:7px;background:#1677ff}.primary svg{width:14px}.stats{margin-bottom:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.stats article,.card{border:1px solid #e6ebf2;border-radius:8px;background:#fff}.stats article{padding:15px;display:flex;align-items:center;gap:12px}.stats article>span{width:40px;height:40px;display:grid;place-items:center;border-radius:9px}.stats svg{width:19px}.stats article div{display:grid}.stats small{color:#8290a3;font-size:10px}.stats strong{font-size:21px}.blue{color:#1677ff;background:#eaf3ff}.green{color:#16a67a;background:#e8f8f2}.orange{color:#e58c12;background:#fff4df}.purple{color:#8b5cf6;background:#f1edff}.card{padding:15px}.toolbar{margin-bottom:14px;display:flex;align-items:center;gap:9px}.toolbar label{width:260px;height:34px;padding:0 10px;display:flex;align-items:center;gap:7px;border:1px solid #dde4ed;border-radius:6px}.toolbar label svg{width:15px}.toolbar input{width:100%;border:0;background:transparent}.toolbar select,.toolbar>button{height:34px;padding:0 11px;border:1px solid #dde4ed;border-radius:6px;background:#fff;font-size:11px}.toolbar .query{color:#fff;border-color:#1677ff;background:#1677ff}.toolbar>span{margin-left:auto;color:#9ba6b5;font-size:10px}.table-wrap{overflow-x:auto;border:1px solid #e8edf3;border-radius:7px}table{width:100%;min-width:1000px;border-collapse:collapse}th,td{padding:12px 13px;text-align:left;border-bottom:1px solid #edf1f5;font-size:11px}th{color:#718096;background:#f7f9fc}.item-info{display:flex;align-items:center;gap:9px}.item-info>i{width:34px;height:34px;display:grid;place-items:center;color:#1677ff;border-radius:8px;background:#eaf3ff;font-style:normal}.item-info div{display:grid}.item-info small,.block{display:block;color:#9ba6b5;font-size:9px}code{padding:3px 6px;background:#f1f4f8}.status{display:flex;align-items:center;gap:5px;color:#169c73}.status i{width:6px;height:6px;border-radius:50%;background:#20bd87}.status.off{color:#8995a6}.status.off i{background:#a5aebb}.actions{white-space:nowrap}.actions button{margin-right:9px;color:#1677ff;border:0;background:transparent}.actions .danger{color:#e55358}.empty-state{padding:28px;text-align:center;color:#9aa5b4;font-size:12px}.card footer{padding-top:13px;display:flex;justify-content:space-between;color:#99a5b5;font-size:10px}.card footer div{display:flex;gap:5px}.card footer button{width:28px;height:28px;border:1px solid #e0e6ee;border-radius:5px;background:#fff}.card footer button:disabled{cursor:not-allowed;opacity:.45}.card footer .active{color:#fff;background:#1677ff}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}.form-grid :deep(.el-select),.form-grid :deep(.el-input-number){width:100%}.detail{min-height:180px}.detail h2{margin-bottom:4px}.detail>p{color:#98a4b6}.detail dl{display:grid;gap:12px}.detail dl div{display:grid;grid-template-columns:90px 1fr;padding-bottom:10px;border-bottom:1px solid #edf1f5}.detail dt{color:#98a4b6}.detail dd{margin:0}@media(max-width:1000px){.stats{grid-template-columns:repeat(2,1fr)}}@media(max-width:680px){.stats{grid-template-columns:1fr}.toolbar{flex-wrap:wrap}.toolbar label{width:100%}.toolbar>span{width:100%;margin:0}.form-grid{grid-template-columns:1fr}}
</style>
