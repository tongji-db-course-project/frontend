export interface DateRangeQuery {
  startDate?: string
  endDate?: string
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
