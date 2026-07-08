<!-- src/components/BaseTable.vue -->
<template>
    <el-table :data="data" style="width: 100%" border stripe>
        <el-table-column
            v-for="col in columns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
        />
        <el-table-column label="操作" width="150">
            <template #default="scope">
                <el-button link type="primary" size="small">编辑</el-button>
                <el-button link type="danger" size="small">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup>
/* 用来从父组件(比如ProductListView.vue)接受数据 */
/* 父组件会通过<BaseTable:columns="myCols" :data="myList"/>把数据传进来。
这个函数告诉Vue需要接受两个外部参数，一个叫columns，一个叫data  */
defineProps(['columns','data']);
</script>