import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { Product, ProductPayload, ProductQuery } from '../types/product'

export const productApi = {
  getList(params: ProductQuery) {
    return request.get<unknown, PageResult<Product>>('/products', { params })
  },

  create(data: ProductPayload) {
    return request.post<unknown, Product>('/products', data)
  },

  getDetail(productId: number) {
    return request.get<unknown, Product>(`/products/${productId}`)
  },

  update(productId: number, data: ProductPayload) {
    return request.put<unknown, Product>(`/products/${productId}`, data)
  },

  remove(productId: number) {
    return request.delete<unknown, null>(`/products/${productId}`)
  },

  getByBarcode(barcode: string) {
    return request.get<unknown, Product>(`/products/barcode/${encodeURIComponent(barcode)}`)
  },

  getWarningStock(params: ProductQuery) {
    return request.get<unknown, PageResult<Product>>('/products/warning-stock', { params })
  },
}
