import type { PageQuery } from './common'

export type SupplierStatus = '启用' | '禁用'
export type CreditLevel = 'A' | 'B' | 'C'

export interface Supplier {
  supplierId: number
  supplierName: string
  contactName?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  creditLevel?: CreditLevel | null
  paymentCycle?: number | null
  minOrderQty?: number | null
  bankName?: string | null
  bankAccount?: string | null
  status: SupplierStatus
}

export interface SupplierQuery extends PageQuery {
  creditLevel?: string
}

export type SupplierPayload = Omit<Supplier, 'supplierId'>

export interface SupplierPerformance {
  supplierId: number
  supplierName: string
  stockedOrderCount: number
  returnedOrderCount: number
  returnRate: number
  onTimeRate: number
  creditLevel: string
}
