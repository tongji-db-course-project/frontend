<template>
  <el-form
    class="base-search-form"
    :model="modelValue"
    :inline="inline"
    :label-width="labelWidth"
    @submit.prevent
  >
    <el-form-item
      v-for="field in visibleFields"
      :key="field.prop"
      :label="field.label"
      class="base-search-form__item"
    >
      <el-input
        v-if="field.type === 'input'"
        :model-value="modelValue[field.prop]"
        :placeholder="field.placeholder || `请输入${field.label}`"
        clearable
        @update:model-value="updateField(field.prop, $event)"
        @keyup.enter="handleSearch"
      />

      <el-select
        v-else-if="field.type === 'select'"
        :model-value="modelValue[field.prop]"
        :placeholder="field.placeholder || `请选择${field.label}`"
        clearable
        filterable
        @update:model-value="updateField(field.prop, $event)"
      >
        <el-option
          v-for="option in field.options || []"
          :key="String(option.value)"
          :label="option.label"
          :value="option.value"
        />
      </el-select>

      <el-date-picker
        v-else-if="field.type === 'date'"
        :model-value="modelValue[field.prop]"
        type="date"
        value-format="YYYY-MM-DD"
        :placeholder="field.placeholder || `请选择${field.label}`"
        @update:model-value="updateField(field.prop, $event)"
      />

      <el-date-picker
        v-else-if="field.type === 'daterange'"
        :model-value="modelValue[field.prop]"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @update:model-value="updateField(field.prop, $event)"
      />

      <el-input-number
        v-else-if="field.type === 'number'"
        :model-value="modelValue[field.prop] as number | undefined"
        :min="field.min"
        :max="field.max"
        :placeholder="field.placeholder"
        controls-position="right"
        @update:model-value="updateField(field.prop, $event)"
      />

      <slot
        v-else
        :name="`field-${field.prop}`"
        :field="field"
        :value="modelValue[field.prop]"
        :update="(value: SearchValue) => updateField(field.prop, value)"
      />
    </el-form-item>

    <el-form-item class="base-search-form__actions">
      <el-button type="primary" :loading="loading" @click="handleSearch">
        查询
      </el-button>
      <el-button @click="handleReset">重置</el-button>
      <el-button
        v-if="fields.length > defaultVisibleCount"
        link
        type="primary"
        @click="toggleExpand"
      >
        {{ expanded ? '收起' : '展开' }}
      </el-button>
      <slot name="actions" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({
  name: 'BaseSearchForm',
})

type SearchValue = string | number | boolean | null | undefined | string[] | number[]
type SearchFieldType = 'input' | 'select' | 'date' | 'daterange' | 'number' | 'custom'

export interface SearchOption {
  label: string
  value: string | number | boolean
}

export interface SearchField {
  label: string
  prop: string
  type: SearchFieldType
  placeholder?: string
  options?: SearchOption[]
  defaultValue?: SearchValue
  min?: number
  max?: number
}

const props = withDefaults(defineProps<{
  modelValue: Record<string, SearchValue>
  fields: SearchField[]
  loading?: boolean
  inline?: boolean
  labelWidth?: string | number
  defaultVisibleCount?: number
}>(), {
  loading: false,
  inline: true,
  labelWidth: '88px',
  defaultVisibleCount: 4,
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, SearchValue>]
  search: [value: Record<string, SearchValue>]
  reset: [value: Record<string, SearchValue>]
}>()

const expanded = ref(false)

const visibleFields = computed(() => {
  if (expanded.value) {
    return props.fields
  }

  return props.fields.slice(0, props.defaultVisibleCount)
})

const updateField = (prop: string, value: SearchValue) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [prop]: value,
  })
}

const createDefaultModel = () => {
  return props.fields.reduce<Record<string, SearchValue>>((model, field) => {
    model[field.prop] = field.defaultValue ?? ''
    return model
  }, {})
}

const handleSearch = () => {
  emit('search', { ...props.modelValue })
}

const handleReset = () => {
  const nextModel = createDefaultModel()
  emit('update:modelValue', nextModel)
  emit('reset', nextModel)
}

const toggleExpand = () => {
  expanded.value = !expanded.value
}
</script>

<style scoped>
.base-search-form {
  padding: 16px 18px 4px;
  margin-bottom: 16px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.base-search-form__item {
  margin-right: 18px;
  margin-bottom: 12px;
}

.base-search-form__item :deep(.el-input),
.base-search-form__item :deep(.el-select),
.base-search-form__item :deep(.el-date-editor) {
  width: 220px;
}

.base-search-form__actions {
  margin-bottom: 12px;
}

@media (max-width: 900px) {
  .base-search-form {
    display: block;
  }

  .base-search-form__item,
  .base-search-form__actions {
    display: flex;
    margin-right: 0;
  }

  .base-search-form__item :deep(.el-form-item__content) {
    flex: 1;
  }

  .base-search-form__item :deep(.el-input),
  .base-search-form__item :deep(.el-select),
  .base-search-form__item :deep(.el-date-editor) {
    width: 100%;
  }
}
</style>
