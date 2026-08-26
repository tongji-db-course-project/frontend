<template>
  <header class="header-bar">
    <div class="header-left">
      <button class="menu-trigger" aria-label="打开导航菜单" @click="$emit('toggle-menu')">
        <Menu />
      </button>
      <div class="breadcrumb">
        <span>零售管理中心</span>
        <i>/</i>
        <strong>{{ currentTitle }}</strong>
      </div>
    </div>

    <div class="header-actions">
      <button class="icon-button" aria-label="搜索功能" title="搜索功能（/）" @click="focusMenuSearch"><Search /></button>
      <button class="icon-button notification" aria-label="通知" title="查看通知" @click="showNotifications">
        <Bell />
        <span />
      </button>
      <div class="divider" />
      <div class="profile">
        <span class="avatar">{{ avatarText }}</span>
        <div>
          <strong>{{ displayName }}</strong>
          <small>{{ roleName }}</small>
        </div>
      </div>
      <button class="logout-button" @click="handleLogout">退出</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, Menu, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

defineEmits(['toggle-menu'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const displayName = computed(() => authStore.userInfo?.realName || authStore.userInfo?.username || '当前用户')
const roleName = computed(() => authStore.userInfo?.roleName || '已登录')
const avatarText = computed(() => displayName.value.slice(0, 1))
const focusMenuSearch = () => window.dispatchEvent(new Event('focus-menu-search'))
const showNotifications = () => ElMessage.info('暂无新的系统通知')

const titles = {
  '/dashboard': '经营概览',
  '/product': '商品管理',
  '/categories': '商品分类',
  '/suppliers': '供应商管理',
  '/members': '会员管理',
  '/purchases': '采购管理',
  '/sales': '销售管理',
  '/sales/checkout': 'POS 收银',
  '/returns': '退货管理',
  '/inventory': '当前库存',
  '/inventory/records': '库存流水',
  '/settlements': '供应商结算',
  '/statistics/sales': '销售统计',
  '/statistics/products': '商品排行',
  '/statistics/profit': '毛利分析',
  '/statistics/inventory': '库存分析',
  '/points/records': '积分记录',
  '/system/users': '用户管理',
  '/system/roles': '角色管理',
  '/system/menus': '菜单管理',
}

const currentTitle = computed(() => {
  if (route.meta.title) return String(route.meta.title)
  if (titles[route.path]) return titles[route.path]
  if (/^\/sales\/\d+$/.test(route.path)) return '销售单详情'
  if (/^\/returns\/\d+$/.test(route.path)) return '退货单详情'
  return '业务工作台'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header-bar {
  height: 64px;
  padding: 0 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: var(--surface-card);
  border-bottom: 1px solid var(--border-color);
}

.header-left,
.header-actions,
.profile {
  display: flex;
  align-items: center;
}

.header-left,
.header-actions {
  gap: 14px;
}

.breadcrumb {
  color: #8793a7;
  font-size: 14px;
}

.breadcrumb i {
  margin: 0 9px;
  color: #ccd3de;
  font-style: normal;
}

.breadcrumb strong {
  color: #26364d;
  font-weight: 600;
}

.menu-trigger,
.icon-button,
.logout-button {
  border: 0;
  background: transparent;
}

.menu-trigger {
  display: none;
  width: 36px;
  color: #45566f;
}

.menu-trigger svg,
.icon-button svg {
  width: 18px;
  height: 18px;
}

.icon-button {
  position: relative;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: #6f7d92;
  border-radius: 8px;
}

.icon-button:hover {
  color: var(--color-primary);
  background: #f1f6ff;
}

.notification span {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 6px;
  height: 6px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #ff5f57;
}

.divider {
  width: 1px;
  height: 24px;
  background: #e8edf5;
}

.profile {
  gap: 9px;
}

.profile > div {
  display: grid;
}

.profile strong {
  color: #27364c;
  font-size: 13px;
}

.profile small {
  color: #7f8da1;
  font-size: 12px;
}

.avatar {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border-radius: 9px;
  background: linear-gradient(135deg, #1677ff, #55a3ff);
}

.logout-button {
  padding: 7px 10px;
  color: #768398;
  border-radius: 7px;
}

.logout-button:hover {
  color: var(--color-danger);
  background: #fff2f2;
}

@media (max-width: 900px) {
  .menu-trigger { display: grid; place-items: center; }
  .breadcrumb span, .breadcrumb i, .profile > div, .divider, .icon-button:first-of-type { display: none; }
}

@media (max-width: 480px) {
  .header-bar { height: 56px; padding: 0 10px; gap: 8px; }
  .header-left, .header-actions { gap: 7px; }
  .breadcrumb { font-size: 13px; }
  .profile { gap: 0; }
  .avatar { width: 32px; height: 32px; }
  .logout-button { padding: 7px 5px; font-size: 12px; }
  .icon-button { width: 32px; height: 32px; }
}
</style>
