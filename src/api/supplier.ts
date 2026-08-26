import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { Supplier, SupplierPayload, SupplierQuery } from '../types/supplier'

type RawSupplier = Partial<Supplier> & {
  supplieR_ID?: number
  supplieR_NAME?: string
  contacT_NAME?: string | null
  crediT_LEVEL?: Supplier['creditLevel']
  paymenT_CYCLE?: number | null
  miN_ORDER_QTY?: number | null
  banK_NAME?: string | null
  banK_ACCOUNT?: string | null
}

const normalizeSupplier = (item: RawSupplier): Supplier => ({
  supplierId: item.supplierId ?? item.supplieR_ID ?? 0,
  supplierName: item.supplierName ?? item.supplieR_NAME ?? '',
  contactName: item.contactName ?? item.contacT_NAME ?? null,
  phone: item.phone ?? null,
  email: item.email ?? null,
  address: item.address ?? null,
  creditLevel: item.creditLevel ?? item.crediT_LEVEL ?? null,
  paymentCycle: item.paymentCycle ?? item.paymenT_CYCLE ?? null,
  minOrderQty: item.minOrderQty ?? item.miN_ORDER_QTY ?? null,
  bankName: item.bankName ?? item.banK_NAME ?? null,
  bankAccount: item.bankAccount ?? item.banK_ACCOUNT ?? null,
  status: item.status === '禁用' ? '禁用' : '启用',
})

export const supplierApi = {
  async getList(params: SupplierQuery) {
    const result = await request.get<unknown, PageResult<RawSupplier>>('/suppliers', { params })
    const list = (result?.list ?? []).map(normalizeSupplier)
    return { ...result, list, total: result?.total ?? list.length } satisfies PageResult<Supplier>
  },
  async getDetail(supplierId: number) {
    const result = await request.get<unknown, RawSupplier>(`/suppliers/${supplierId}`)
    return normalizeSupplier(result)
  },
  create(data: SupplierPayload) {
    return request.post<unknown, Supplier>('/suppliers', data)
  },
  update(supplierId: number, data: SupplierPayload) {
    return request.put<unknown, Supplier>(`/suppliers/${supplierId}`, data)
  },
  remove(supplierId: number) {
    return request.delete<unknown, null>(`/suppliers/${supplierId}`)
  },
}
