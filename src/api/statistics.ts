import request from '../utils/request'
import type { DateRangeQuery, SalesStatistics, MonthlySalesStatistics, ProductRankItem, ProfitStatistics, InventoryStatistics, MemberStatistics } from '../types/statistics'

export const statisticsApi = {
  getDailySales(params: DateRangeQuery) {
    return request.get<unknown, SalesStatistics[]>('/statistics/sales/daily', { params })
  },
  getMonthlySales(params: DateRangeQuery) {
    return request.get<unknown, MonthlySalesStatistics[]>('/statistics/sales/monthly', { params })
  },
  getProductRank(params: DateRangeQuery) {
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
