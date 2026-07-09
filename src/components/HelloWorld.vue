<template>
  <section class="empty-state">
    <div class="empty-state__icon">{{ icon }}</div>
    <div class="empty-state__content">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>

    <el-button
      v-if="actionText"
      type="primary"
      @click="emit('action')"
    >
      {{ actionText }}
    </el-button>

    <slot />
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'HelloWorld',
})

withDefaults(defineProps<{
  title?: string
  description?: string
  icon?: string
  actionText?: string
}>(), {
  title: '暂无内容',
  description: '当前模块还没有可展示的数据',
  icon: '!',
  actionText: '',
})

const emit = defineEmits<{
  action: []
}>()
</script>

<style scoped>
.empty-state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 32px;
  text-align: center;
  color: #606266;
  background: #ffffff;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
}

.empty-state__icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #409eff;
  background: #ecf5ff;
  font-size: 24px;
  font-weight: 700;
}

.empty-state__content h3 {
  margin: 0 0 6px;
  color: #303133;
  font-size: 18px;
}

.empty-state__content p {
  margin: 0;
  font-size: 14px;
}
</style>
