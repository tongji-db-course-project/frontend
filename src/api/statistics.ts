import request from '../utils/request'
import type {
  DateRangeQuery,
  DailySalesStatistics,
  InventoryStatistics,
  InventoryTurnoverItem,
  InventoryTurnoverPageResult,
  InventoryTurnoverQuery,
  MemberStatistics,
  ProductRankItem,
  ProfitStatistics,
} from '../types/statistics'

const normalizeTurnoverItem = (item: Partial<InventoryTurnoverItem> & Record<string, any>): InventoryTurnoverItem => ({
  productId: item.productId ?? 0,
  productName: item.productName ?? '',
  saleQuantity: Number(item.saleQuantity ?? item.soldQuantity ?? item.salesQuantity ?? item.saleQty ?? item.soldQty ?? 0),
  openingStock: Number(item.openingStock ?? item.beginningStock ?? item.beginStock ?? item.openingInventory ?? 0),
  closingStock: Number(item.closingStock ?? item.endingStock ?? item.endStock ?? item.endingInventory ?? 0),
  averageStock: Number(item.averageStock ?? item.avgStock ?? 0),
  turnoverTimes: Number(item.turnoverTimes ?? item.turnoverCount ?? item.turnover ?? 0),
  stagnant: Boolean(item.stagnant ?? item.isStagnant ?? false),
  status: (item.status ?? 'normal') as InventoryTurnoverItem['status'],
  daysOfInventory: item.daysOfInventory ?? null,
})

const normalizeTurnoverResult = (result: Partial<InventoryTurnoverPageResult> | InventoryTurnoverItem[] | undefined): InventoryTurnoverPageResult => {
  const list = Array.isArray(result) ? result : result?.list ?? []
  const total = Number(result && !Array.isArray(result) ? (result.total ?? result.count ?? list.length) : list.length)
  return {
    list: list.map(item => normalizeTurnoverItem(item as Partial<InventoryTurnoverItem> & Record<string, any>)),
    total,
    count: Number(result && !Array.isArray(result) ? (result.count ?? result.total ?? list.length) : list.length),
    page: Number(result && !Array.isArray(result) ? (result.page ?? 1) : 1),
    size: Number(result && !Array.isArray(result) ? (result.size ?? result.pageSize ?? 20) : 20),
    pageSize: Number(result && !Array.isArray(result) ? (result.pageSize ?? result.size ?? 20) : 20),
  }
}

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
  async getInventoryTurnover(params: InventoryTurnoverQuery) {
    const result = await request.get<unknown, InventoryTurnoverPageResult>('/statistics/inventory/turnover', {
      params: {
        ...params,
        avgMethod: 'simple',
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      },
    })
    return normalizeTurnoverResult(result)
  },
  getMemberStatistics(params?: DateRangeQuery) {
    return request.get<unknown, MemberStatistics>('/statistics/members', { params })
  },
}
