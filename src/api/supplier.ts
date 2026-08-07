import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { Supplier, SupplierPayload, SupplierQuery } from '../types/supplier'

export const supplierApi = {
  getList(params: SupplierQuery) {
    return request.get<unknown, PageResult<Supplier>>('/suppliers', { params })
  },
  getDetail(supplierId: number) {
    return request.get<unknown, Supplier>(`/suppliers/${supplierId}`)
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
