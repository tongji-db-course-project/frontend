<template>
  <div class="dashboard">
    <section class="page-heading">
      <div>
        <p>数据中心 · 实时更新</p>
        <h1>经营概览</h1>
      </div>
      <div class="heading-actions">
        <button class="ghost-button" :disabled="loading || !daily.length" @click="exportReport"><Download />导出报表</button>
        <button v-if="canAccess('/sales/checkout')" class="primary-button" @click="router.push('/sales/checkout')"><Plus />新建销售单</button>
      </div>
    </section>

    <section class="filter-bar">
      <label>
        <span>门店</span>
        <select disabled><option>全部门店</option></select>
      </label>
      <label>
        <span>统计周期</span>
        <select v-model="period"><option :value="7">近 7 天</option><option :value="30">近 30 天</option><option :value="90">近 90 天</option></select>
      </label>
      <label class="date-field">
        <span>日期</span>
        <input v-model="endDate" type="date" />
      </label>
      <button class="query-button" :disabled="loading" @click="loadDashboard">{{ loading ? '查询中' : '查询' }}</button>
      <small><i />数据更新于 {{ updatedAt || '—' }}</small>
    </section>

    <div v-if="errorMessage" class="error-banner" role="alert">
      <div>
        <strong>数据加载失败</strong>
        <span>{{ errorMessage }}</span>
      </div>
      <button :disabled="loading" @click="loadDashboard">重新加载</button>
    </div>

    <section v-if="loading && !hasDashboardData" class="metric-grid" aria-label="经营指标加载中">
      <article v-for="n in 4" :key="n" class="metric-card skeleton-card">
        <el-skeleton animated>
          <template #template>
            <div class="metric-skeleton"><el-skeleton-item variant="circle" /><div><el-skeleton-item variant="text" /><el-skeleton-item variant="h3" /><el-skeleton-item variant="text" /></div></div>
          </template>
        </el-skeleton>
      </article>
    </section>
    <section v-else class="metric-grid" :class="{ 'is-refreshing': loading }" :aria-busy="loading">
      <article v-for="metric in metrics" :key="metric.label" class="metric-card">
        <div class="metric-icon" :style="{ color: metric.color, background: metric.bg }">
          <component :is="metric.icon" />
        </div>
        <div>
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small :class="{ down: metric.down }">{{ metric.trend }} <em>较上期</em></small>
        </div>
      </article>
    </section>

    <section v-if="loading && !hasDashboardData" class="dashboard-grid dashboard-skeleton" aria-label="图表加载中">
      <article v-for="n in 4" :key="n" class="card"><el-skeleton :rows="6" animated /></article>
    </section>
    <section v-else class="dashboard-grid" :class="{ 'is-refreshing': loading }" :aria-busy="loading">
      <article class="card trend-card">
        <header class="card-header">
          <div><h2>销售趋势</h2><p>最近 {{ trendData.length }} 个有记录日期的销售额与订单量</p></div>
        </header>
        <BaseChart v-if="trendData.length" :option="trendOption" height="232px" />
        <el-empty v-else description="当前周期暂无销售趋势数据" :image-size="72" />
      </article>

      <article class="card payment-card">
        <header class="card-header">
          <div><h2>经营构成</h2><p>本期销售、退款与净收入</p></div>
        </header>
        <div v-if="daily.length" class="donut-wrap">
          <div class="donut" :style="donutStyle"><div><strong>{{ formatMoney(totals.paid) }}</strong><span>实收总额</span></div></div>
          <ul>
            <li v-for="item in payments" :key="item.name">
              <span><i :style="{ background: item.color }" />{{ item.name }}</span>
              <strong>{{ item.percent }}</strong>
            </li>
          </ul>
        </div>
        <el-empty v-else description="当前周期暂无经营数据" :image-size="72" />
      </article>

      <article class="card ranking-card">
        <header class="card-header">
          <div><h2>热销商品</h2><p>按销售额排序</p></div>
          <button v-if="canAccess('/statistics/products')" class="link-button" @click="router.push('/statistics/products')">查看全部 →</button>
        </header>
        <div v-if="rankings.length" class="ranking-list">
          <div v-for="(item, index) in rankings" :key="item.name">
            <span class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
            <span class="product-thumb" :style="{ background: item.bg }">{{ item.short }}</span>
            <p><strong>{{ item.name }}</strong><small>{{ item.count }} 件</small></p>
            <b>{{ item.amount }}</b>
          </div>
        </div>
        <el-empty v-else description="暂无热销商品数据" :image-size="72" />
      </article>

      <article class="card inventory-card">
        <header class="card-header">
          <div><h2>库存预警</h2><p>需要及时处理的商品</p></div>
          <span class="warning-badge">{{ inventory.length }} 项待处理</span>
        </header>
        <div v-if="inventory.length" class="inventory-list">
          <div v-for="item in inventory" :key="item.name">
            <p><strong>{{ item.name }}</strong><small>安全库存 {{ item.safe }}</small></p>
            <div class="stock-bar"><i :style="{ width: item.width }" /></div>
            <b>余 {{ item.stock }}</b>
          </div>
        </div>
        <el-empty v-else description="当前没有库存预警" :image-size="72" />
        <button v-if="canAccess('/inventory')" class="full-button" @click="router.push('/inventory')">前往库存管理</button>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Coin, Download, Goods, Plus, ShoppingCart, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { statisticsApi } from '../../api/statistics'
