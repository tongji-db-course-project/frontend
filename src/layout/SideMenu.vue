<template>
  <div class="side-menu">
    <div class="brand">
      <span class="brand-mark">S</span>
      <div>
        <strong>商舟零售</strong>
        <small>RETAIL ADMIN</small>
      </div>
    </div>

    <div class="menu-search">
      <Search />
      <span>搜索功能</span>
      <kbd>/</kbd>
    </div>

    <el-menu
      :default-active="route.path"
      :default-openeds="openedMenus"
      class="menu"
      background-color="transparent"
      text-color="#9fc5fa"
      active-text-color="#ffffff"
      router
      unique-opened
      @select="$emit('navigate')"
    >
      <template v-for="item in menuItems" :key="item.path || item.name">
        <el-menu-item v-if="!item.children" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.name }}</span>
        </el-menu-item>
        <el-sub-menu v-else :index="item.name">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.name }}</span>
          </template>
          <el-menu-item v-for="sub in item.children" :key="sub.path" :index="sub.path">
            <span class="sub-dot" />
            {{ sub.name }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>

    <div class="sidebar-footer">
      <span class="status-dot" />
      <div>
        <strong>服务运行正常</strong>
        <small>最后更新 刚刚</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import {
  Box, DataAnalysis, Goods, HomeFilled, List, Setting,
  ShoppingCart, Search, User,
} from '@element-plus/icons-vue'

defineEmits(['navigate'])
const route = useRoute()
const openedMenus = ['数据中心']

const menuItems = [
  { name: '经营概览', path: '/dashboard', icon: HomeFilled },
  {
    name: '基础资料', icon: Goods,
    children: [
      { name: '商品管理', path: '/product' },
      { name: '供应商管理', path: '/suppliers' },
    ],
  },
  { name: '商品分类', path: '/categories', icon: List },
  { name: '会员管理', path: '/members', icon: User },
  {
    name: '采购管理', icon: Box,
    children: [
      { name: '采购单列表', path: '/purchases' },
    ],
  },
  {
    name: '销售管理', icon: ShoppingCart,
    children: [
      { name: 'POS 收银', path: '/sales/checkout' },
      { name: '销售单列表', path: '/sales' },
      { name: '退货管理', path: '/returns' },
    ],
  },
  {
    name: '库存管理', icon: List,
    children: [
      { name: '当前库存', path: '/inventory' },
      { name: '库存流水', path: '/inventory/records' },
    ],
  },
  {
    name: '数据中心', icon: DataAnalysis,
    children: [
      { name: '销售统计', path: '/statistics/sales' },
      { name: '商品排行', path: '/statistics/products' },
      { name: '毛利分析', path: '/statistics/profit' },
      { name: '库存分析', path: '/statistics/inventory' },
      { name: '供应商结算', path: '/settlements' },
    ],
  },
  {
    name: '系统管理', icon: Setting,
    children: [
      { name: '角色管理', path: '/system/roles' },
      { name: '菜单管理', path: '/system/menus' },
    ],
  },
]
</script>

<style scoped>
.side-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #fff;
  background: linear-gradient(180deg, #087cf4 0%, #076fe2 46%, #075fc5 100%);
  box-shadow: 4px 0 18px rgba(26, 85, 160, .15);
}

.brand {
  height: 68px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 11px;
  border-bottom: 1px solid rgba(255, 255, 255, .12);
}

.brand-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: #0d75e5;
  font-size: 21px;
  font-style: italic;
  font-weight: 900;
  border-radius: 10px 5px 10px 5px;
  background: #fff;
}

.brand > div {
  display: grid;
}

.brand strong {
  font-size: 17px;
  letter-spacing: .05em;
}

.brand small {
  color: rgba(255,255,255,.62);
  font-size: 9px;
  letter-spacing: .16em;
}

.menu-search {
  height: 34px;
  margin: 14px 14px 6px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,.62);
  font-size: 12px;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 7px;
  background: rgba(0, 44, 110, .12);
}

.menu-search svg {
  width: 14px;
}

.menu-search kbd {
  margin-left: auto;
  padding: 1px 5px;
  color: rgba(255,255,255,.55);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 4px;
  background: transparent;
}

.menu {
  flex: 1;
  overflow-y: auto;
  border-right: 0;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 44px;
  margin: 2px 9px;
  padding: 0 13px !important;
  border-radius: 7px;
  font-size: 13px;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  color: #fff !important;
  background: rgba(255,255,255,.11) !important;
}

:deep(.el-menu-item.is-active) {
  color: #fff !important;
  font-weight: 600;
  background: rgba(255,255,255,.18) !important;
  box-shadow: inset 3px 0 0 #fff;
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
  height: 35px;
  padding-left: 46px !important;
  color: rgba(255,255,255,.68);
  font-size: 12px;
}

.sub-dot {
  width: 4px;
  height: 4px;
  margin-right: 10px;
  border-radius: 50%;
  background: currentColor;
}

.sidebar-footer {
  margin: 10px 14px 14px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 9px;
  border-radius: 8px;
  background: rgba(0, 39, 94, .18);
}

.sidebar-footer > div {
  display: grid;
}

.sidebar-footer strong { font-size: 11px; }
.sidebar-footer small { color: rgba(255,255,255,.58); font-size: 10px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #58e6a9; box-shadow: 0 0 0 4px rgba(88,230,169,.13); }
</style>
