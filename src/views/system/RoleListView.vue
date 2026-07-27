<template>
  <div class="role-page">
    <section class="page-heading">
      <div><p>系统管理 · 权限配置</p><h1>角色管理</h1></div>
      <button class="primary" @click="openForm()"><Plus />新增角色</button>
    </section>

    <section class="summary-grid">
      <article v-for="item in summaries" :key="item.label">
        <span :class="item.tone"><component :is="item.icon" /></span>
        <div><small>{{ item.label }}</small><strong>{{ item.value }}</strong></div>
      </article>
    </section>

    <section class="content-card">
      <div class="toolbar">
        <label><Search /><input v-model="keyword" placeholder="搜索角色名称或编码" /></label>
        <select v-model="statusFilter"><option value="">全部状态</option><option>启用</option><option>停用</option></select>
        <button class="query">查询</button>
        <button @click="keyword='';statusFilter=''">重置</button>
        <span>共 {{ filteredRoles.length }} 个角色</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead><tr><th>角色信息</th><th>角色编码</th><th>成员数量</th><th>权限范围</th><th>创建时间</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="role in filteredRoles" :key="role.id">
              <td>
                <div class="role-info">
                  <i :class="role.tone"><component :is="role.icon" /></i>
                  <div><strong>{{ role.name }}</strong><small>{{ role.description }}</small></div>
                </div>
              </td>
              <td><code>{{ role.code }}</code></td>
              <td>{{ role.members }} 人</td>
              <td>
                <em v-for="p in role.permissions.slice(0,2)" :key="p">{{ p }}</em>
                <em v-if="role.permissions.length > 2" class="more">+{{ role.permissions.length-2 }}</em>
              </td>
              <td>{{ role.createdAt }}</td>
              <td>
                <button class="switch" :class="{ on: role.status==='启用' }" @click="toggle(role)">
                  <i /><span>{{ role.status }}</span>
                </button>
              </td>
              <td class="actions">
                <button @click="showDetail(role)">详情</button>
                <button @click="openForm(role)">编辑</button>
                <button @click="openPermission(role)">权限</button>
                <el-popconfirm v-if="!role.system" title="确认删除该角色吗？" @confirm="remove(role.id)">
                  <template #reference><button class="danger">删除</button></template>
                </el-popconfirm>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer><span>显示 1–{{ filteredRoles.length }} 条</span><div><button disabled>‹</button><button class="active">1</button><button>›</button></div></footer>
    </section>

    <el-dialog v-model="formVisible" :title="editingId ? '编辑角色' : '新增角色'" width="520px">
      <el-form label-position="top">
        <div class="form-grid">
          <el-form-item label="角色名称" required><el-input v-model="form.name" placeholder="例如：门店管理员" /></el-form-item>
          <el-form-item label="角色编码" required><el-input v-model="form.code" placeholder="例如：STORE_ADMIN" :disabled="!!editingId" /></el-form-item>
        </div>
        <el-form-item label="角色说明"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="角色状态"><el-radio-group v-model="form.status"><el-radio value="启用">启用</el-radio><el-radio value="停用">停用</el-radio></el-radio-group></el-form-item>
        <p class="tip"><InfoFilled />角色保存后，可在列表中为其分配菜单权限。</p>
      </el-form>
      <template #footer><el-button @click="formVisible=false">取消</el-button><el-button type="primary" @click="saveRole">保存角色</el-button></template>
    </el-dialog>

    <el-drawer v-model="permissionVisible" size="480px">
      <template #header>
        <div class="drawer-title"><span><Key /></span><div><strong>分配菜单权限</strong><small>{{ selected?.name }} · {{ selected?.code }}</small></div></div>
      </template>
      <div class="permission-head"><b>可访问菜单</b><div><button @click="checkAll">全选</button><button @click="clearTree">清空</button></div></div>
      <el-tree ref="treeRef" :data="menuTree" show-checkbox node-key="id" default-expand-all @check="syncChecked" />
      <p class="warning"><Warning />权限变更将在该角色下属用户下次登录后生效。</p>
      <template #footer><el-button @click="permissionVisible=false">取消</el-button><el-button type="primary" @click="savePermission">保存权限</el-button></template>
    </el-drawer>

    <el-dialog v-model="detailVisible" title="角色详情" width="500px">
      <div v-if="selected" class="detail">
        <header><i :class="selected.tone"><component :is="selected.icon" /></i><div><h3>{{ selected.name }}</h3><code>{{ selected.code }}</code></div><b>{{ selected.status }}</b></header>
        <dl><div><dt>角色说明</dt><dd>{{ selected.description }}</dd></div><div><dt>成员数量</dt><dd>{{ selected.members }} 人</dd></div><div><dt>创建时间</dt><dd>{{ selected.createdAt }}</dd></div><div><dt>菜单权限</dt><dd>{{ selected.permissions.join('、') }}</dd></div></dl>
      </div>
      <template #footer><el-button type="primary" @click="detailVisible=false">知道了</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, markRaw, reactive, ref, nextTick } from 'vue'
