export interface DateRangeQuery {
  startDate?: string
  endDate?: string
}

export interface InventoryTurnoverQuery extends DateRangeQuery {
  periodType?: 'month' | 'quarter' | 'halfYear' | 'year' | 'custom'
  productId?: number
  categoryId?: number
  avgMethod?: 'simple'
  slowThreshold?: number
  page?: number
  pageSize?: number
}

export interface InventoryTurnoverItem {
  productId: number
  productName: string
  saleQuantity: number
  soldQuantity?: number
  openingStock: number
  beginningStock?: number
  closingStock: number
  endingStock?: number
  averageStock: number
  turnoverTimes: number
  stagnant: boolean
  status: 'normal' | 'slow' | 'aged'
  daysOfInventory?: number | null
}

export interface InventoryTurnoverPageResult {
  list: InventoryTurnoverItem[]
  total?: number
  count?: number
  page?: number
  size?: number
  pageSize?: number
}

export interface SalesStatistics {
  statDate: string
  orderCount: number
  totalAmount: number
  paidAmount: number
  refundAmount: number
  netAmount: number
}

export interface MonthlySalesStatistics {
  month: string
  orderCount: number
  totalAmount: number
  paidAmount: number
  refundAmount: number
  netAmount: number
}

export interface DailySalesStatistics {
  statDate: string
  orderCount: number
  totalAmount: number
  paidAmount: number
  refundAmount: number
  netAmount: number
}

export interface ProductRankItem {
  productId: number
  productName: string
  saleQuantity: number
  saleAmount: number
}

export interface ProfitStatistics {
  totalSaleAmount: number
  totalPurchaseCost: number
  grossProfit: number
  grossProfitRate: number
}

export interface InventoryStatistics {
  productCount: number
  totalStock: number
  warningProductCount: number
  warehouseCount: number
}

export interface MemberStatistics {
  memberCount: number
  activeMemberCount: number
  memberSaleAmount: number
  averageSaleAmount: number
}
