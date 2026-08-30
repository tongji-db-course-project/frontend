import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { SettlementQuery, SupplierSettlement } from '../types/settlement'

type RawSettlement = Omit<SupplierSettlement, 'purchaseNo'> & {
  purchaseNo?: string
  purchaseCode?: string
}

const normalizeSettlement = (item: RawSettlement): SupplierSettlement => ({
  ...item,
  purchaseNo: item.purchaseNo ?? item.purchaseCode,
})

export const settlementApi = {
  async getList(params: SettlementQuery) {
    const result = await request.get<unknown, PageResult<RawSettlement>>('/settlements', { params })
    const list = (result?.list ?? []).map(normalizeSettlement)
    return { ...result, list, total: result?.total ?? list.length } satisfies PageResult<SupplierSettlement>
  },
  async getDetail(settlementId: number) {
    const result = await request.get<unknown, RawSettlement>(`/settlements/${settlementId}`)
    return normalizeSettlement(result)
  },
  async pay(settlementId: number, paidAmount: number, remark?: string) {
    const result = await request.put<unknown, RawSettlement>(`/settlements/${settlementId}/pay`, { paidAmount, remark })
    return normalizeSettlement(result)
  },
}
