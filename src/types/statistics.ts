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

export interface MemberStatistics {
  memberCount: number
  activeMemberCount: number
  memberSaleAmount: number
  averageSaleAmount: number
}

export interface ProductProfitRank {
  productId: number
  productName: string
  netSaleQuantity: number
  netSaleAmount: number
  purchaseCost: number
  grossProfit: number
  grossProfitRate: number
  profitContributionRate: number
}

export interface InventoryTurnover {
  productId: number
  productName: string
  soldQuantity: number
  beginningStock: number
  endingStock: number
  averageStock: number
  turnoverTimes: number
  stagnant: boolean
}

export interface DailySettlement {
  settlementId: number
  settlementDate: string
  totalSales: number
  refundAmount: number
  netSales: number
  cashAmount: number
  wechatAmount: number
  alipayAmount: number
  promotionDiscount: number
  memberDiscount: number
  couponDeduct: number
  pointDeduct: number
  pointConsumed: number
  orderCount: number
  status: string
  createTime?: string | null
}
