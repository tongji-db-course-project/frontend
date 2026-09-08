import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { OrderStatusLog, PurchaseReturn, PurchaseReturnQuery, SavePurchaseReturnPayload } from '../types/purchaseReturn'

const path = '/purchase-returns'

export const purchaseReturnApi = {
  getList: (params: PurchaseReturnQuery) => request.get<unknown, PageResult<PurchaseReturn>>(path, { params }),
  getDetail: (id: number) => request.get<unknown, PurchaseReturn>(`${path}/${id}`),
  create: (data: SavePurchaseReturnPayload) => request.post<unknown, PurchaseReturn>(path, data),
  update: (id: number, data: SavePurchaseReturnPayload) => request.put<unknown, PurchaseReturn>(`${path}/${id}`, data),
  approve: (id: number, remark?: string) => request.post<unknown, PurchaseReturn>(`${path}/${id}/approve`, { remark }),
  complete: (id: number, warehouseId: number, remark?: string) => request.post<unknown, PurchaseReturn>(`${path}/${id}/complete`, { warehouseId, remark }),
  remove: (id: number) => request.delete<unknown, null>(`${path}/${id}`),
  getTimeline: (id: number) => request.get<unknown, OrderStatusLog[]>(`${path}/${id}/timeline`),
}
