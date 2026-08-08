import request from '../utils/request'
import type { BusinessPage, BusinessQuery, BusinessRecord, StatusPayload } from '../types/business'

const resource = (path: string) => ({
  getList: (params: BusinessQuery) => request.get<unknown, BusinessPage>(path, { params }),
  getDetail: (id: number) => request.get<unknown, BusinessRecord>(`${path}/${id}`),
  create: (data: BusinessRecord) => request.post<unknown, BusinessRecord>(path, data),
  update: (id: number, data: BusinessRecord) => request.put<unknown, BusinessRecord>(`${path}/${id}`, data),
  remove: (id: number) => request.delete<unknown, null>(`${path}/${id}`),
  updateStatus: (id: number, data: StatusPayload) => request.put<unknown, null>(`${path}/${id}/status`, data),
})

export const supplierApi = resource('/suppliers')
export const saleApi = {
  ...resource('/sales'),
  checkout: (data: BusinessRecord) => request.post<unknown, BusinessRecord>('/sales/checkout', data),
  cancel: (id: number) => request.post<unknown, null>(`/sales/${id}/cancel`),
}
export const returnApi = {
  ...resource('/returns'),
  approve: (id: number) => request.post<unknown, null>(`/returns/${id}/approve`),
  reject: (id: number) => request.post<unknown, null>(`/returns/${id}/reject`),
}
export const inventoryApi = {
  getList: (params: BusinessQuery) => request.get<unknown, BusinessPage>('/inventory', { params }),
  getRecords: (params: BusinessQuery) => request.get<unknown, BusinessPage>('/inventory/records', { params }),
  adjust: (data: BusinessRecord) => request.post<unknown, null>('/inventory/adjustments', data),
  stockIn: (data: BusinessRecord) => request.post<unknown, null>('/inventory/stock-in', data),
  stockOut: (data: BusinessRecord) => request.post<unknown, null>('/inventory/stock-out', data),
}
export const settlementApi = {
  ...resource('/settlements'),
  confirm: (id: number) => request.post<unknown, null>(`/settlements/${id}/confirm`),
  pay: (id: number) => request.post<unknown, null>(`/settlements/${id}/pay`),
}
export const menuApi = {
  ...resource('/menus'),
  getTree: () => request.get<unknown, BusinessRecord[]>('/menus/tree'),
  reorder: (data: BusinessRecord) => request.put<unknown, null>('/menus/order', data),
}
export const statisticsApi = {
  sales: (params: BusinessQuery) => request.get<unknown, BusinessRecord>('/statistics/sales', { params }),
  products: (params: BusinessQuery) => request.get<unknown, BusinessRecord>('/statistics/products', { params }),
  profit: (params: BusinessQuery) => request.get<unknown, BusinessRecord>('/statistics/profit', { params }),
  inventory: (params: BusinessQuery) => request.get<unknown, BusinessRecord>('/statistics/inventory', { params }),
}
