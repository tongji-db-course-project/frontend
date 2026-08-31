import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { SaleCheckoutPayload, SaleOrder, SaleQuery } from '../types/sale'
import type { OrderTimelineItem } from '../types/common'

export const saleApi = {
  getList(params: SaleQuery) {
    return request.get<unknown, PageResult<SaleOrder>>('/sales', { params })
  },
  getDetail(saleId: number) {
    return request.get<unknown, SaleOrder>(`/sales/${saleId}`)
  },
  create(data: SaleCheckoutPayload) {
    return request.post<unknown, SaleOrder>('/sales', data)
  },
  checkout(data: SaleCheckoutPayload) {
    return request.post<unknown, SaleOrder>('/sales', data)
  },
  getTimeline(saleId: number) {
    return request.get<unknown, OrderTimelineItem[]>(`/sales/${saleId}/timeline`)
  },
}
