import request from '../utils/request'
import type { PageResult } from '../types/common'
import type {
  ProductCategory,
  ProductCategoryPayload,
  ProductCategoryQuery,
} from '../types/product'

export const categoryApi = {
  getList(params: ProductCategoryQuery) {
    return request.get<unknown, PageResult<ProductCategory>>('/categories', { params })
  },

  create(data: ProductCategoryPayload) {
    return request.post<unknown, ProductCategory>('/categories', data)
  },

  getDetail(categoryId: number) {
    return request.get<unknown, ProductCategory>(`/categories/${categoryId}`)
  },

  update(categoryId: number, data: ProductCategoryPayload) {
    return request.put<unknown, ProductCategory>(`/categories/${categoryId}`, data)
  },

  remove(categoryId: number) {
    return request.delete<unknown, null>(`/categories/${categoryId}`)
  },
}
