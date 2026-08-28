import type { PageQuery } from './common'

export type ReturnStatus = '待处理' | '已完成' | '已拒绝'

export interface ReturnOrder {
  returnId: number
  returnNo: string
  saleId: number
  saleNo?: string | null
  memberId?: number | null
  memberName?: string | null
  operatorId: number
  operatorName?: string | null
  returnDate: string
  refundAmount: number
  status: ReturnStatus
  createTime?: string | null
  updateTime?: string | null
  remark?: string | null
}

export interface ReturnItem {
  returnDetailId?: number
  productId: number
  productName?: string
  barcode?: string
  quantity: number
  refundPrice: number
  subtotal: number
}

export interface ReturnDetail extends ReturnOrder {
  items?: ReturnItem[]
  details?: ReturnItem[]
}

export interface ReturnQuery extends PageQuery {
  saleId?: number
}

export interface CreateReturnPayload {
  saleId: number
  memberId?: number | null
  operatorId: number
  returnDate: string
  remark?: string | null
  details: Array<{
    productId: number
    quantity: number
    refundPrice: number
    subtotal?: number
  }>
}
