<template>
    <div class="product-list">
        <h2>商品管理</h2>
        <div class="toolbar">
            <button>+ 添加商品</button>
        </div>
        <!-- 之后这里放置BaseTable组件 -->
        <BaseTable :columns="cols" :data="list" />
        <p>这里将显示商品表格数据...</p>
    </div>
</template>

<script setup lang="ts">
import BaseTable from '../../components/BaseTable.vue';
const cols=[
    {label:'商品名称',prop:'name'},
    {label:'价格',prop:'price'}
];
const list=[
    {id:1,name:'苹果',price:'5元'},
    {id:2,name:'香蕉',price:'3元'}
];
</script>


<style scoped>
.toolbar{
    margin-bottom:20px;
}
</style>