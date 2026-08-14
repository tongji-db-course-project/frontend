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
