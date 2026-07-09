<template>
  <div class="base-table">
    <div v-if="$slots.toolbar" class="base-table__toolbar">
      <slot name="toolbar" />
    </div>

    <el-table
      v-loading="loading"
      :data="data"
      :row-key="rowKey"
      :border="border"
      :stripe="stripe"
      :height="height"
      :max-height="maxHeight"
      class="base-table__body"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <el-table-column
        v-if="showSelection"
        type="selection"
        width="48"
        align="center"
      />

      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="64"
        align="center"
      />

      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align || 'left'"
        :fixed="col.fixed"
        :show-overflow-tooltip="col.showOverflowTooltip ?? true"
      >
        <template #default="scope">
          <slot
            :name="`column-${col.prop}`"
            :row="scope.row"
            :column="col"
            :index="scope.$index"
          >
            {{ formatCell(scope.row, col, scope.$index) }}
          </slot>
        </template>
      </el-table-column>

      <el-table-column
        v-if="showActions"
        label="操作"
        :width="actionWidth"
        fixed="right"
        align="center"
      >
        <template #default="scope">
          <slot
            name="actions"
            :row="scope.row"
            :index="scope.$index"
          >
            <el-button link type="primary" size="small" @click.stop="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click.stop="handleDelete(scope.row)">
              删除
            </el-button>
          </slot>
        </template>
      </el-table-column>

      <template #empty>
        <slot name="empty">
          <div class="base-table__empty">{{ emptyText }}</div>
        </slot>
      </template>
    </el-table>

    <div v-if="pagination" class="base-table__pagination">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        :current-page="pagination.page"
        :page-size="pagination.size"
        :page-sizes="pagination.pageSizes || [10, 20, 50, 100]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BaseTable',
})

type TableAlign = 'left' | 'center' | 'right'
type FixedDirection = true | 'left' | 'right'

export interface BaseTableColumn {
  label: string
  prop: string
  width?: number | string
  minWidth?: number | string
  align?: TableAlign
  fixed?: FixedDirection
  showOverflowTooltip?: boolean
  formatter?: (row: Record<string, unknown>, index: number) => string | number
}

export interface BaseTablePagination {
  page: number
  size: number
  total: number
  pageSizes?: number[]
}

const props = withDefaults(defineProps<{
  columns: BaseTableColumn[]
  data: Record<string, unknown>[]
  loading?: boolean
  rowKey?: string
  border?: boolean
  stripe?: boolean
  height?: string | number
  maxHeight?: string | number
  showIndex?: boolean
  showSelection?: boolean
  showActions?: boolean
  actionWidth?: string | number
  emptyText?: string
  pagination?: BaseTablePagination | null
}>(), {
  loading: false,
  rowKey: 'id',
  border: true,
  stripe: true,
  showIndex: false,
  showSelection: false,
  showActions: true,
  actionWidth: 160,
  emptyText: '暂无数据',
  pagination: null,
})

const emit = defineEmits<{
  edit: [row: Record<string, unknown>]
  delete: [row: Record<string, unknown>]
  rowClick: [row: Record<string, unknown>]
  selectionChange: [rows: Record<string, unknown>[]]
  pageChange: [page: number]
  sizeChange: [size: number]
}>()

const formatCell = (
  row: Record<string, unknown>,
  column: BaseTableColumn,
  index: number,
) => {
  if (column.formatter) {
    return column.formatter(row, index)
  }

  const value = row[column.prop]
  return value === null || value === undefined || value === '' ? '-' : String(value)
}

const handleEdit = (row: Record<string, unknown>) => {
  emit('edit', row)
}

const handleDelete = (row: Record<string, unknown>) => {
  emit('delete', row)
}

const handleRowClick = (row: Record<string, unknown>) => {
  emit('rowClick', row)
}

const handleSelectionChange = (rows: Record<string, unknown>[]) => {
  emit('selectionChange', rows)
}

const handlePageChange = (page: number) => {
  emit('pageChange', page)
}

const handleSizeChange = (size: number) => {
  emit('sizeChange', size)
}
</script>

<style scoped>
.base-table {
  width: 100%;
}

.base-table__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.base-table__body {
  width: 100%;
}

.base-table__empty {
  padding: 20px 0;
  color: #909399;
}

.base-table__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