import { Avatar, CircleCheckFilled, InfoFilled, Key, Lock, Plus, Search, Setting, Shop, UserFilled, Warning } from '@element-plus/icons-vue'

const roles = ref([
  { id:1,name:'超级管理员',code:'SUPER_ADMIN',description:'拥有系统全部功能及数据权限',members:2,permissions:['全部菜单'],createdAt:'2026-01-01',status:'启用',system:true,tone:'blue',icon:markRaw(Lock),menuIds:[1,11,2,21,22,23,3,31,32,4,41,42,5,51,52,53,6,61,62] },
  { id:2,name:'门店管理员',code:'STORE_ADMIN',description:'负责门店日常经营与人员管理',members:5,permissions:['经营概览','商品管理','销售管理','库存管理'],createdAt:'2026-03-18',status:'启用',tone:'purple',icon:markRaw(Shop),menuIds:[1,11,2,21,22,3,31,32,4,41,42] },
  { id:3,name:'收银员',code:'CASHIER',description:'负责 POS 收银、会员识别和退货',members:8,permissions:['POS 收银','销售订单','会员查询'],createdAt:'2026-04-08',status:'启用',tone:'green',icon:markRaw(UserFilled),menuIds:[3,31,32,5,51] },
  { id:4,name:'仓库管理员',code:'WAREHOUSE_KEEPER',description:'负责采购入库、库存盘点和预警处理',members:3,permissions:['采购管理','库存管理'],createdAt:'2026-05-12',status:'启用',tone:'orange',icon:markRaw(Setting),menuIds:[2,21,22,23,4,41,42] },
  { id:5,name:'数据观察员',code:'DATA_VIEWER',description:'仅可查看经营分析数据',members:0,permissions:['经营概览','数据中心'],createdAt:'2026-06-20',status:'停用',tone:'gray',icon:markRaw(Avatar),menuIds:[1,11,6,61,62] },
])
const keyword=ref(''), statusFilter=ref(''), formVisible=ref(false), permissionVisible=ref(false), detailVisible=ref(false)
const editingId=ref(null), selected=ref(null), treeRef=ref(), checkedMenus=ref([])
const form=reactive({name:'',code:'',description:'',status:'启用'})
const menuTree=[
  {id:1,label:'经营概览',children:[{id:11,label:'查看经营数据'}]},
  {id:2,label:'基础资料',children:[{id:21,label:'商品管理'},{id:22,label:'商品分类'},{id:23,label:'供应商管理'}]},
  {id:3,label:'销售管理',children:[{id:31,label:'POS 收银'},{id:32,label:'销售订单'}]},
  {id:4,label:'库存管理',children:[{id:41,label:'当前库存'},{id:42,label:'库存流水'}]},
  {id:5,label:'会员管理',children:[{id:51,label:'查看会员'},{id:52,label:'编辑会员'},{id:53,label:'会员消费记录'}]},
  {id:6,label:'系统管理',children:[{id:61,label:'角色管理'},{id:62,label:'菜单管理'}]},
]
const summaries=computed(()=>[
  {label:'角色总数',value:roles.value.length,icon:UserFilled,tone:'blue'},
  {label:'启用角色',value:roles.value.filter(r=>r.status==='启用').length,icon:CircleCheckFilled,tone:'green'},
  {label:'已分配用户',value:18,icon:Avatar,tone:'purple'},
  {label:'菜单权限',value:32,icon:Key,tone:'orange'},
])
const filteredRoles=computed(()=>roles.value.filter(r=>{
  const q=keyword.value.toLowerCase()
  return (!q||r.name.toLowerCase().includes(q)||r.code.toLowerCase().includes(q))&&(!statusFilter.value||r.status===statusFilter.value)
}))
function openForm(role=null){
  editingId.value=role?.id||null
  Object.assign(form,role?{name:role.name,code:role.code,description:role.description,status:role.status}:{name:'',code:'',description:'',status:'启用'})
  formVisible.value=true
}
function saveRole(){
  if(!form.name||!form.code)return
  if(editingId.value)Object.assign(roles.value.find(r=>r.id===editingId.value),form)
  else roles.value.push({id:Date.now(),...form,members:0,permissions:['待配置'],createdAt:'2026-07-27',tone:'blue',icon:markRaw(UserFilled),menuIds:[]})
  formVisible.value=false
}
function showDetail(role){selected.value=role;detailVisible.value=true}
function toggle(role){if(!role.system)role.status=role.status==='启用'?'停用':'启用'}
function remove(id){roles.value=roles.value.filter(r=>r.id!==id)}
async function openPermission(role){selected.value=role;checkedMenus.value=[...role.menuIds];permissionVisible.value=true;await nextTick();treeRef.value?.setCheckedKeys(checkedMenus.value)}
function syncChecked(){checkedMenus.value=treeRef.value?.getCheckedKeys()||[]}
function clearTree(){checkedMenus.value=[];treeRef.value?.setCheckedKeys([])}
function checkAll(){const ids=menuTree.flatMap(i=>[i.id,...i.children.map(c=>c.id)]);checkedMenus.value=ids;treeRef.value?.setCheckedKeys(ids)}
function savePermission(){if(selected.value)selected.value.menuIds=[...checkedMenus.value];permissionVisible.value=false}
</script>

