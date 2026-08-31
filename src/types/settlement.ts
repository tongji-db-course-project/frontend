import type { PageQuery } from './common'

export type SettlementStatus = '未结算' | '部分结算' | '已结算'

export interface SupplierSettlement {
  settlementId: number
  supplierId: number
  supplierName?: string
  purchaseId: number
  purchaseNo?: string
  settlementDate?: string | null
  dueDate?: string | null
  overdueDays?: number | null
  prepaidAmount?: number | null
  settlementAmount: number
  paidAmount?: number | null
  unpaidAmount: number
  status: SettlementStatus
  remark?: string | null
}

export interface SettlementPayment {
  paymentId: number
  settlementId: number
  paidAmount: number
  paymentTime: string
  operatorName?: string | null
  remark?: string | null
}

export interface SettlementQuery extends PageQuery {
  supplierId?: number
  startDate?: string
  endDate?: string
}
