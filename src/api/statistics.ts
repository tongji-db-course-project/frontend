import request from '../utils/request'
import type {
  DateRangeQuery,
  DailySalesStatistics,
  InventoryStatistics,
  MemberStatistics,
  ProductRankItem,
  ProfitStatistics,
  ProductProfitRank,
  InventoryTurnover,
  DailySettlement,
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
  getProductProfitRank(params: Required<DateRangeQuery>) {
    return request.get<unknown, ProductProfitRank[]>('/statistics/products/profit-rank', { params })
  },
  getInventoryTurnover(params: Required<DateRangeQuery>) {
    return request.get<unknown, InventoryTurnover[]>('/statistics/inventory/turnover', { params })
  },
  getDailySettlement(date: string) {
    return request.get<unknown, DailySettlement>(`/statistics/daily-settlements/${date}`)
  },
  generateDailySettlement(date: string) {
    return request.post<unknown, DailySettlement>(`/statistics/daily-settlements/${date}`)
  },
}
