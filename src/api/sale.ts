import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { MemberCoupon, SaleCheckoutPayload, SaleOrder, SaleQuery, SaleQuote } from '../types/sale'
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
  /** 待后端实现：结算预览不得写销售单、扣库存、扣积分或扣会员卡余额。 */
  preview(data: SaleCheckoutPayload) {
    return request.post<unknown, SaleQuote>('/sales/preview', data)
  },
  /** 待后端实现：只返回当前会员在本次订单中可使用的优惠券。 */
  getAvailableCoupons(memberId: number, originalAmount: number) {
    return request.get<unknown, MemberCoupon[]>(`/members/${memberId}/coupons/available`, { params: { originalAmount } })
  },
  getTimeline(saleId: number) {
    return request.get<unknown, OrderTimelineItem[]>(`/sales/${saleId}/timeline`)
  },
}
