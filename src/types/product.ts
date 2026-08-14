import type { PageQuery } from './common'

export interface ProductListItem {
  productId: number
  productName: string
  barcode?: string | null
  specification?: string | null
  purchasePrice?: number | null
  salePrice?: number | null
  stockWarning?: number | null
  unit?: string | null
  status?: string | null
  categoryId: number
  categoryName?: string | null
  supplierId: number
  supplierName?: string | null
  currentStock: number
}

export interface Product {
  productId: number
  categoryId: number
  supplierId: number
  productName: string
  barcode: string
  specification: string
  purchasePrice: number
  salePrice: number
  stockWarning: number
  unit: string
  status: string
}

export type ProductPayload = Omit<Product, 'productId'>

export type ProductQuery = PageQuery