<style scoped>
.role-page{color:#29384f}.page-heading{margin:3px 2px 14px;display:flex;align-items:flex-end;justify-content:space-between}.page-heading p{margin:0;color:#98a4b6;font-size:12px}.page-heading h1{margin:3px 0 0;color:#1e2d43;font-size:24px}.primary{height:36px;padding:0 14px;display:flex;align-items:center;gap:7px;color:#fff;border:0;border-radius:7px;background:#1677ff}.primary svg{width:14px}.summary-grid{margin-bottom:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.summary-grid article,.content-card{border:1px solid #e6ebf2;border-radius:8px;background:#fff}.summary-grid article{padding:15px;display:flex;align-items:center;gap:12px}.summary-grid article>span,.role-info>i,.detail header>i{width:40px;height:40px;display:grid;place-items:center;border-radius:9px}.summary-grid svg,.role-info svg,.detail svg{width:18px}.summary-grid article>div{display:grid}.summary-grid small{color:#8290a3;font-size:10px}.summary-grid strong{font-size:21px}.blue{color:#1677ff;background:#eaf3ff}.green{color:#16a67a;background:#e8f8f2}.purple{color:#8b5cf6;background:#f1edff}.orange{color:#e58c12;background:#fff4df}.gray{color:#758298;background:#eef1f5}.content-card{padding:15px}.toolbar{margin-bottom:14px;display:flex;align-items:center;gap:9px}.toolbar label{width:260px;height:34px;padding:0 10px;display:flex;align-items:center;gap:7px;border:1px solid #dde4ed;border-radius:6px;background:#fbfcfe}.toolbar svg{width:15px;color:#91a0b4}.toolbar input{width:100%;border:0;background:transparent;font-size:11px}.toolbar select,.toolbar>button{height:34px;padding:0 11px;color:#56657b;border:1px solid #dde4ed;border-radius:6px;background:#fff;font-size:11px}.toolbar .query{color:#fff;border-color:#1677ff;background:#1677ff}.toolbar>span{margin-left:auto;color:#9ba6b5;font-size:10px}.table-wrap{overflow-x:auto;border:1px solid #e8edf3;border-radius:7px}table{width:100%;min-width:980px;border-collapse:collapse}th,td{padding:12px 13px;text-align:left;border-bottom:1px solid #edf1f5;font-size:11px}th{color:#718096;background:#f7f9fc}tbody tr:hover{background:#fafcff}.role-info{min-width:220px;display:flex;align-items:center;gap:9px}.role-info>i{width:34px;height:34px}.role-info div{display:grid}.role-info strong{font-size:11px}.role-info small{color:#a1abb9;font-size:9px}code{padding:3px 6px;color:#586981;border-radius:4px;background:#f1f4f8;font-size:10px}.role-page td em{margin-right:4px;padding:3px 6px;display:inline-block;color:#346eb7;border-radius:4px;background:#edf5ff;font-size:9px;font-style:normal}.role-page td em.more{color:#78869a;background:#f0f2f5}.switch{padding:0;display:flex;align-items:center;gap:5px;color:#9aa5b4;border:0;background:transparent;font-size:10px}.switch>i{width:25px;height:14px;position:relative;border-radius:99px;background:#d5dbe3}.switch>i:after{content:'';position:absolute;top:2px;left:2px;width:10px;height:10px;border-radius:50%;background:#fff}.switch.on{color:#169c73}.switch.on>i{background:#20bd87}.switch.on>i:after{left:13px}.actions{white-space:nowrap}.actions button{margin-right:9px;padding:0;color:#1677ff;border:0;background:transparent;font-size:10px}.actions .danger{color:#e55358}.content-card footer{padding-top:13px;display:flex;justify-content:space-between;color:#99a5b5;font-size:10px}.content-card footer div{display:flex;gap:5px}.content-card footer button{width:28px;height:28px;border:1px solid #e0e6ee;border-radius:5px;background:#fff}.content-card footer .active{color:#fff;border-color:#1677ff;background:#1677ff}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.tip,.warning{padding:10px;display:flex;align-items:center;gap:7px;color:#64758c;border-radius:6px;background:#f3f7fc;font-size:11px}.tip svg,.warning svg{width:15px;color:#1677ff}.drawer-title{display:flex;align-items:center;gap:10px}.drawer-title>span{width:36px;height:36px;display:grid;place-items:center;color:#1677ff;border-radius:8px;background:#eaf3ff}.drawer-title svg{width:17px}.drawer-title div{display:grid}.drawer-title small{color:#96a2b3;font-size:10px}.permission-head{margin-bottom:10px;display:flex;justify-content:space-between;font-size:12px}.permission-head button{margin-left:8px;color:#1677ff;border:0;background:transparent}.warning{margin-top:14px;color:#9a6a22;background:#fff8e9}.detail header{padding-bottom:16px;display:flex;align-items:center;gap:11px;border-bottom:1px solid #edf0f4}.detail header div{flex:1}.detail h3{margin:0 0 5px}.detail header>b{color:#159b72}.detail dl{display:grid;gap:13px}.detail dl div{display:grid;grid-template-columns:80px 1fr;font-size:11px}.detail dt{color:#929eaf}.detail dd{margin:0}@media(max-width:1000px){.summary-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:680px){.summary-grid{grid-template-columns:1fr}.toolbar{flex-wrap:wrap}.toolbar label{width:100%}.toolbar>span{width:100%;margin:0}.form-grid{grid-template-columns:1fr}}
</style>
