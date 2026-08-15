import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { InventoryItem, InventoryQuery, InventoryRecord, InventoryRecordQuery, Warehouse } from '../types/inventory'

export const inventoryApi = {
  getList(params: InventoryQuery) {
    return request.get<unknown, PageResult<InventoryItem>>('/inventory', { params })
  },
  getWarningList(params: InventoryQuery) {
    return request.get<unknown, PageResult<InventoryItem>>('/inventory/warning', { params })
  },
  getRecords(params: InventoryRecordQuery) {
    return request.get<unknown, PageResult<InventoryRecord>>('/inventory/records', { params })
  },
  getWarehouses() {
    return request.get<unknown, Warehouse[]>('/warehouses')
  },
}
