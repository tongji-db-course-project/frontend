import request from '../utils/request'
import type { PageResult } from '../types/common'
import type {
  ProductCategory,
  ProductCategoryPayload,
  ProductCategoryQuery,
} from '../types/product'

type RawCategory = Partial<ProductCategory> & {
  categorY_ID?: number
  categorY_NAME?: string
  categorY_DESC?: string | null
}

const normalizeCategory = (item: RawCategory): ProductCategory => ({
  categoryId: item.categoryId ?? item.categorY_ID ?? 0,
  categoryName: item.categoryName ?? item.categorY_NAME ?? '',
  categoryDesc: item.categoryDesc ?? item.categorY_DESC ?? null,
  status: item.status === '停用' ? '停用' : '启用',
})

export const categoryApi = {
  async getList(params: ProductCategoryQuery) {
    const result = await request.get<unknown, PageResult<RawCategory> | RawCategory[]>('/categories', { params })
    const list = Array.isArray(result) ? result : result?.list ?? []
    const normalized = list.map(normalizeCategory)
    return {
      list: normalized,
      total: Array.isArray(result) ? normalized.length : result?.total ?? normalized.length,
      page: Array.isArray(result) ? params.page : result?.page ?? params.page,
      size: Array.isArray(result) ? params.size : result?.size ?? params.size,
    } satisfies PageResult<ProductCategory>
  },

  create(data: ProductCategoryPayload) {
    return request.post<unknown, ProductCategory>('/categories', data)
  },

  async getDetail(categoryId: number) {
    const result = await request.get<unknown, RawCategory>(`/categories/${categoryId}`)
    return normalizeCategory(result)
  },

  update(categoryId: number, data: ProductCategoryPayload) {
    return request.put<unknown, ProductCategory>(`/categories/${categoryId}`, data)
  },

  remove(categoryId: number) {
    return request.delete<unknown, null>(`/categories/${categoryId}`)
  },
}
