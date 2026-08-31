import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { InventoryCountTask, InventoryItem, InventoryQuery, InventoryRecord, InventoryRecordQuery, PurchaseSuggestion, Warehouse } from '../types/inventory'

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
  adjust(data: { productId: number; changeQty: number; recordType: string; remark?: string; sourceNo?: string }) {
    return request.put<unknown, InventoryItem>('/inventory/adjust', data)
  },
  /** 待后端实现：按库存预警聚合建议采购量。 */
  getPurchaseSuggestions() {
    return request.get<unknown, PurchaseSuggestion[]>('/inventory/purchase-suggestions')
  },
  /** 待后端实现：创建任务时锁定盘点范围内的库存记录。 */
  createCountTask(data: { productIds: number[]; warehouseId?: number; remark?: string }) {
    return request.post<unknown, InventoryCountTask>('/inventory/counts', data)
  },
  /** 待后端实现：确认盘点后原子调整库存、解锁商品并生成损益凭证。 */
  confirmCountTask(countId: number, data: { items: Array<{ productId: number; actualStock: number }>; remark?: string }) {
    return request.put<unknown, InventoryCountTask>(`/inventory/counts/${countId}/confirm`, data)
  },
}
