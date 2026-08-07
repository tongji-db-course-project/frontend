import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { CreateSalePayload, CreateSaleResult, SaleDetail, SaleOrder, SaleQuery } from '../types/sale'

export const saleApi = {
  getList(params: SaleQuery) {
    return request.get<unknown, PageResult<SaleOrder>>('/sales', { params })
  },
  getDetail(saleId: number) {
    return request.get<unknown, SaleDetail>(`/sales/${saleId}`)
  },
  create(data: CreateSalePayload) {
    return request.post<unknown, CreateSaleResult>('/sales', data)
  },
}
