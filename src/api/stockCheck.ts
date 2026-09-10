import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { StockCheckDetail, StockCheckListItem, StockCheckQuery } from '../types/stockCheck'

export const stockCheckApi = {
  list: (params: StockCheckQuery) => request.get<unknown, PageResult<StockCheckListItem>>('/inventory/counts', { params }),
  get: (id: number) => request.get<unknown, StockCheckDetail>(`/inventory/counts/${id}`),
  create: (data: { productId: number; remark?: string }) => request.post<unknown, StockCheckDetail>('/inventory/counts', data),
  confirm: (id: number, data: { items: Array<{ productId: number; actualQty: number }>; remark?: string }) => request.post<unknown, StockCheckDetail>(`/inventory/counts/${id}/confirm`, data),
  cancel: (id: number) => request.post<unknown, null>(`/inventory/counts/${id}/cancel`),
}
