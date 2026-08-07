import type { PageQuery } from './common'

export interface Warehouse {
  warehouseId: number
  warehouseName: string
  address?: string | null
  status?: '启用' | '禁用' | null
  createTime?: string | null
}

export interface InventoryItem {
  inventoryId: number
  productId: number
  productName?: string
  barcode?: string
  specification?: string | null
  unit?: string | null
  stockWarning?: number | null
  warehouseId: number
  warehouseName?: string
  currentStock: number
  lastUpdateTime: string
}

export type InventoryStatus = '正常' | '预警' | '缺货'

export interface InventoryQuery extends PageQuery {
  warehouseId?: number
  warningOnly?: boolean
}

export interface InventoryRecord {
  recordId: number
  productId: number
  productName?: string
  barcode?: string
  recordType: '入库' | '销售' | '退货' | '盘点' | string
  sourceNo?: string | null
  changeQty: number
  remainQty: number
  operatorId: number
  operatorName?: string
  recordTime: string
  remark?: string | null
}

export interface InventoryRecordQuery extends PageQuery {
  recordType?: string
  sourceNo?: string
  operatorId?: number
  startDate?: string
  endDate?: string
}
