<template>
  <div class="biz-page">
    <PageHeader eyebrow="系统管理 · 权限配置" title="菜单管理" description="查看后端登记的系统菜单及层级关系" />
    <section class="biz-stats">
      <StatCard label="菜单总数" :value="menus.length" :icon="Menu" />
      <StatCard label="一级菜单" :value="rootCount" :icon="Folder" tone="green" />
      <StatCard label="子菜单" :value="menus.length - rootCount" :icon="Document" tone="purple" />
    </section>
    <section class="biz-card">
      <div class="biz-toolbar"><el-button type="primary" :loading="loading" @click="load">刷新</el-button></div>
      <el-table v-loading="loading" :data="menus" row-key="menuId" stripe border class="biz-table">
        <el-table-column prop="menuId" label="菜单编号" width="100" />
        <el-table-column prop="menuName" label="菜单名称" min-width="180" />
        <el-table-column label="菜单地址" min-width="220"><template #default="{ row }">{{ row.menuUrl || '—' }}</template></el-table-column>
        <el-table-column label="父级菜单" width="120"><template #default="{ row }">{{ parentName(row.parentId) }}</template></el-table-column>
        <el-table-column label="排序" width="90" align="right"><template #default="{ row }">{{ row.menuOrder ?? '—' }}</template></el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Document, Folder, Menu } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { menuApi } from '../../api/menu'
import type { MenuItem } from '../../types/menu'

const menus = ref<MenuItem[]>([])
const loading = ref(false)
const rootCount = computed(() => menus.value.filter(item => !item.parentId).length)
const parentName = (parentId: number) => parentId ? menus.value.find(item => item.menuId === parentId)?.menuName || `#${parentId}` : '一级菜单'

async function load() {
  loading.value = true
  try { menus.value = await menuApi.getList() ?? [] }
  catch { menus.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>
