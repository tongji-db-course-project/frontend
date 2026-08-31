import type { PageQuery } from './common'

export type SaleStatus = '待支付' | '已完成' | '已取消'

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
  redeemPoints: number
  couponId?: number | null
  items: SaleCheckoutDetail[]
}

export interface MemberCoupon {
  couponId: number
  couponName: string
  thresholdAmount: number
  discountAmount: number
  expireTime?: string | null
}

export interface SaleQuote {
  originalAmount: number
  promotionDiscount: number
  memberDiscount: number
  couponDiscount: number
  pointDiscount: number
  payableAmount: number
  redeemPoints: number
  itemPrices?: Array<{ productId: number; unitPrice: number; discountType?: string | null }>
}
