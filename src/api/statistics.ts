import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { DateRangeQuery, DailySettlement, InventoryStatistics, ProductRankResult, ProfitStatistics } from '../types/statistics'

export const statisticsApi = {
  getDailySettlements(params: DateRangeQuery & { page?: number; size?: number }) {
    return request.get<unknown, PageResult<DailySettlement>>('/daily-settlements', { params })
  },
  getProductRanking(params: DateRangeQuery & { limit?: number }) {
    return request.get<unknown, ProductRankResult>('/statistics/products', { params })
  },
  getProfit(params: DateRangeQuery & { groupBy?: 'day' | 'week' | 'month' }) {
    return request.get<unknown, ProfitStatistics>('/statistics/profit', { params })
  },
  getInventory() {
    return request.get<unknown, InventoryStatistics>('/statistics/inventory')
  },
}