import { inventoryApi } from '../../api/inventory'
import { formatMoney } from '../../utils/format'
import BaseChart from '../../components/charts/BaseChart.vue'
import { useAuthStore } from '../../stores/auth'
import type { DailySalesStatistics, InventoryStatistics, ProductRankItem } from '../../types/statistics'
import type { InventoryItem } from '../../types/inventory'

const router=useRouter(),loading=ref(false),updatedAt=ref(''),errorMessage=ref(''),period=ref(7),endDate=ref(new Date().toISOString().slice(0,10))
const authStore=useAuthStore()
const canAccess=(path:string)=>{
  const roleName=authStore.userInfo?.roleName||authStore.roleName
  const prefixes:Record<string,string[]>={采购员:['/dashboard','/product','/sales','/members'],收银员:['/dashboard','/product','/purchases','/inventory']}
  return !prefixes[roleName]||prefixes[roleName].some(prefix=>path===prefix||path.startsWith(`${prefix}/`))
}
const daily=ref<DailySalesStatistics[]>([]),rankData=ref<ProductRankItem[]>([]),warningItems=ref<InventoryItem[]>([]),inventoryStats=ref<InventoryStatistics|null>(null)
const dateParams=computed(()=>{const end=new Date(`${endDate.value}T00:00:00`);const start=new Date(end);start.setDate(start.getDate()-period.value+1);return{startDate:start.toISOString().slice(0,10),endDate:endDate.value}})
const totals=computed(()=>daily.value.reduce((sum,item)=>({amount:sum.amount+Number(item.totalAmount||0),paid:sum.paid+Number(item.paidAmount||0),refund:sum.refund+Number(item.refundAmount||0),net:sum.net+Number(item.netAmount||0),orders:sum.orders+Number(item.orderCount||0)}),{amount:0,paid:0,refund:0,net:0,orders:0}))
const hasDashboardData=computed(()=>daily.value.length>0||rankData.value.length>0||warningItems.value.length>0||inventoryStats.value!==null)
const metrics=computed(()=>[
  { label: '本期销售额', value: errorMessage.value?'—':formatMoney(totals.value.amount), trend: errorMessage.value?'数据暂不可用':`${period.value} 天累计`, icon: TrendCharts, color: '#1677ff', bg: '#eaf3ff' },
  { label: '本期订单', value: errorMessage.value?'—':totals.value.orders.toLocaleString('zh-CN'), trend: errorMessage.value?'数据暂不可用':`${daily.value.length} 天有记录`, icon: ShoppingCart, color: '#8b5cf6', bg: '#f1edff' },
  { label: '客单价', value: errorMessage.value?'—':formatMoney(totals.value.orders?totals.value.paid/totals.value.orders:0), trend: errorMessage.value?'数据暂不可用':'按实收计算', icon: Coin, color: '#f59e0b', bg: '#fff5df' },
  { label: '库存商品', value: errorMessage.value?'—':(inventoryStats.value?.productCount||0).toLocaleString('zh-CN'), trend: errorMessage.value?'数据暂不可用':`${inventoryStats.value?.warningProductCount||0} 项预警`, down: !errorMessage.value&&!!inventoryStats.value?.warningProductCount, icon: Goods, color: '#16a67a', bg: '#e8f8f2' },
])

const payments=computed(()=>{const base=Math.max(totals.value.amount,1);return[
  {name:'应收金额',percent:`${(totals.value.amount/base*100).toFixed(1)}%`,color:'#1677ff'},
  {name:'实收金额',percent:`${(totals.value.paid/base*100).toFixed(1)}%`,color:'#33c3d9'},
  {name:'退款金额',percent:`${(totals.value.refund/base*100).toFixed(1)}%`,color:'#f6b73c'},
  {name:'净收入',percent:`${(totals.value.net/base*100).toFixed(1)}%`,color:'#8b5cf6'}]})
