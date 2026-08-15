import request from '../utils/request'
import type {
  DateRangeQuery,
  DailySalesStatistics,
  InventoryStatistics,
  MemberStatistics,
  ProductRankItem,
  ProfitStatistics,
} from '../types/statistics'

export const statisticsApi = {
  getDailySales(params: DateRangeQuery) {
    return request.get<unknown, DailySalesStatistics[]>('/statistics/sales/daily', { params })
  },
  getProductRanking(params: DateRangeQuery) {
    return request.get<unknown, ProductRankItem[]>('/statistics/products/rank', { params })
  },
  getProfit(params: DateRangeQuery) {
    return request.get<unknown, ProfitStatistics>('/statistics/profit', { params })
  },
  getInventory() {
    return request.get<unknown, InventoryStatistics>('/statistics/inventory')
  },
  getMemberStatistics(params?: DateRangeQuery) {
    return request.get<unknown, MemberStatistics>('/statistics/members', { params })
  },
}
