<template>
  <div class="app-shell">
    <aside class="app-sidebar" :class="{ 'is-open': mobileMenuOpen }">
      <SideMenu @navigate="mobileMenuOpen = false" />
    </aside>
    <button v-if="mobileMenuOpen" class="menu-mask" aria-label="关闭导航菜单" @click="mobileMenuOpen = false" />

    <section class="app-workspace">
      <HeaderBar @toggle-menu="mobileMenuOpen = !mobileMenuOpen" />
      <main class="app-main">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SideMenu from './SideMenu.vue'
import HeaderBar from './HeaderBar.vue'

const mobileMenuOpen = ref(false)

watch(mobileMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

const closeOnEscape = (event) => {
  if (event.key === 'Escape') mobileMenuOpen.value = false
}

onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', closeOnEscape)
})
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  background: var(--surface-page);
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
  padding: var(--space-page);
  overflow-x: hidden;
}

.menu-mask {
  display: none;
}

@media (max-width: 900px) {
  .app-sidebar {
    width: min(280px, 84vw);
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
    border: 0;
    border-radius: 0;
  }
}

@media (max-width: 480px) {
  .app-main { padding: 10px; }
}
</style>
