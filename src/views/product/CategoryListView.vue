<template>
  <div class="category-page">
    <header class="page-head"><div><p>基础资料 · 分类维护</p><h1>商品分类</h1></div><button class="primary" @click="openForm()"><Plus />新增分类</button></header>
    <section class="category-grid">
      <article v-for="item in filtered" :key="item.categoryId" :class="{disabled:item.status==='停用'}">
        <header><span :style="{background:item.color}"><component :is="item.icon" /></span><div class="actions"><button @click="openForm(item)"><Edit /></button><button @click="toggle(item)"><Switch /></button></div></header>
        <h2>{{ item.categoryName }}</h2><p>{{ item.categoryDesc }}</p>
        <footer><span>{{ item.productCount }} 件商品</span><b :class="{off:item.status==='停用'}">{{ item.status }}</b></footer>
      </article>
      <button class="add-card" @click="openForm()"><Plus /><strong>新建商品分类</strong><span>创建新的商品归类</span></button>
    </section>
    <section class="list-card"><div class="toolbar"><label><Search /><input v-model="keyword" placeholder="搜索分类名称" /></label><select v-model="status"><option value="">全部状态</option><option>正常</option><option>停用</option></select><span>共 {{ filtered.length }} 个分类</span></div>
      <table><thead><tr><th>分类名称</th><th>分类说明</th><th>商品数量</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="item in filtered" :key="item.categoryId"><td><b>{{ item.categoryName }}</b></td><td>{{ item.categoryDesc }}</td><td>{{ item.productCount }}</td><td>{{ item.status }}</td><td><button @click="openForm(item)">编辑</button><button @click="toggle(item)">{{ item.status==='正常'?'停用':'启用' }}</button></td></tr></tbody></table>
    </section>
    <el-dialog v-model="visible" :title="editingId?'编辑分类':'新增分类'" width="480px"><el-form label-position="top"><el-form-item label="分类名称" required><el-input v-model="form.categoryName" /></el-form-item><el-form-item label="分类说明"><el-input v-model="form.categoryDesc" type="textarea" :rows="3" /></el-form-item><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio value="正常">正常</el-radio><el-radio value="停用">停用</el-radio></el-radio-group></el-form-item></el-form><template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="save">保存分类</el-button></template></el-dialog>
  </div>
</template>
<script setup>
import { computed, markRaw, reactive, ref } from 'vue'
import { ColdDrink, Edit, Food, Goods, Plus, Search, ShoppingBag, Switch, Van } from '@element-plus/icons-vue'
const categories=ref([
 {categoryId:1,categoryName:'饮料酒水',categoryDesc:'饮料、矿泉水、酒类商品',status:'正常',productCount:386,color:'#e8f4ff',icon:markRaw(ColdDrink)},
 {categoryId:2,categoryName:'休闲零食',categoryDesc:'坚果、膨化、糖果与饼干',status:'正常',productCount:528,color:'#fff3df',icon:markRaw(Food)},
 {categoryId:3,categoryName:'粮油调味',categoryDesc:'米面粮油与厨房调味品',status:'正常',productCount:214,color:'#ebf8ed',icon:markRaw(Goods)},
 {categoryId:4,categoryName:'日用百货',categoryDesc:'家庭清洁和生活日用品',status:'正常',productCount:467,color:'#f1edff',icon:markRaw(ShoppingBag)},
 {categoryId:5,categoryName:'乳品烘焙',categoryDesc:'乳制品、面包与烘焙食品',status:'停用',productCount:192,color:'#e9f8fb',icon:markRaw(Van)},
])
const keyword=ref(''),status=ref(''),visible=ref(false),editingId=ref(null),form=reactive({categoryName:'',categoryDesc:'',status:'正常'})
const filtered=computed(()=>categories.value.filter(x=>(!keyword.value||x.categoryName.includes(keyword.value))&&(!status.value||x.status===status.value)))
function openForm(item=null){editingId.value=item?.categoryId||null;Object.assign(form,item?{categoryName:item.categoryName,categoryDesc:item.categoryDesc,status:item.status}:{categoryName:'',categoryDesc:'',status:'正常'});visible.value=true}
function toggle(item){item.status=item.status==='正常'?'停用':'正常'}
function save(){if(!form.categoryName)return;if(editingId.value)Object.assign(categories.value.find(x=>x.categoryId===editingId.value),form);else categories.value.push({categoryId:Date.now(),...form,productCount:0,color:'#e8f4ff',icon:markRaw(Goods)});visible.value=false}
</script>
<style scoped>
.category-page{color:#29384f}.page-head{margin:3px 2px 14px;display:flex;align-items:flex-end;justify-content:space-between}.page-head p{margin:0;color:#98a4b6;font-size:12px}.page-head h1{margin:3px 0 0;font-size:24px}.primary{height:36px;padding:0 14px;display:flex;align-items:center;gap:7px;color:#fff;border:0;border-radius:7px;background:#1677ff}.primary svg{width:14px}.category-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.category-grid article,.add-card,.list-card{border:1px solid #e6ebf2;border-radius:8px;background:#fff}.category-grid article{padding:16px}.category-grid article.disabled{opacity:.65}.category-grid article header{display:flex;justify-content:space-between}.category-grid article header>span{width:42px;height:42px;display:grid;place-items:center;color:#1677ff;border-radius:10px}.category-grid svg{width:19px}.actions button{margin-left:5px;width:28px;height:28px;color:#7e8b9f;border:0;border-radius:5px;background:#f5f7fa}.category-grid h2{margin:13px 0 4px;font-size:15px}.category-grid p{min-height:34px;margin:0;color:#8b97a8;font-size:11px}.category-grid footer{margin-top:13px;padding-top:11px;display:flex;justify-content:space-between;border-top:1px solid #edf1f5;color:#718096;font-size:10px}.category-grid footer b{color:#169c73}.category-grid footer b.off{color:#9aa5b4}.add-card{min-height:165px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#8090a5;border-style:dashed}.add-card svg{color:#1677ff}.add-card strong{margin:7px 0 3px;color:#34445b}.add-card span{font-size:10px}.list-card{margin-top:12px;padding:15px;overflow-x:auto}.toolbar{margin-bottom:12px;display:flex;gap:9px;align-items:center}.toolbar label{width:260px;height:34px;padding:0 10px;display:flex;align-items:center;gap:7px;border:1px solid #dde4ed;border-radius:6px}.toolbar svg{width:15px}.toolbar input{width:100%;border:0}.toolbar select{height:34px;border:1px solid #dde4ed;border-radius:6px}.toolbar>span{margin-left:auto;color:#9ba6b5;font-size:10px}table{width:100%;min-width:720px;border-collapse:collapse}th,td{padding:11px;border-bottom:1px solid #edf1f5;text-align:left;font-size:11px}th{color:#718096;background:#f7f9fc}td button{margin-right:10px;color:#1677ff;border:0;background:transparent}@media(max-width:1000px){.category-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:680px){.category-grid{grid-template-columns:1fr}.toolbar{flex-wrap:wrap}.toolbar label{width:100%}.toolbar>span{width:100%;margin:0}}
</style>
