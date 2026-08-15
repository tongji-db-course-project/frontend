import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { SettlementQuery, SupplierSettlement } from '../types/settlement'

export const settlementApi = {
  getList(params: SettlementQuery) {
    return request.get<unknown, PageResult<SupplierSettlement>>('/settlements', { params })
  },
  getDetail(settlementId: number) {
    return request.get<unknown, SupplierSettlement>(`/settlements/${settlementId}`)
  },
}
