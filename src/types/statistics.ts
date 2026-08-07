export interface DateRangeQuery {
  startDate?: string
  endDate?: string
}

export interface DailySettlement {
  settlementId: number
  settlementDate: string
  totalSales: number
  cashAmount: number
  wechatAmount: number
  alipayAmount: number
  promotionDiscount: number
  memberDiscount: number
  couponDeduct: number
  pointDeduct: number
  pointConsumed: number
  orderCount: number
  status: '已生成' | '已确认' | string
  createTime?: string | null
}

export interface ProductRankItem {
  productId: number
  productName: string
  saleQuantity: number
  saleAmount: number
  grossProfit?: number
  rank: number
}

export interface ProductRankResult {
  quantityRanking: ProductRankItem[]
  amountRanking: ProductRankItem[]
}

export interface ProfitTrendItem {
  date: string
  salesAmount: number
  costAmount: number
  grossProfit: number
}

export interface ProfitStatistics {
  totalSales: number
  totalCost: number
  grossProfit: number
  grossMargin: number
  trend: ProfitTrendItem[]
}

export interface InventoryStatistics {
  totalProducts: number
  warningProducts: number
  outOfStockProducts: number
  totalStockValue?: number
  warehouseDistribution: Array<{ name: string; value: number }>
  categoryDistribution: Array<{ name: string; value: number }>
  warningRanking: Array<{ productName: string; currentStock: number; stockWarning: number }>
}
