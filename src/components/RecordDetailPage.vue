<template>
  <div class="record">
    <header>
      <div>
        <button @click="router.back()">← 返回列表</button>
        <p>{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
      </div>
      <span>{{ status }}</span>
    </header>
    <section class="summary">
      <article v-for="item in summary" :key="item.label">
        <small>{{ item.label }}</small
        ><strong>{{ item.value }}</strong>
      </article>
    </section>
    <section class="grid">
      <article class="card">
        <h2>基本信息</h2>
        <dl>
          <div v-for="item in details" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
      </article>
      <article class="card">
        <h2>处理进度</h2>
        <ol>
          <li v-for="(item, index) in timeline" :key="item" :class="{ done: index < doneSteps }"><i />{{ item }}</li>
        </ol>
      </article>
    </section>
    <section class="card">
      <h2>商品明细</h2>
      <table>
        <thead>
          <tr>
            <th>商品名称</th>
            <th>规格</th>
            <th>数量</th>
            <th>单价</th>
            <th>小计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.name">
            <td>
              <b>{{ item.name }}</b>
            </td>
            <td>{{ item.spec }}</td>
            <td>{{ item.quantity }}</td>
            <td>¥ {{ item.price.toFixed(2) }}</td>
            <td>
              <b>¥ {{ (item.quantity * item.price).toFixed(2) }}</b>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
withDefaults(
  defineProps<{
    title: string
    eyebrow: string
    status: string
    summary: { label: string; value: string }[]
    details: { label: string; value: string }[]
    timeline: string[]
    doneSteps?: number
    items: { name: string; spec: string; quantity: number; price: number }[]
  }>(),
  { doneSteps: 2 },
)
</script>
<style scoped>
.record {
  color: #29384f;
}
.record > header {
  margin-bottom: 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.record header button {
  padding: 0;
  color: #1677ff;
  border: 0;
  background: transparent;
}
.record header p {
  margin: 8px 0 0;
  color: #98a4b6;
  font-size: 12px;
}
.record h1 {
  margin: 3px 0 0;
  font-size: 24px;
}
.record > header > span {
  padding: 6px 10px;
  color: #1677ff;
  border-radius: 6px;
  background: #eaf3ff;
}
.summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.summary article,
.card {
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  background: #fff;
}
.summary article {
  padding: 15px;
  display: grid;
}
.summary small {
  color: #8290a3;
  font-size: 10px;
}
.summary strong {
  font-size: 17px;
}
.grid {
  margin: 12px 0;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}
.card {
  padding: 16px;
  overflow-x: auto;
}
.card h2 {
  margin: 0 0 14px;
  font-size: 14px;
}
.card dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.card dl div {
  padding-bottom: 9px;
  border-bottom: 1px solid #edf1f5;
}
.card dt {
  color: #98a4b6;
  font-size: 10px;
}
.card dd {
  margin: 3px 0 0;
}
.card ol {
  margin: 0;
  padding: 0;
  list-style: none;
}
.card ol li {
  position: relative;
  padding: 0 0 20px 22px;
  color: #a0a9b6;
}
.card ol i {
  position: absolute;
  left: 0;
  top: 2px;
  width: 9px;
  height: 9px;
  border: 2px solid #cbd3de;
  border-radius: 50%;
}
.card ol li.done {
  color: #169c73;
}
.card ol li.done i {
  border-color: #20bd87;
  background: #20bd87;
}
table {
  width: 100%;
  min-width: 650px;
  border-collapse: collapse;
}
th,
td {
  padding: 11px;
  text-align: left;
  border-bottom: 1px solid #edf1f5;
  font-size: 11px;
}
th {
  color: #718096;
  background: #f7f9fc;
}
@media (max-width: 850px) {
  .summary {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 560px) {
  .summary {
    grid-template-columns: 1fr;
  }
  .card dl {
    grid-template-columns: 1fr;
  }
}
</style>
