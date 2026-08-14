import type { PageQuery } from './common'

export type SaleStatus = '待支付' | '已完成' | '已取消'
export type PayType = '现金' | '微信' | '支付宝'

export interface SaleOrder {
  saleId: number
  saleNo: string
  memberId?: number | null
  userId: number
  saleDate?: string | null
  totalAmount?: number | null
  discountAmount?: number | null
  paidAmount?: number | null
  payType?: PayType | null
  status?: SaleStatus | null
  createTime?: string | null
  updateTime?: string | null
}

export interface SaleCheckoutDetail {
  productId: number
  quantity: number
}

export interface SaleQuery extends PageQuery {
  memberId?: number
}

export interface SaleCheckoutPayload {
  memberId?: number | null
  warehouseId: number
  payType: PayType
  redeemPoints: number
  items: SaleCheckoutDetail[]
}
