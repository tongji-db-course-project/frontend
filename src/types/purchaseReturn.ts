import type { PageQuery } from './common'

export type PurchaseReturnStatus = '待审核' | '已审核' | '已完成' | '已作废'

export interface PurchaseReturnDetail {
  productId: number
  productName: string
  quantity: number
  returnPrice: number
  subtotal: number
}

export interface PurchaseReturn {
  returnId: number
  returnNo: string
  purchaseId: number
  purchaseCode: string
  supplierId: number
  supplierName: string
  operatorId: number
  operatorName: string
  returnDate?: string | null
  totalAmount: number
  status: PurchaseReturnStatus
  createTime?: string | null
  updateTime?: string | null
  remark?: string | null
  details?: PurchaseReturnDetail[]
}

export interface PurchaseReturnQuery extends PageQuery {
  supplierId?: number
  purchaseId?: number
  startDate?: string
  endDate?: string
}

export interface SavePurchaseReturnPayload {
  purchaseId: number
  operatorId: number
  returnDate?: string
  details: Array<{ productId: number; quantity: number }>
  remark?: string | null
}

export interface OrderStatusLog {
  logId: number
  oldStatus?: string | null
  newStatus: string
  operatorId: number
  changeTime?: string | null
  remark?: string | null
}
