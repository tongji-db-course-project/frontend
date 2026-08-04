import type { PageQuery } from './common'

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