const donutStyle=computed(()=>{const base=Math.max(totals.value.amount+totals.value.refund,1);const paid=Math.min(100,totals.value.paid/base*100);const refund=Math.min(100-paid,totals.value.refund/base*100);return{background:`conic-gradient(#33c3d9 0 ${paid}%, #f6b73c ${paid}% ${paid+refund}%, #e8edf4 ${paid+refund}% 100%)`}})

const rankings=computed(()=>rankData.value.slice(0,4).map((item,index)=>({name:item.productName,count:item.saleQuantity,amount:formatMoney(item.saleAmount),short:item.productName?.slice(0,1)||'商',bg:['#e9f3ff','#fff2dd','#edf7e8','#e7f8fb'][index]})))

const inventory=computed(()=>warningItems.value.slice(0,4).map(item=>({name:item.productName||`商品 #${item.productId}`,safe:item.stockWarning||0,stock:item.currentStock,width:`${Math.min(100,item.stockWarning?item.currentStock/item.stockWarning*100:0)}%`})))
const trendData=computed(()=>daily.value.slice(-7))
const trendOption=computed(()=>({
  tooltip:{trigger:'axis',valueFormatter:(value:number|string)=>String(value)},
  legend:{top:0,right:4,data:['销售额','订单量'],textStyle:{color:'#68778d',fontSize:12}},
  grid:{left:16,right:16,top:38,bottom:8,containLabel:true},
  xAxis:{type:'category',boundaryGap:false,data:trendData.value.map(item=>item.statDate.slice(5)),axisLine:{lineStyle:{color:'#dce3ec'}},axisTick:{show:false},axisLabel:{color:'#7f8da1',fontSize:11}},
  yAxis:[
    {type:'value',name:'金额（元）',nameTextStyle:{color:'#7f8da1'},axisLabel:{color:'#7f8da1',formatter:(value:number)=>value>=10000?`${value/10000}万`:value},splitLine:{lineStyle:{color:'#edf1f5',type:'dashed'}}},
    {type:'value',name:'订单（笔）',nameTextStyle:{color:'#7f8da1'},axisLabel:{color:'#7f8da1'},splitLine:{show:false}},
  ],
  series:[
    {name:'销售额',type:'line',smooth:true,showSymbol:true,symbolSize:6,data:trendData.value.map(item=>Number(item.netAmount||0)),lineStyle:{width:3,color:'#1677ff'},itemStyle:{color:'#1677ff'},areaStyle:{color:'rgba(22,119,255,.12)'},tooltip:{valueFormatter:(value:number)=>formatMoney(value)}},
    {name:'订单量',type:'line',yAxisIndex:1,smooth:true,showSymbol:true,symbolSize:5,data:trendData.value.map(item=>Number(item.orderCount||0)),lineStyle:{width:2,color:'#33c3d9',type:'dashed'},itemStyle:{color:'#33c3d9'},tooltip:{valueFormatter:(value:number)=>`${value} 笔`}},
  ],
}))
async function loadDashboard(){loading.value=true;errorMessage.value='';try{const params=dateParams.value;const [sales,ranks,stats,warnings]=await Promise.all([statisticsApi.getDailySales(params),statisticsApi.getProductRanking(params),statisticsApi.getInventory(),inventoryApi.getWarningList({page:1,size:10,warningOnly:true})]);daily.value=(sales||[]).sort((a,b)=>a.statDate.localeCompare(b.statDate));rankData.value=ranks||[];inventoryStats.value=stats;warningItems.value=warnings?.list||[];updatedAt.value=new Date().toLocaleTimeString('zh-CN',{hour12:false})}catch(error:any){errorMessage.value=error?.response?.data?.message||error?.message||'暂时无法连接数据服务，请稍后重试';ElMessage.error('经营数据加载失败')}finally{loading.value=false}}
function exportReport(){const rows=['日期,订单数,销售额,实收,退款,净收入',...daily.value.map(item=>[item.statDate,item.orderCount,item.totalAmount,item.paidAmount,item.refundAmount,item.netAmount].join(','))];const blob=new Blob(['\ufeff'+rows.join('\n')],{type:'text/csv;charset=utf-8'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`经营概览-${dateParams.value.startDate}-${dateParams.value.endDate}.csv`;link.click();URL.revokeObjectURL(link.href);ElMessage.success('报表已导出')}
onMounted(loadDashboard)
</script>

<style scoped>
.dashboard { color: var(--text-primary); }

.error-banner {
  margin-bottom: 12px;
  padding: 11px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #b4232a;
  border: 1px solid #f2c7ca;
  border-radius: var(--radius-md);
  background: #fff5f5;
}

.error-banner > div { display: grid; gap: 2px; }
.error-banner strong { font-size: 13px; }
.error-banner span { color: #8f5054; font-size: 12px; }
.error-banner button { padding: 6px 11px; color: #b4232a; border: 1px solid #e5aeb2; border-radius: 6px; background: #fff; white-space: nowrap; }
.error-banner button:disabled { cursor: not-allowed; opacity: .55; }

.is-refreshing { opacity: .58; pointer-events: none; transition: opacity .18s ease; }
.skeleton-card { min-height: 74px; }
.metric-skeleton { display: flex; align-items: center; gap: 13px; }
.metric-skeleton > .el-skeleton__item { width: 42px; height: 42px; flex: 0 0 42px; }
.metric-skeleton > div { width: 100%; display: grid; gap: 7px; }
.metric-skeleton > div .el-skeleton__item:nth-child(1) { width: 45%; }
.metric-skeleton > div .el-skeleton__item:nth-child(2) { width: 72%; height: 20px; }
.metric-skeleton > div .el-skeleton__item:nth-child(3) { width: 55%; }
.dashboard-skeleton .card { min-height: 284px; }
.card :deep(.el-empty) { min-height: 232px; padding: 18px 0; }
.card :deep(.el-empty__description) { margin-top: 8px; }
.card :deep(.el-empty__description p) { color: #7f8da1; font-size: 12px; }

.page-heading {
  margin: 3px 2px 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.page-heading p,
.card-header p { margin: 0; color: #7c899c; font-size: 13px; }
.page-heading h1 { margin: 3px 0 0; color: #1e2d43; font-size: 24px; line-height: 1.25; }
.heading-actions { display: flex; gap: 8px; }

.heading-actions button,
.query-button,
.full-button {
  height: 36px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid #dfe6ef;
  border-radius: 7px;
  font-size: 13px;
  background: #fff;
}

.heading-actions svg { width: 14px; }
.heading-actions .primary-button { color: #fff; border-color: var(--color-primary); background: var(--color-primary); box-shadow: 0 5px 12px rgba(22,119,255,.18); }
.heading-actions button:disabled { cursor: not-allowed; color: #a0a9b6; border-color: #e3e8ef; background: #f4f6f8; box-shadow: none; }

.filter-bar {
  min-height: 56px;
  padding: 10px 14px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-card);
  box-shadow: var(--shadow-card);
}

.filter-bar label { display: grid; gap: 4px; }
.filter-bar label > span { color: #68778d; font-size: 12px; }
.filter-bar select, .filter-bar input { width: 150px; height: 32px; padding: 0 9px; color: #45536a; border: 1px solid #d9e0e9; border-radius: 5px; outline: none; background: #fbfcfe; font-size: 13px; }
.filter-bar .date-field input { width: 140px; }
.query-button { height: 30px; color: #fff; border-color: var(--color-primary); background: var(--color-primary); }
.filter-bar > small { margin: auto 0 6px auto; display: flex; align-items: center; gap: 6px; color: #7f8da1; font-size: 12px; }
.filter-bar > small i { width: 6px; height: 6px; border-radius: 50%; background: #24bd87; }

.metric-grid {
  margin: 12px 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  min-width: 0;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 13px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-card);
  box-shadow: var(--shadow-card);
}

.metric-icon { flex: 0 0 42px; height: 42px; display: grid; place-items: center; border-radius: 10px; }
.metric-icon svg { width: 21px; }
.metric-card > div:last-child { min-width: 0; display: grid; }
.metric-card span { color: #68778d; font-size: 13px; }
.metric-card strong { margin: 2px 0; color: #24344a; font-size: 23px; line-height: 1.3; white-space: nowrap; }
.metric-card small { color: #148662; font-size: 12px; }
.metric-card small.down { color: #e95c61; }
.metric-card small em { margin-left: 4px; color: #7f8da1; font-style: normal; }

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(280px, .85fr);
  gap: 12px;
}

.card { min-width: 0; padding: 15px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--surface-card); box-shadow: var(--shadow-card); }
.card-header { margin-bottom: 12px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.card-header h2 { margin: 0 0 3px; color: #26364c; font-size: 16px; }
.legend { display: flex; gap: 14px; color: #68778d; font-size: 12px; }
.legend span { display: flex; align-items: center; gap: 5px; }
.legend i, .payments i { width: 7px; height: 7px; border-radius: 50%; }
.legend .blue { background: #1677ff; }
.legend .cyan { background: #33c3d9; }
.more-button, .link-button { padding: 2px 0; color: #68778d; border: 0; background: transparent; font-size: 12px; }
.link-button { color: var(--color-primary); }

.line-chart { height: 232px; display: flex; }
.y-axis { width: 38px; padding: 1px 0 20px; display: flex; flex-direction: column; justify-content: space-between; color: #7f8da1; font-size: 11px; }
.plot { position: relative; flex: 1; padding-bottom: 18px; }
.grid-line { height: 25%; border-top: 1px dashed #e9edf3; }
.plot svg { position: absolute; inset: 0 0 18px; width: 100%; height: calc(100% - 18px); overflow: visible; }
.x-axis { position: absolute; inset: auto 0 0; display: flex; justify-content: space-between; color: #7f8da1; font-size: 11px; }

.donut-wrap { display: flex; align-items: center; justify-content: center; gap: 22px; min-height: 232px; }
.donut { width: 128px; height: 128px; display: grid; place-items: center; border-radius: 50%; background: conic-gradient(#1677ff 0 42%, #33c3d9 42% 73%, #8b5cf6 73% 91%, #f6b73c 91%); }
.donut::before { content: ''; width: 78px; height: 78px; border-radius: 50%; background: #fff; }
.donut > div { position: absolute; display: grid; text-align: center; }
.donut strong { color: #26364c; font-size: 14px; }
.donut span { color: #7f8da1; font-size: 11px; }
.donut-wrap ul { width: 110px; margin: 0; padding: 0; display: grid; gap: 12px; list-style: none; }
.donut-wrap li { display: flex; justify-content: space-between; color: #5e6e84; font-size: 12px; }
.donut-wrap li span { display: flex; align-items: center; gap: 6px; }
.donut-wrap li strong { color: #35445a; }

.ranking-list, .inventory-list { display: grid; }
.ranking-list > div { padding: 10px 2px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #edf0f4; }
.ranking-list > div:last-child { border-bottom: 0; }
.rank { width: 21px; height: 21px; display: grid; place-items: center; color: #68778d; font-size: 12px; border-radius: 5px; background: #f0f3f7; }
.rank.top { color: #fff; background: #1677ff; }
.product-thumb { width: 36px; height: 36px; display: grid; place-items: center; color: #53657d; font-size: 13px; border-radius: 7px; }
.ranking-list p, .inventory-list p { margin: 0; flex: 1; display: grid; }
.ranking-list p strong, .inventory-list p strong { color: #37465a; font-size: 13px; }
.ranking-list p small, .inventory-list p small { color: #7f8da1; font-size: 11px; }
.ranking-list b { color: #34445a; font-size: 13px; }

.warning-badge { padding: 4px 8px; color: #a95d08; border-radius: 4px; background: #fff4df; font-size: 11px; }
.inventory-list > div { padding: 11px 2px; display: grid; grid-template-columns: 1.3fr .8fr 40px; align-items: center; gap: 10px; border-bottom: 1px solid #edf0f4; }
.stock-bar { height: 5px; overflow: hidden; border-radius: 99px; background: #f0f2f6; }
.stock-bar i { display: block; height: 100%; border-radius: inherit; background: #ff7a6d; }
.inventory-list b { color: #d8444a; font-size: 12px; text-align: right; }
.full-button { width: 100%; height: 32px; margin-top: 9px; color: var(--color-primary); border-color: #dce9fb; background: #f5f9ff; }

@media (max-width: 1150px) {
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
}

@media (max-width: 680px) {
  .page-heading { align-items: flex-start; }
  .page-heading h1 { font-size: 22px; }
  .heading-actions .ghost-button { display: none; }
  .filter-bar { align-items: stretch; flex-wrap: wrap; }
  .filter-bar label { flex: 1 1 130px; }
  .filter-bar select, .filter-bar input, .filter-bar .date-field input { width: 100%; }
  .filter-bar .query-button { min-width: 90px; height: 36px; align-self: flex-end; }
  .filter-bar > small { flex-basis: 100%; margin: 2px 0; }
  .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .metric-card { padding: 13px; align-items: flex-start; flex-direction: column; }
  .metric-card strong { font-size: 21px; }
  .donut-wrap { flex-direction: column; }
  .error-banner { align-items: flex-start; }
}

@media (max-width: 420px) {
  .page-heading { gap: 10px; }
  .heading-actions .primary-button { height: 34px; padding: 0 10px; }
  .filter-bar label { flex-basis: 100%; }
  .filter-bar .query-button { width: 100%; }
  .metric-grid { grid-template-columns: 1fr; }
  .metric-card { align-items: center; flex-direction: row; }
  .error-banner { flex-direction: column; }
  .error-banner button { width: 100%; }
}
</style>
