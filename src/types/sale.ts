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
}

export interface SaleItem {
  saleDetailId?: number
  productId: number
  productName?: string
  barcode?: string
  specification?: string | null
  saleQuantity: number
  salePrice: number
  subtotal?: number
}

export interface SaleDetail extends SaleOrder {
  items?: SaleItem[]
  returnCount?: number
}

export interface SaleQuery extends PageQuery {
  payType?: string
  startDate?: string
  endDate?: string
}

export interface CreateSalePayload {
  memberId?: number
  payType: PayType
  couponId?: number
  pointsUsed?: number
  items: Array<{ productId: number; quantity: number }>
}

export interface CreateSaleResult extends SaleDetail {}
