<template>
  <div class="dashboard">
    <section class="page-heading">
      <div>
        <p>数据中心 · 实时更新</p>
        <h1>经营概览</h1>
      </div>
      <div class="heading-actions">
        <button class="ghost-button"><Download />导出报表</button>
        <button class="primary-button"><Plus />新建销售单</button>
      </div>
    </section>

    <section class="filter-bar">
      <label>
        <span>门店</span>
        <select><option>全部门店</option><option>城东旗舰店</option></select>
      </label>
      <label>
        <span>统计周期</span>
        <select><option>近 30 天</option><option>本周</option><option>本季度</option></select>
      </label>
      <label class="date-field">
        <span>日期</span>
        <input type="date" value="2026-07-27" />
      </label>
      <button class="query-button">查询</button>
      <small><i />数据更新于 10:32:18</small>
    </section>

    <section class="metric-grid">
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

    <section class="dashboard-grid">
      <article class="card trend-card">
        <header class="card-header">
          <div><h2>销售趋势</h2><p>近 7 日销售额与订单量</p></div>
          <div class="legend"><span><i class="blue" />销售额</span><span><i class="cyan" />订单量</span></div>
        </header>
        <div class="line-chart">
          <div class="y-axis"><span>40k</span><span>30k</span><span>20k</span><span>10k</span><span>0</span></div>
          <div class="plot">
            <div v-for="n in 5" :key="n" class="grid-line" />
            <svg viewBox="0 0 700 210" preserveAspectRatio="none" aria-label="销售趋势折线图">
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#1677ff" stop-opacity=".22" />
                  <stop offset="100%" stop-color="#1677ff" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 166 L115 128 L232 148 L350 76 L466 101 L582 45 L700 66 L700 210 L0 210 Z" fill="url(#areaFill)" />
              <polyline points="0,166 115,128 232,148 350,76 466,101 582,45 700,66" fill="none" stroke="#1677ff" stroke-width="4" />
              <polyline points="0,184 115,166 232,172 350,145 466,155 582,124 700,134" fill="none" stroke="#33c3d9" stroke-width="3" stroke-dasharray="7 6" />
            </svg>
            <div class="x-axis"><span>07/21</span><span>07/22</span><span>07/23</span><span>07/24</span><span>07/25</span><span>07/26</span><span>今日</span></div>
          </div>
        </div>
      </article>

      <article class="card payment-card">
        <header class="card-header">
          <div><h2>支付方式</h2><p>本期实收构成</p></div>
          <button class="more-button">•••</button>
        </header>
        <div class="donut-wrap">
          <div class="donut"><div><strong>¥ 82.6k</strong><span>实收总额</span></div></div>
          <ul>
            <li v-for="item in payments" :key="item.name">
              <span><i :style="{ background: item.color }" />{{ item.name }}</span>
              <strong>{{ item.percent }}</strong>
            </li>
          </ul>
        </div>
      </article>

      <article class="card ranking-card">
        <header class="card-header">
          <div><h2>热销商品</h2><p>按销售额排序</p></div>
          <button class="link-button">查看全部 →</button>
        </header>
        <div class="ranking-list">
          <div v-for="(item, index) in rankings" :key="item.name">
            <span class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
            <span class="product-thumb" :style="{ background: item.bg }">{{ item.short }}</span>
            <p><strong>{{ item.name }}</strong><small>{{ item.count }} 件</small></p>
            <b>{{ item.amount }}</b>
          </div>
        </div>
      </article>

      <article class="card inventory-card">
        <header class="card-header">
          <div><h2>库存预警</h2><p>需要及时处理的商品</p></div>
          <span class="warning-badge">12 项待处理</span>
        </header>
        <div class="inventory-list">
          <div v-for="item in inventory" :key="item.name">
            <p><strong>{{ item.name }}</strong><small>安全库存 {{ item.safe }}</small></p>
            <div class="stock-bar"><i :style="{ width: item.width }" /></div>
            <b>余 {{ item.stock }}</b>
          </div>
        </div>
        <button class="full-button">前往库存管理</button>
      </article>
    </section>
  </div>
</template>

<script setup>
import { Coin, Download, Goods, Plus, ShoppingCart, TrendCharts } from '@element-plus/icons-vue'

const metrics = [
  { label: '今日销售额', value: '¥ 28,642.50', trend: '↑ 12.5%', icon: TrendCharts, color: '#1677ff', bg: '#eaf3ff' },
  { label: '今日订单', value: '386', trend: '↑ 8.2%', icon: ShoppingCart, color: '#8b5cf6', bg: '#f1edff' },
  { label: '客单价', value: '¥ 74.20', trend: '↑ 3.8%', icon: Coin, color: '#f59e0b', bg: '#fff5df' },
  { label: '库存商品', value: '2,845', trend: '↓ 1.6%', down: true, icon: Goods, color: '#16a67a', bg: '#e8f8f2' },
]

const payments = [
  { name: '微信支付', percent: '42%', color: '#1677ff' },
  { name: '支付宝', percent: '31%', color: '#33c3d9' },
  { name: '银行卡', percent: '18%', color: '#8b5cf6' },
  { name: '现金', percent: '9%', color: '#f6b73c' },
]

const rankings = [
  { name: '有机纯牛奶 250ml', count: 682, amount: '¥ 8,526', short: '奶', bg: '#e9f3ff' },
  { name: '原味吐司面包', count: 521, amount: '¥ 6,788', short: '包', bg: '#fff2dd' },
  { name: '每日坚果组合装', count: 396, amount: '¥ 5,940', short: '果', bg: '#edf7e8' },
  { name: '天然苏打矿泉水', count: 455, amount: '¥ 4,322', short: '水', bg: '#e7f8fb' },
]

const inventory = [
  { name: '进口红酒 750ml', safe: 20, stock: 4, width: '20%' },
  { name: '特级初榨橄榄油', safe: 30, stock: 8, width: '27%' },
  { name: '精品咖啡豆 500g', safe: 25, stock: 11, width: '44%' },
]
</script>

<style scoped>
.dashboard { color: #29384f; }

.page-heading {
  margin: 3px 2px 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.page-heading p,
.card-header p { margin: 0; color: #98a4b6; font-size: 12px; }
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
  font-size: 12px;
  background: #fff;
}

.heading-actions svg { width: 14px; }
.heading-actions .primary-button { color: #fff; border-color: #1677ff; background: #1677ff; box-shadow: 0 5px 12px rgba(22,119,255,.18); }

.filter-bar {
  min-height: 56px;
  padding: 10px 14px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  background: #fff;
}

.filter-bar label { display: grid; gap: 4px; }
.filter-bar label > span { color: #7c899c; font-size: 10px; }
.filter-bar select, .filter-bar input { width: 150px; height: 30px; padding: 0 9px; color: #45536a; border: 1px solid #e1e6ed; border-radius: 5px; outline: none; background: #fbfcfe; font-size: 11px; }
.filter-bar .date-field input { width: 140px; }
.query-button { height: 30px; color: #fff; border-color: #1677ff; background: #1677ff; }
.filter-bar > small { margin: auto 0 6px auto; display: flex; align-items: center; gap: 6px; color: #a4aebe; font-size: 10px; }
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
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  background: #fff;
}

.metric-icon { flex: 0 0 42px; height: 42px; display: grid; place-items: center; border-radius: 10px; }
.metric-icon svg { width: 21px; }
.metric-card > div:last-child { min-width: 0; display: grid; }
.metric-card span { color: #7d899b; font-size: 11px; }
.metric-card strong { margin: 1px 0; color: #24344a; font-size: 20px; white-space: nowrap; }
.metric-card small { color: #17a879; font-size: 10px; }
.metric-card small.down { color: #e95c61; }
.metric-card small em { margin-left: 4px; color: #a6afbd; font-style: normal; }

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(280px, .85fr);
  gap: 12px;
}

.card { min-width: 0; padding: 15px; border: 1px solid #e6ebf2; border-radius: 8px; background: #fff; }
.card-header { margin-bottom: 12px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.card-header h2 { margin: 0 0 2px; color: #26364c; font-size: 14px; }
.legend { display: flex; gap: 14px; color: #7c899a; font-size: 10px; }
.legend span { display: flex; align-items: center; gap: 5px; }
.legend i, .payments i { width: 7px; height: 7px; border-radius: 50%; }
.legend .blue { background: #1677ff; }
.legend .cyan { background: #33c3d9; }
.more-button, .link-button { padding: 2px 0; color: #8390a4; border: 0; background: transparent; font-size: 11px; }
.link-button { color: #1677ff; }

.line-chart { height: 232px; display: flex; }
.y-axis { width: 32px; padding: 1px 0 18px; display: flex; flex-direction: column; justify-content: space-between; color: #a5afbd; font-size: 9px; }
.plot { position: relative; flex: 1; padding-bottom: 18px; }
.grid-line { height: 25%; border-top: 1px dashed #e9edf3; }
.plot svg { position: absolute; inset: 0 0 18px; width: 100%; height: calc(100% - 18px); overflow: visible; }
.x-axis { position: absolute; inset: auto 0 0; display: flex; justify-content: space-between; color: #a5afbd; font-size: 9px; }

.donut-wrap { display: flex; align-items: center; justify-content: center; gap: 22px; min-height: 232px; }
.donut { width: 128px; height: 128px; display: grid; place-items: center; border-radius: 50%; background: conic-gradient(#1677ff 0 42%, #33c3d9 42% 73%, #8b5cf6 73% 91%, #f6b73c 91%); }
.donut::before { content: ''; width: 78px; height: 78px; border-radius: 50%; background: #fff; }
.donut > div { position: absolute; display: grid; text-align: center; }
.donut strong { color: #26364c; font-size: 13px; }
.donut span { color: #9ba6b5; font-size: 9px; }
.donut-wrap ul { width: 110px; margin: 0; padding: 0; display: grid; gap: 12px; list-style: none; }
.donut-wrap li { display: flex; justify-content: space-between; color: #6d7b90; font-size: 10px; }
.donut-wrap li span { display: flex; align-items: center; gap: 6px; }
.donut-wrap li strong { color: #35445a; }

.ranking-list, .inventory-list { display: grid; }
.ranking-list > div { padding: 10px 2px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #edf0f4; }
.ranking-list > div:last-child { border-bottom: 0; }
.rank { width: 18px; height: 18px; display: grid; place-items: center; color: #8d99aa; font-size: 10px; border-radius: 5px; background: #f0f3f7; }
.rank.top { color: #fff; background: #1677ff; }
.product-thumb { width: 34px; height: 34px; display: grid; place-items: center; color: #53657d; font-size: 11px; border-radius: 7px; }
.ranking-list p, .inventory-list p { margin: 0; flex: 1; display: grid; }
.ranking-list p strong, .inventory-list p strong { color: #37465a; font-size: 11px; }
.ranking-list p small, .inventory-list p small { color: #a3adbb; font-size: 9px; }
.ranking-list b { color: #34445a; font-size: 11px; }

.warning-badge { padding: 4px 7px; color: #d47713; border-radius: 4px; background: #fff4df; font-size: 9px; }
.inventory-list > div { padding: 11px 2px; display: grid; grid-template-columns: 1.3fr .8fr 40px; align-items: center; gap: 10px; border-bottom: 1px solid #edf0f4; }
.stock-bar { height: 5px; overflow: hidden; border-radius: 99px; background: #f0f2f6; }
.stock-bar i { display: block; height: 100%; border-radius: inherit; background: #ff7a6d; }
.inventory-list b { color: #e95c61; font-size: 10px; text-align: right; }
.full-button { width: 100%; height: 32px; margin-top: 9px; color: #1677ff; border-color: #dce9fb; background: #f5f9ff; }

@media (max-width: 1150px) {
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
}

@media (max-width: 680px) {
  .page-heading { align-items: flex-start; }
  .heading-actions .ghost-button { display: none; }
  .filter-bar { align-items: stretch; flex-wrap: wrap; }
  .filter-bar label { flex: 1 1 130px; }
  .filter-bar select, .filter-bar input, .filter-bar .date-field input { width: 100%; }
  .filter-bar > small { flex-basis: 100%; margin: 2px 0; }
  .metric-grid { grid-template-columns: 1fr; }
  .donut-wrap { flex-direction: column; }
}
</style>
