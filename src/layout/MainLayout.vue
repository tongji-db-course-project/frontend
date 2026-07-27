<template>
  <div class="app-shell">
    <aside class="app-sidebar" :class="{ 'is-open': mobileMenuOpen }">
      <SideMenu @navigate="mobileMenuOpen = false" />
    </aside>
    <div v-if="mobileMenuOpen" class="menu-mask" @click="mobileMenuOpen = false" />

    <section class="app-workspace">
      <HeaderBar @toggle-menu="mobileMenuOpen = !mobileMenuOpen" />
      <main class="app-main">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SideMenu from './SideMenu.vue'
import HeaderBar from './HeaderBar.vue'

const mobileMenuOpen = ref(false)
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  background: #f3f6fb;
}

.app-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 30;
  width: 232px;
}

.app-workspace {
  min-width: 0;
  width: calc(100% - 232px);
  margin-left: 232px;
}

.app-main {
  min-height: calc(100vh - 64px);
  padding: 16px;
  overflow: hidden;
}

.menu-mask {
  display: none;
}

@media (max-width: 900px) {
  .app-sidebar {
    transform: translateX(-100%);
    transition: transform .24s ease;
  }

  .app-sidebar.is-open {
    transform: translateX(0);
  }

  .app-workspace {
    width: 100%;
    margin-left: 0;
  }

  .app-main {
    padding: 12px;
  }

  .menu-mask {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 20;
    background: rgba(13, 31, 58, .45);
  }
}
</style>
