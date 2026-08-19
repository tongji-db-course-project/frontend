import type { PageQuery } from './common'

export type SaleStatus = '待支付' | '已完成' | '已取消'
export type PayType = '现金' | '微信' | '支付宝'

export interface SaleOrder {
  saleId: number
  saleNo: string
  memberId?: number | null
  memberName?: string | null
  userId: number
  cashierName?: string | null
  saleDate?: string | null
  totalAmount?: number | null
  discountAmount?: number | null
  paidAmount?: number | null
  payType?: PayType | null
  status?: SaleStatus | null
  createTime?: string | null
  updateTime?: string | null
  redeemedPoints?: number
  earnedPoints?: number
  items?: SaleDetailItem[]
}

export interface SaleDetailItem {
  productId: number
  productName?: string | null
  barcode?: string | null
  specification?: string | null
  unitPrice?: number | null
  salePrice?: number | null
  quantity: number
  subtotal?: number | null
}

export interface SaleCheckoutDetail {
  productId: number
  quantity: number
}

export interface SaleQuery extends PageQuery {
  memberId?: number
  startDate?: string
  endDate?: string
}

export interface SaleCheckoutPayload {
  memberId?: number | null
  warehouseId: number
  payType: PayType
  redeemPoints: number
  items: SaleCheckoutDetail[]
}
